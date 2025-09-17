document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('cameraVideo');
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(stream => { video.srcObject = stream; })
    .catch(err => console.error("Impossibile accedere alla camera:", err));

  const container = document.getElementById('pieces');
  const camera = document.getElementById('camera');
  const center = document.getElementById('center');
  const centerText = document.getElementById('centerText');
  const centerPos = {x:0, y:1.5, z:-1};

  let selectedPiece = null;
  let offset = new THREE.Vector3();
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const zFixed = -1;

  const pieces = [];
  const models = [
    'models/piece1.glb',
    'models/piece2.glb',
    'models/piece3.glb',
    'models/piece4.glb',
    'models/piece5.glb',
    'models/piece6.glb'
  ];

  const raggio = 1.5;        // disposizione circolare
  const pezzoScale = 0.2;    // scala più piccola per i modelli

  // Creazione pezzi GLB in cerchio
  for (let i = 0; i < models.length; i++) {
    const angle = (i / models.length) * Math.PI * 2;
    const x = Math.cos(angle) * raggio;
    const y = Math.sin(angle) * raggio + 1.5;

    const piece = document.createElement('a-entity');
    piece.setAttribute('gltf-model', models[i]);
    piece.setAttribute('position', {x: x, y: y, z: zFixed});
    piece.setAttribute('scale', {x: pezzoScale, y: pezzoScale, z: pezzoScale});

    piece.addEventListener('model-loaded', () => console.log('Caricato', models[i]));

    container.appendChild(piece);
    pieces.push(piece);
  }

  function updateMouse(event){
    if(event.touches){
      mouse.x = (event.touches[0].clientX / window.innerWidth)*2-1;
      mouse.y = -(event.touches[0].clientY / window.innerHeight)*2+1;
    } else{
      mouse.x = (event.clientX / window.innerWidth)*2-1;
      mouse.y = -(event.clientY / window.innerHeight)*2+1;
    }
  }

  function onPointerDown(event){
    updateMouse(event);
    raycaster.setFromCamera(mouse, camera.getObject3D('camera'));
    const intersects = raycaster.intersectObjects(pieces.map(p => p.object3D), true);
    if(intersects.length>0){
      selectedPiece = intersects[0].object.el;
      const intersectionPoint = new THREE.Vector3();
      raycaster.ray.at((zFixed - raycaster.ray.origin.z)/raycaster.ray.direction.z, intersectionPoint);
      offset.copy(selectedPiece.object3D.position).sub(intersectionPoint);
    }
  }

  function onPointerMove(event){
    if(!selectedPiece) return;
    updateMouse(event);
    raycaster.setFromCamera(mouse, camera.getObject3D('camera'));
    const intersectionPoint = new THREE.Vector3();
    raycaster.ray.at((zFixed - raycaster.ray.origin.z)/raycaster.ray.direction.z, intersectionPoint);

    selectedPiece.setAttribute('position',{
      x: intersectionPoint.x + offset.x,
      y: intersectionPoint.y + offset.y,
      z: zFixed
    });
  }

  function checkAllAtCenter(){
    return pieces.every(p => {
      const pos = p.getAttribute('position');
      const distanza = Math.sqrt((pos.x - centerPos.x)**2 + (pos.y - centerPos.y)**2);
      return distanza < 0.6;
    });
  }

  function onPointerUp(){
    if(!selectedPiece) return;

    const pos = selectedPiece.getAttribute('position');
    const distanzaCentro = Math.sqrt((pos.x - centerPos.x)**2 + (pos.y - centerPos.y)**2);

    if(distanzaCentro < 0.6){
      // Animazione verso il centro
      selectedPiece.setAttribute('animation__move', {
        property: 'position',
        to: `${centerPos.x} ${centerPos.y} ${centerPos.z}`,
        dur: 500,
        easing: 'easeOutQuad'
      });
      selectedPiece.setAttribute('animation__scale', {
        property: 'scale',
        to: '0.5 0.5 0.5',
        dur: 500,
        easing: 'easeOutQuad'
      });

      centerText.setAttribute('visible','false');
    }

    selectedPiece = null;

    setTimeout(() => {
      if(checkAllAtCenter()){
        // Rimuovi tutti i pezzi originali
        pieces.forEach(p => {
          if(p.parentNode) p.parentNode.removeChild(p);
        });

        // Crea la sfera finale centrale
        const finalShape = document.createElement('a-sphere');
        finalShape.setAttribute('color','#FFD700');
        finalShape.setAttribute('position',{...centerPos});
        finalShape.setAttribute('radius',0.5);
        center.appendChild(finalShape);

        // Animazione di fluttuazione
        finalShape.setAttribute('animation__float', {
          property: 'position',
          dir: 'alternate',
          dur: 1000,
          easing: 'easeInOutSine',
          loop: true,
          to: `${centerPos.x} ${centerPos.y + 0.3} ${centerPos.z}`
        });
      }
    },600);
  }

  window.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);

  window.addEventListener('touchstart', onPointerDown, {passive:false});
  window.addEventListener('touchmove', onPointerMove, {passive:false});
  window.addEventListener('touchend', onPointerUp);
});

