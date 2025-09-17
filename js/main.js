document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('pieces');
  const cameraEl = document.getElementById('camera');

  let selectedBox = null;
  let zOffset = -1; // distanza davanti alla camera

  // Creazione cubi
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

  // Quando il dito tocca un cubo, lo seleziono
  cameraEl.addEventListener('raycaster-intersection', evt => {
    if (!selectedBox && evt.detail.els.length > 0) {
      selectedBox = evt.detail.els[0];
    }
  });

  // Spostamento con il dito
  window.addEventListener('touchmove', evt => {
    if (!selectedBox) return;

    const touch = evt.touches[0];
    const xNorm = (touch.clientX / window.innerWidth) * 2 - 1;
    const yNorm = -(touch.clientY / window.innerHeight) * 2 + 1;

    const cam = cameraEl.getObject3D('camera');
    if (!cam) return;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera({ x: xNorm, y: yNorm }, cam);

    const intersectionPoint = new THREE.Vector3();
    raycaster.ray.at(
      (zOffset - raycaster.ray.origin.z) / raycaster.ray.direction.z,
      intersectionPoint
    );

    if (intersectionPoint) {
      selectedBox.object3D.position.set(
        intersectionPoint.x,
        intersectionPoint.y,
        zOffset
      );
    }
  });

  // Quando sollevo il dito, rilascio il cubo
  window.addEventListener('touchend', () => {
    selectedBox = null;
  });
});
