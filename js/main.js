document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('pieces');
  const sceneEl = document.querySelector('a-scene');
  const cameraEl = document.getElementById('camera');

  let selectedBox = null;
  const raycaster = new THREE.Raycaster();
  const zFixed = -2;

  // crea cubi
  for (let i = 0; i < 6; i++) {
    const box = document.createElement('a-box');
    box.setAttribute('depth', '0.3');
    box.setAttribute('height', '0.3');
    box.setAttribute('width', '0.3');
    box.setAttribute('color', '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'));

    const x = (i - 2.5) * 0.6;
    const y = 0.5;
    box.setAttribute('position', `${x} ${y} ${zFixed}`);

    box.setAttribute('class', 'draggable');
    container.appendChild(box);
  }

  function getObjects() {
    return Array.from(container.children).map(c => c.object3D);
  }

  function setRayFromCenter() {
    const cam = cameraEl.getObject3D('camera');
    if (!cam) return false;
    raycaster.setFromCamera({x: 0, y: 0}, cam);
    return true;
  }

  function getIntersection() {
    const originZ = raycaster.ray.origin.z;
    const dirZ = raycaster.ray.direction.z;
    if (Math.abs(dirZ) < 1e-6) return null;
    const t = (zFixed - originZ) / dirZ;
    const point = new THREE.Vector3();
    raycaster.ray.at(t, point);
    return point;
  }

  // selezione in AR/VR
  sceneEl.addEventListener('selectstart', () => {
    if (!setRayFromCenter()) return;
    const intersects = raycaster.intersectObjects(getObjects(), true);
    if (intersects.length > 0) {
      selectedBox = intersects[0].object.el;
    }
  });

  sceneEl.addEventListener('selectend', () => {
    selectedBox = null;
  });

  // loop XR per aggiornare posizione del cubo
  sceneEl.addEventListener('enter-vr', () => {
    const session = sceneEl.renderer.xr.getSession();
    if (!session) return;

    function onXRFrame(t, frame) {
      if (selectedBox && setRayFromCenter()) {
        const ip = getIntersection();
        if (ip) {
          selectedBox.object3D.position.set(ip.x, ip.y, zFixed);
        }
      }
      session.requestAnimationFrame(onXRFrame);
    }
    session.requestAnimationFrame(onXRFrame);
  });
});



