// main.js: genera 6 cubi e li rende trascinabili con il componente aframe-draggable-component

document.addEventListener('DOMContentLoaded', () => {
  const piecesContainer = document.getElementById('pieces');

  for (let i = 0; i < 6; i++) {
    const box = document.createElement('a-box');
    box.setAttribute('depth', '0.25');
    box.setAttribute('height', '0.25');
    box.setAttribute('width', '0.25');

    // colore valido a 6 cifre
    const color = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6,'0');
    box.setAttribute('color', color);

    // posizione iniziale ben visibile davanti alla camera
    const x = (i - 2.5) * 0.35; // distribuiti orizzontalmente
    const y = 0.6;
    const z = -2;
    box.setAttribute('position', `${x} ${y} ${z}`);

    // rende il cubo trascinabile (attributo richiesto dal componente)
    // alcune versioni accettano draggable="true" o solo draggable; qui usiamo draggable="true"
    box.setAttribute('draggable', 'true');

    // id per eventuali logiche future
    box.id = 'cube' + i;

    piecesContainer.appendChild(box);
  }
});

