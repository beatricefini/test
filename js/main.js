document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('pieces');
  const numCubi = 6;
  const cubi = [];

  // Creazione cubi
  for (let i = 0; i < numCubi; i++) {
    const box = document.createElement('a-box');
    box.setAttribute('depth', '0.3');
    box.setAttribute('height', '0.3');
    box.setAttribute('width', '0.3');
    const color = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6,'0');
    box.setAttribute('color', color);
    box.setAttribute('position', `${(i-2.5)*0.5} 1.2 -1`);
    box.id = 'cube'+i;

    // Click handler per il merge
    box.addEventListener('click', () => {
      const index = cubi.indexOf(box);
      if (index < cubi.length - 1) {
        const nextBox = cubi[index+1];
        // merge: per ora spostiamo il cubo selezionato sopra il prossimo
        box.object3D.position.copy(nextBox.object3D.position);
        box.setAttribute('color', '#f00'); // cambio colore per indicare merge
        console.log(`Merged cube ${index} with cube ${index+1}`);
      }
    });

    cubi.push(box);
    container.appendChild(box);
  }
});
