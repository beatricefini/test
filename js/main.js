// main.js pronto per aggiungere logica drag/merge
// Per esempio, potrai selezionare i cubi così:
// const cube0 = document.getElementById('cube0');

// Componente A-Frame per drag con mouse e touch
AFRAME.registerComponent('drag-rotate', {
  init: function () {
    const el = this.el;
    let isDragging = false;
    let startX, startZ;

    // Mouse
    el.addEventListener('mousedown', (evt) => {
      isDragging = true;
      startX = evt.clientX;
      startZ = evt.clientY;
    });
    window.addEventListener('mouseup', () => isDragging = false);
    window.addEventListener('mousemove', (evt) => {
      if (!isDragging) return;
      const deltaX = (evt.clientX - startX) / 100;
      const deltaZ = (evt.clientY - startZ) / 100;
      const pos = el.getAttribute('position');
      el.setAttribute('position', { x: pos.x + deltaX, y: pos.y, z: pos.z + deltaZ });
      startX = evt.clientX;
      startZ = evt.clientY;
    });

    // Touch
    el.addEventListener('touchstart', (evt) => {
      isDragging = true;
      startX = evt.touches[0].clientX;
      startZ = evt.touches[0].clientY;
    });
    el.addEventListener('touchend', () => isDragging = false);
    el.addEventListener('touchmove', (evt) => {
      if (!isDragging) return;
      const deltaX = (evt.touches[0].clientX - startX) / 100;
      const deltaZ = (evt.touches[0].clientY - startZ) / 100;
      const pos = el.getAttribute('position');
      el.setAttribute('position', { x: pos.x + deltaX, y: pos.y, z: pos.z + deltaZ });
      startX = evt.touches[0].clientX;
      startZ = evt.touches[0].clientY;
    });
  }
});

// Generazione dei 6 cubi dinamicamente
document.addEventListener('DOMContentLoaded', () => {
  const piecesContainer = document.getElementById('pieces');

  for (let i = 0; i < 6; i++) {
    const box = document.createElement('a-box');
    box.setAttribute('depth', '0.2');
    box.setAttribute('height', '0.2');
    box.setAttribute('width', '0.2');

    // Colore casuale valido
    const color = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6,'0');
    box.setAttribute('color', color);

    // Posizione casuale davanti alla camera
    const x = (Math.random() - 0.5).toFixed(2);
    const y = (Math.random() * 0.5 + 0.3).toFixed(2);
    const z = (-1 - Math.random() * 0.5).toFixed(2);
    box.setAttribute('position', `${x} ${y} ${z}`);

    // Applica il drag
    box.setAttribute('drag-rotate', '');

    piecesContainer.appendChild(box);
  }
});
