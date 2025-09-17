document.addEventListener('DOMContentLoaded', () => {
  const sceneEl = document.querySelector('a-scene');
  const container = document.getElementById('pieces');
  const cameraEl = document.getElementById('camera');

  let selectedBox = null;
  let offset = new THREE.Vector3();
  const raycaster = new THREE.Raycaster();
  const zFixed = -2;
  let currentNDC = null; // posizione del dito in NDC
  let xrSession = null;

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

  function setRayFromNDC(ndc) {
    const cam = cameraEl.getObject3D('camera');
    if (!cam) return false;
    raycaster.setFromCamera(ndc, cam);
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

  function trySelectAtNDC(ndc) {
    if (!setRayFromNDC(ndc)) return false;
    const intersects = raycaster.intersectObjects(getObjects(), true);
    if (intersects.length > 0) {
      selectedBox = intersects[0].object.el;
      const ip = getIntersection();
      if (ip) offset.copy(selectedBox.object3D.position).sub(ip);
      return true;
    }
    return false;
  }

  // --- Touch su mobile (funziona anche in AR) ---
  sceneEl.addEventListener('loaded', () => {
    const canvas = sceneEl.canvas;

    canvas.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      currentNDC = new THREE.Vector2(
        (t.clientX / window.innerWidth) * 2 - 1,
        -(t.clientY / window.innerHeight) * 2 + 1
      );
      trySelectAtNDC(currentNDC);
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      currentNDC = new THREE.Vector2(
        (t.clientX / window.innerWidth) * 2 - 1,
        -(t.clientY / window.innerHeight) * 2 + 1
      );
    }, { passive: false });

    canvas.addEventListener('touchend', () => {
      selectedBox = null;
      currentNDC = null;
    }, { passive: false });
  });

  // --- Mouse per desktop (debug) ---
  window.addEventListener('mousedown', (e) => {
    const ndc = new THREE.Vector2(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    );
    tryS



