document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('pieces');

  let selectedBox = null;
  let offset = new THREE.Vector3();
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  // Crea 6 cubi colorati
  for (let i = 0; i < 6; i++) {
    const box = document.createElement('a-box');
    box.setAttribute('depth', '0.3');
    box.setAttribute('height', '0.3');
    box.setAttribute('width', '0.3');

    const color = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6,'0');
    box.setAttribute('color', color);

    // li metto sopra il marker Hiro
    box.setAttribute('position', `${(i - 2.5) * 0.6} 0.3 0`);
    box.setAttribute('class', 'draggable');
    box.id = 'cube' + i;

    container.appendChild(box);
  }

  // Calcola coordinate normalizzate del tocco/click
  function updateMouse(event) {
    if (event.touches) {
      mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
    } else {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
  }

  // Inizio trascinamento
  function onPointerDown(event) {
    updateMouse(event);
    const camera = document.querySelector('[camera]').getObject3D('camera');
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(
      Array.from(container.children).map(c => c.object3D),
      true
    );
    if (intersects.length > 0) {
      selectedBox = intersects[0].object.el;
      const intersectionPoint = intersects[0].point;
      offset.copy(selectedBox.object3D.position).sub(intersectionPoint);
    }
  }

  // Durante trascinamento
  function onPointerMove(event) {
    if (!selectedBox) return;
    updateMouse(event);
    const camera = document.querySelector('[camera]').getObject3D('camera');
    raycaster.setFromCamera(mouse, camera);

    // calcola intersezione con il piano del marker
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const point = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, point);

    if (point) {
      selectedBox.object3D.position.set(
        point.x + offset.x,
        selectedBox.object3D.position.y, // manteniamo altezza
        point.z + offset.z
      );
    }
  }

  // Fine trascinamento
  function onPointerUp() {
    selectedBox = null;
  }

  // Eventi mouse (desktop)
  window.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);

  // Eventi touch (mobile)
  window.addEventListener('touchstart', onPointerDown);
  window.addEventListener('touchmove', onPointerMove);
  window.addEventListener('touchend', onPointerUp);
});

