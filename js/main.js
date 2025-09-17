AFRAME.registerComponent('merge-handler', {
  init: function () {
    const pieces = document.getElementById('pieces');
    const cubi = [];
    let currentIndex = 0;
    const numCubi = 6;

    // Creazione cubi
    for (let i = 0; i < numCubi; i++) {
      const box = document.createElement('a-box');
      box.setAttribute('depth', '0.3');
      box.setAttribute('height', '0.3');
      box.setAttribute('width', '0.3');
      const color = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6,'0');
      box.setAttribute('color', color);
      box.setAttribute('position', `${(i-2.5)*0.5} 1.2 -1`);
      cubi.push(box);
      pieces.appendChild(box);
    }

    // Merge function
    const mergeCubes = (indexA, indexB) => {
      const cubeA = cubi[indexA];
      const cubeB = cubi[indexB];

      // Aggiorna posizione usando setAttribute per compatibilità AR
      const posB = cubeB.getAttribute('position');
      cubeA.setAttribute('position', { x: posB.x, y: posB.y, z: posB.z });

      // Cambia colore per indicare merge
      cubeA.setAttribute('color', '#f00');
    };

    // Pulsante 3D
    const mergeBtn = document.getElementById('mergeBtn');
    mergeBtn.addEventListener('click', () => {
      if (currentIndex >= cubi.length - 1) {
        alert("Tutti i cubi sono stati mergiati!");
        return;
      }
      mergeCubes(currentIndex, currentIndex + 1);
      currentIndex++;
    });
  }
});

// Applica il componente alla scena
document.querySelector('a-scene').setAttribute('merge-handler','');
