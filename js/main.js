document.addEventListener('DOMContentLoaded', () => {
  const sceneEl = document.getElementById('scene');

  sceneEl.addEventListener('loaded', () => {
    const container = document.getElementById('pieces');
    const cameraEl = document.getElementById('camera');
    const camera = cameraEl.getObject3D('camera');
    if (!camera) {
      console.error('Camera non trovata!');
      return;
    }

    initDrag(container, camera);
  });
});

function initDrag(container, camera) {
  let selectedBox = null;
  let offset = { x: 0, y: 0 };
  const zFixed = -2;

  // crea cubi
  for (let i = 0; i < 6; i++) {
    const box = document.createElement('a-box');
    box.setAttribute('depth', '0.3');
    box.setAttribute('height', '0.3');
    box.setAttribute('width', '0.3');
    box.setAttribute('color', '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6,'0'));
    const x = (i - 2.5) * 0.6;
    const y = 0.5;
    box.setAttribute('position', `${x} ${y} ${zFixed}`);
    box.classList.add('draggable');
    container.appendChild(box);
  }

  // converte coordinate touch/mouse in posizione 3D sul piano zFixed
  function getPlanePosition(clientX, clientY) {
    const rect = document.body.getBoundingClientRect();
    const ndcX = (clientX / rect.width) * 2 - 1;
    const ndcY = -(clientY / rect.height) * 2 + 1;

    const vector = new THREE.Vector3(ndcX, ndcY, 0.5);
    vector.unproject(camera);

    const dir = vector.sub(camera.position).normalize();
    const distance = (zFixed - camera.position.z) / dir.z;
    return camera.position.clone().add(dir.multiplyScalar(distance));
  }

  function onPointerDown(event) {
    event.preventDefault();
    let clientX = event.clientX, clientY = event.clientY;
    if (event.touches) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    }

    const pos = getPlanePosition(clientX, clientY);

    // seleziona cubo più vicino
    let minDist = Infinity;
    container.querySelectorAll('.draggable').forEach(box => {
      const bPos = box.object3D.position;
      const dist = bPos.distanceTo(pos);
      if (dist < 0.3 && dist < minDist) {
        selectedBox = box;
        offset.x = bPos.x - pos.x;
        offset.y = bPos.y - pos.y;
        minDist = dist;
      }
    });
  }

  function onPointerMove(event) {
    if (!selectedBox) return;
    event.preventDefault();
    let clientX = event.clientX, clientY = event.clientY;
    if (event.touches) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    }
    const pos = getPlanePosition(clientX, clientY);
    selectedBox.object3D.position.set(pos.x + offset.x, pos.y + offset.y, zFixed);
  }

  function onPointerUp() {
    selectedBox = null;
  }

  window.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);

  window.addEventListener('touchstart', onPointerDown, {passive:false});
  window.addEventListener('touchmove', onPointerMove, {passive:false});
  window.addEventListener('touchend', onPointerUp);
}

