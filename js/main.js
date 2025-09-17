document.addEventListener('DOMContentLoaded', () => {
  const scene = document.querySelector('a-scene');
  const pieces = document.getElementById('pieces');

  // Funzione per creare un cubo
  function createCube(position) {
    const box = document.createElement('a-box');
    box.setAttribute('depth', '0.3');
    box.setAttribute('height', '0.3');
    box.setAttribute('width', '0.3');

    const color = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6,'0');
    box.setAttribute('color', color);

    box.setAttribute('position', `${position.x} ${position.y} ${position.z}`);
    pieces.appendChild(box);
  }

  // AR Hit-test
  scene.addEventListener('enter-vr', () => {
    if (navigator.xr) {
      navigator.xr.requestSession('immersive-ar', { requiredFeatures: ['hit-test'] })
        .then(session => {
          scene.renderer.xr.setSession(session);

          const viewerSpace = session.requestReferenceSpace('viewer');
          const hitTestSourcePromise = session.requestHitTestSource({ space: viewerSpace });

          // Touch per posizionare cubi
          scene.addEventListener('click', async (evt) => {
            const frame = session.requestAnimationFrame(() => {});
            const hitTestSource = await hitTestSourcePromise;
            const referenceSpace = await session.requestReferenceSpace('local');

            // Ottieni la posizione del touch
            const touch = evt.detail ? evt.detail.intersection : null;
            let position = { x: 0, y: 0, z: -1 }; // fallback
            if (touch) {
              position = touch.point;
            } else {
              // posizione davanti alla camera come fallback
              const cam = document.getElementById('camera');
              const camPos = cam.object3D.position;
              position = { x: camPos.x, y: camPos.y, z: camPos.z - 1 };
            }

            createCube(position);
          });
        })
        .catch(err => console.warn('AR non disponibile:', err));
    } else {
      console.warn('WebXR non supportato sul device.');
    }
  });
});
