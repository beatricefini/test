document.addEventListener('DOMContentLoaded', async () => {
  const scene = document.querySelector('a-scene');
  const pieces = document.getElementById('pieces');

  let xrSession = null;
  let hitTestSource = null;
  let referenceSpace = null;

  // Creazione cubi iniziali
  const createCube = (position) => {
    const box = document.createElement('a-box');
    box.setAttribute('depth', '0.3');
    box.setAttribute('height', '0.3');
    box.setAttribute('width', '0.3');
    box.setAttribute('color', '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6,'0'));
    box.setAttribute('position', `${position.x} ${position.y} ${position.z}`);
    box.classList.add('draggable');
    pieces.appendChild(box);
  };

  // Funzione per inizializzare AR hit-test
  const initAR = async () => {
    if (!navigator.xr) {
      alert("AR non supportato su questo dispositivo");
      return;
    }

    xrSession = await navigator.xr.requestSession('immersive-ar', {
      requiredFeatures: ['hit-test', 'local-floor']
    });

    scene.renderer.xr.setSession(xrSession);
    referenceSpace = await xrSession.requestReferenceSpace('local-floor');

    const viewerSpace = await xrSession.requestReferenceSpace('viewer');
    hitTestSource = await xrSession.requestHitTestSource({ space: viewerSpace });

    // Touch per creare/trascinare cubi
    let selectedCube = null;
    let offset = new THREE.Vector3();

    const getHitPosition = async (event) => {
      const frame = event.frame;
      if (!hitTestSource || !referenceSpace) return null;

      const hitTestResults = frame.getHitTestResults(hitTestSource);
      if (hitTestResults.length > 0) {
        const hit = hitTestResults[0];
        const pose = hit.getPose(referenceSpace);
        return pose.transform.position;
      }
      return null;
    };

    scene.addEventListener('touchstart', async (evt) => {
      const pos = await getHitPosition(evt);
      if (!pos) return;

      // Controllo se tocchi un cubo esistente
      const touch = evt.touches[0];
      const intersects = [];
      pieces.querySelectorAll('.draggable').forEach(c => {
        const bbox = new THREE.Box3().setFromObject(c.object3D);
        const point = new THREE.Vector3(pos.x, pos.y, pos.z);
        if (bbox.containsPoint(point)) intersects.push(c);
      });

      if (intersects.length > 0) {
        selectedCube = intersects[0];
        offset.copy(selectedCube.object3D.position).sub(new THREE.Vector3(pos.x, pos.y, pos.z));
      } else {
        createCube({x: pos.x, y: pos.y, z: pos.z});
      }
    }, { passive: false });

    scene.addEventListener('touchmove', async (evt) => {
      if (!selectedCube) return;
      const pos = await getHitPosition(evt);
      if (!pos) return;
      selectedCube.object3D.position.set(pos.x + offset.x, pos.y + offset.y, pos.z + offset.z);
    }, { passive: false });

    scene.addEventListener('touchend', () => {
      selectedCube = null;
    });
  };

  // Avvia AR quando la scena entra in immersive-ar
  scene.addEventListener('enter-vr', () => {
    initAR();
  });
});
