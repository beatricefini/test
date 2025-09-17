document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('pieces');
  const mergeBtn = document.getElementById('mergeBtn');
  const cubi = [];
  let currentIndex = 0;

  // Creazione cubi iniziali
  const numCubi = 6;
  for (let i = 0; i < numCubi; i++) {
    const box = document.createElement('a-box');
    box.setAttribute('depth', '0.3');
    box.setAttribute('height', '0.3');
    box.setAttribute('width', '0.3');
    const color = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6,'0');
    box.setAttribute('color', color);
    box.setAttribute('position', `${(i-2.5)*0.5} 1.2 -1`);
    cubi.push(box);
    container.appendChild(box);
  }

  // Logica merge
  mergeBtn.addEventListener('click', () => {
    if (currentIndex >= cubi.length - 1) {
      alert("Tutti i cubi sono stati mergiati!");
      return;
    }
    const cubeA = cubi[currentIndex];
    const cubeB = cubi[currentIndex + 1];

    // Per ora: sposta cubeA sopra cubeB e cambia colore per indicare merge
    cubeA.object3D.position.copy(cubeB.object3D.position);
    cubeA.setAttribute('color', '#f00');

    console.log(`Merged cube ${currentIndex} with cube ${currentIndex+1}`);

    currentIndex++; // passa al prossimo cubo da mergiare
  });
});
