document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('pieces');
  const camera = document.getElementById('camera');

  let selectedBox = null;
  let offset = new THREE.Vector3();
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const zFixed = -2; // profondità fissa

  // Creazione cubi
  for (let i = 0; i < 6; i++) {
    const box = document.createElement('a-box');
    box.setAttribute('depth', '0.3');
    box.setAttribute('height', '0.3');
    box.setAttribute('width', '0.3');

    const color = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6,'0');
    box.setAttribute('color', color);

    const x = (i - 2.5) * 0.6;
    const y = 0.5;
    box.setAttribute('position', `${x} ${y} ${zFixed}`);

    box.setAttribute('class', 'draggable');
    box.id = 'cube' + i;

    container.appendChild(box);
  }

  // Calcola posizione normalizzata (per VR desktop con mouse)
  function updateMouse(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  // ----- 🎮 Desktop VR/Browser -----
  window.addEventListener('mousedown', (event) => {
    updateMouse(event);
    raycaster.setFromCamera(mouse, camera.getObject3D('camera'));
    const intersects = raycaster.intersectObjects(Array.from(container.children).map(c => c.object3D), true);
    if (intersects.length > 0) {
      selectedBox = intersects[0].object.el;
      const intersectionPoint = new THREE.Vector3();
      raycaster.ray.at((zFixed - raycaster.ray.origin.z) / raycaster.ray.direction.z, intersectionPoint);
      offset.copy(selectedBox.object3D.position).sub(intersectionPoint);
    }
  });

  window.addEventListener('mousemove', (event) => {
    if (!selectedBox) return;
    updateMouse(event);
    raycaster.setFromCamera(mouse, camera.getObject3D('camera'));
    const intersectionPoint = new THREE.Vector3();
    raycaster.ray.at((zFixed - raycaster.ray.origin.z) / raycaster.ray.direction.z, intersectionPoint);
    if (intersectionPoint) {
      selectedBox.object3D.position.set(
        intersectionPoint.x + offset.x,
        intersectionPoint.y + offset.y,
        zFixed
      );
    }
  });

  window.addEventListener('mouseup', () => {
    selectedBox = null;
  });

  // ----- 📱 Modalità AR (WebXR input) -----
  const sceneEl = document.querySelector('a-scene');

  sceneEl.addEventListener('enter-vr', () => {
    if (sceneEl.xrSession) {
      const session = sceneEl.xrSession;

      session.addEventListener('selectstart', (event) => {
        raycaster.setFromCamera({x: 0, y: 0}, camera.getObject3D('camera'));
        const intersects = raycaster.intersectObjects(Array.from(container.children).map(c => c.object3D), true);
        if (intersects.length > 0) {
          selectedBox = intersects[0].object.el;
          const intersectionPoint = new THREE.Vector3();
          raycaster.ray.at((zFixed - raycaster.ray.origin.z) / raycaster.ray.direction.z, intersectionPoint);
          offset.copy(selectedBox.object3D.position).sub(intersectionPoint);
        }
      });

      session.addEventListener('selectend', () => {
        selectedBox = null;
      });

      session.addEventListener('select', () => {
        if (selectedBox) {
          // Mantieni il cubo nella nuova posizione
        }
      });
    }
  });

  // Aggiornamento continuo in AR → segue il centro dello schermo
  sceneEl.addEventListener('renderstart', () => {
    sceneEl.addEventListener('tick', () => {
      if (selectedBox) {
        raycaster.setFromCamera({x: 0, y: 0}, camera.getObject3D('camera'));
        const intersectionPoint = new THREE.Vector3();
        raycaster.ray.at((zFixed - raycaster.ray.origin.z) / raycaster.ray.direction.z, intersectionPoint);
        if (intersectionPoint) {
          selectedBox.object3D.position.set(
            intersectionPoint.x + offset.x,
            intersectionPoint.y + offset.y,
            zFixed
          );
        }
      }
    });
  });
});



