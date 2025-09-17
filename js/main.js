document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('pieces');
  const cameraEl = document.getElementById('camera');

  let selectedBox = null;
  let offset = new THREE.Vector3();
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const zOffset = -1; // circa 1m davanti alla camera

  // crea 6 cubi
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

  function updateMouse(touch) {
    mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
  }

  function onTouchStart(evt) {
    const cam = cameraEl.getObject3D('camera');
    if (!cam) return;
    updateMouse(evt.touches[0]);
    raycaster.setFromCamera(mouse, cam);

    const intersects = raycaster.intersectObjects(
      Array.from(container.children).map(c => c.object3D),
      true
    );

    if (intersects.length > 0) {
      selectedBox = intersects[0].object.el;
      const intersectionPoint = new THREE.Vector3();
      raycaster.ray.at(
        (zOffset - raycaster.ray.origin.z) / raycaster.ray.direction.z,
        intersectionPoint
      );
      offset.copy(selectedBox.object3D.position).sub(intersectionPoint);
    }
  }

  function onTouchMove(evt) {
    if (!selectedBox) return;
    const cam = cameraEl.getObject3D('camera');
    if (!cam) return;
    updateMouse(evt.touches[0]);
    raycaster.setFromCamera(mouse, cam);

    const intersectionPoint = new THREE.Vector3();
    raycaster.ray.at(
      (zOffset - raycaster.ray.origin.z) / raycaster.ray.direction.z,
      intersectionPoint
    );

    selectedBox.object3D.position.set(
      intersectionPoint.x + offset.x,
      intersectionPoint.y + offset.y,
      zOffset
    );
  }

  function onTouchEnd() {
    selectedBox = null;
  }

  window.addEventListener('touchstart', onTouchStart);
  window.addEventListener('touchmove', onTouchMove);
  window.addEventListener('touchend', onTouchEnd);
});
