document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('pieces');
  const cameraEl = document.getElementById('camera');

  let selectedBox = null;
  let offset = new THREE.Vector3();
  let zOffset = -1; // distanza davanti alla camera

  // Crea i cubi davanti all'utente
  for (let i = 0; i < 6; i++) {
    const box = document.createElement('a-box');
    box.setAttribute('depth', '0.3');
    box.setAttribute('height', '0.3');
    box.setAttribute('width', '0.3');

    const color = '#' + Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0');
    box.setAttribute('color', color);

    const x = (i - 2.5) * 0.6;
    const y = 0.5;
    box.setAttribute('position', `${x} ${y} ${zOffset}`);
    box.setAttribute('class', 'draggable');

    container.appendChild(box);
  }

  // Funzione per calcolare posizione dal touch
  function getWorldPositionFromTouch(touch) {
    const xNorm = (touch.clientX / window.innerWidth) * 2 - 1;
    const yNorm = -(touch.clientY / window.innerHeight) * 2 + 1;

    const cam = cameraEl.getObject3D('camera');
    if (!cam) return null;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera({ x: xNorm, y: yNorm }, cam);

    const point = new THREE.Vector3();
    raycaster.ray.at(
      (zOffset - raycaster.ray.origin.z) / raycaster.ray.direction.z,
      point
    );
    return point;
  }

  // Selezione cubo con touchstart
  window.addEventListener('touchstart', evt => {
    const touch = evt.touches[0];
    const point = getWorldPositionFromTouch(touch);
    if (!point) return;

    // Trova il cubo più vicino al punto toccato
    let minDist = Infinity;
    let nearest = null;
    container.querySelectorAll('.draggable').forEach(box => {
      const pos = box.object3D.position;
      const dist = pos.distanceTo(point);
      if (dist < 0.3 && dist < minDist) {
        nearest = box;
        minDist = dist;
      }
    });

    if (nearest) {
      selectedBox = nearest;
      offset.copy(selectedBox.object3D.position).sub(point);
    }
  });

  // Movimento cubo
  window.addEventListener('touchmove', evt => {
    if (!selectedBox) return;
    const touch = evt.touches[0];
    const point = getWorldPositionFromTouch(touch);
    if (!point) return;

    selectedBox.object3D.position.set(
      point.x + offset.x,
      point.y + offset.y,
      zOffset
    );
  });

  // Rilascio cubo
  window.addEventListener('touchend', () => {
    selectedBox = null;
  });
});
