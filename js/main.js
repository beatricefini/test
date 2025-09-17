AFRAME.registerComponent('drag-cursor', {
  init: function () {
    const el = this.el; // entità cubo
    const sceneEl = document.querySelector('a-scene');
    const camera = document.getElementById('camera').getObject3D('camera');

    let selected = false;
    let offset = new THREE.Vector3();
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const zFixed = -2;

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
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(el.object3D, true);
      if (intersects.length > 0) {
        selected = true;
        const intersectionPoint = new THREE.Vector3();
        raycaster.ray.at((zFixed - raycaster.ray.origin.z) / raycaster.ray.direction.z, intersectionPoint);
        offset.copy(el.object3D.position).sub(intersectionPoint);
      }
    }

    function onPointerMove(event) {
      if (!selected) return;
      updateMouse(event);
      raycaster.setFromCamera(mouse, camera);
      const intersectionPoint = new THREE.Vector3();
      raycaster.ray.at((zFixed - raycaster.ray.origin.z) / raycaster.ray.direction.z, intersectionPoint);
      el.object3D.position.set(
        intersectionPoint.x + offset.x,
        intersectionPoint.y + offset.y,
        zFixed
      );
    }

    function onPointerUp() {
      selected = false;
    }

    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchstart', onPointerDown, { passive: false });
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', onPointerUp);
  }
});

// Creazione cubi
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('pieces');

  for (let i = 0; i < 6; i++) {
    const box = document.createElement('a-box');
    box.setAttribute('depth', '0.3');
    box.setAttribute('height', '0.3');
    box.setAttribute('width', '0.3');

    const color = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    box.setAttribute('color', color);

    const x = (i - 2.5) * 0.6;
    const y = 0.5;
    const z = -2;
    box.setAttribute('position', `${x} ${y} ${z}`);

    box.setAttribute('drag-cursor', ''); // aggiunge il componente drag
    container.appendChild(box);
  }
});
