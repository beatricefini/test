document.addEventListener('DOMContentLoaded', () => {
  const scene = document.querySelector('a-scene');
  const pieces = document.getElementById('pieces');
  const camera = document.getElementById('camera');

  // Creazione cubi iniziali davanti alla camera (fallback desktop/AR)
  for (let i = 0; i < 6; i++) {
    const box = document.createElement('a-box');
    box.setAttribute('depth', '0.3');
    box.setAttribute('height', '0.3');
    box.setAttribute('width', '0.3');
    box.setAttribute('color', '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6,'0'));
    box.setAttribute('position', `${(i-2.5)*0.5} 1.2 -1`);
    box.classList.add('draggable');
    pieces.appendChild(box);
  }

  // Drag component compatibile desktop/mobile
  AFRAME.registerComponent('drag-cursor', {
    init: function () {
      const el = this.el;
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      let selected = false;
      let offset = new THREE.Vector3();

      function updateMouse(event) {
        if (event.touches) {
          mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
        } else {
          mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        }
      }

      function onPointerDown(event) {
        updateMouse(event);
        raycaster.setFromCamera(mouse, camera.getObject3D('camera'));
        const intersects = raycaster.intersectObject(el.object3D, true);
        if (intersects.length > 0) {
          selected = true;
          const intersectionPoint = new THREE.Vector3();
          raycaster.ray.at((el.object3D.position.z - raycaster.ray.origin.z) / raycaster.ray.direction.z, intersectionPoint);
          offset.copy(el.object3D.position).sub(intersectionPoint);
        }
      }

      function onPointerMove(event) {
        if (!selected) return;
        updateMouse(event);
        raycaster.setFromCamera(mouse, camera.getObject3D('camera'));
        const intersectionPoint = new THREE.Vector3();
        raycaster.ray.at((el.object3D.position.z - raycaster.ray.origin.z) / raycaster.ray.direction.z, intersectionPoint);
        el.object3D.position.set(
          intersectionPoint.x + offset.x,
          intersectionPoint.y + offset.y,
          el.object3D.position.z
        );
      }

      function onPointerUp() { selected = false; }

      window.addEventListener('mousedown', onPointerDown);
      window.addEventListener('mousemove', onPointerMove);
      window.addEventListener('mouseup', onPointerUp);
      window.addEventListener('touchstart', onPointerDown, { passive:false });
      window.addEventListener('touchmove', onPointerMove, { passive:false });
      window.addEventListener('touchend', onPointerUp);
    }
  });

  // Applica drag a tutti i cubi
  pieces.querySelectorAll('.draggable').forEach(c => c.setAttribute('drag-cursor',''));

  // Funzione AR mobile con hit-test
  scene.addEventListener('enter-vr', async () => {
    if (!navigator.xr) return;
    try {
      const session = await navigator.xr.requestSession('immersive-ar', { requiredFeatures: ['hit-test','local-floor'] });
      scene.renderer.xr.setSession(session);
      const referenceSpace = await session.requestReferenceSpace('local-floor');
      const viewerSpace = await session.requestReferenceSpace('viewer');
      const hitTestSource = await session.requestHitTestSource({ space: viewerSpace });

      let selectedCube = null;
      let offset = new THREE.Vector3();

      const getHitPosition = (frame) => {
        const hitTestResults = frame.getHitTestResults(hitTestSource);
        if (hitTestResults.length > 0) {
          const pose = hitTestResults[0].getPose(referenceSpace);
          return pose.transform.position;
        }
        return null;
      };

      scene.addEventListener('touchstart', (evt) => { selectedCube = null; });
      scene.addEventListener('touchmove', (evt) => {
        // opzionale: puoi aggiungere logica hit-test per trascinare cubi in AR
      });
    } catch(e) { console.warn('AR non disponibile:', e); }
  });
});
