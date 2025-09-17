document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('pieces');

  const zOffset = -1; // cubi davanti alla camera

  for (let i = 0; i < 6; i++) {
    const box = document.createElement('a-box');
    box.setAttribute('depth', '0.3');
    box.setAttribute('height', '0.3');
    box.setAttribute('width', '0.3');
    box.setAttribute('color', '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'));

    const x = (i - 2.5) * 0.6;
    const y = 0.5;
    box.setAttribute('position', `${x} ${y} ${zOffset}`);

    container.appendChild(box);
  }
});
