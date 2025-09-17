document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('pieces');
  const camera = document.getElementById('camera');

  let selectedBox = null;
  let offset = new THREE.Vector3();
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const zFixed = -1; // profondità fissa del piano

  // Creazione cubi
  for (let i = 0; i < 6; i++) {
    const box = document.createElement('a-box');
    box.setAttribute('depth', '0.3');
    box.setAttribute('height', '0.3');
    box.setAttribute('width', '0.3');
    const color = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6,'0');
    box.setAttribute('color', color);
    box.setAttribute('position', `${(i-2.5)*0.5} 1.2 ${zFixed}`);
    box.classList.add('draggable');
    container.appendChild(box);
  }

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
    const intersects = raycaster.intersectObjects(
      Array.from(container.children).map(c => c.object3D), true
    );
    if (intersects.length > 0) {
      selectedBox = intersects[0].object.el;
      const intersectionPoint = new THREE.Vector3();
      raycaster.ray.at((zFixed - raycaster.ray.origin.z) / raycaster.ray.direction.z, intersectionPoint);
      offset.copy(selectedBox.object3D.position).sub(intersectionPoint);
    }
  }

  function onPointerMove(event) {
    if (!selectedBox) return;
    updateMouse(event);
    raycaster.setFromCamera(mouse, camera.getObject3D('camera'));
    const intersectionPoint = new THREE.Vector3();
    raycaster.ray.at((zFixed - raycaster.ray.origin.z) / raycaster.ray.direction.z, intersectionPoint);
    selectedBox.setAttribute('position', {
      x: intersectionPoint.x + offset.x,
      y: intersectionPoint.y + offset.y,
      z: zFixed
    });
  }

  function onPointerUp() {
    selectedBox = null;
  }

  window.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);

  window.addEventListener('touchstart', onPointerDown, { passive:false });
  window.addEventListener('touchmove', onPointerMove, { passive:false });
  window.addEventListener('touchend', onPointerUp);
});

