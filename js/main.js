// main.js — drag robusto per Desktop e WebXR AR
document.addEventListener('DOMContentLoaded', () => {
  const sceneEl = document.querySelector('a-scene');
  const container = document.getElementById('pieces');
  const cameraEl = document.getElementById('camera');

  // variabili
  let selectedBox = null;
  let offset = new THREE.Vector3();
  const raycaster = new THREE.Raycaster();
  const zFixed = -2; // manteniamo Z costante
  let lastTouchNDC = null; // normalized device coords dell'ultimo touch (se esiste)
  let xrSession = null;
  let xrLoopRequested = false;

  // crea cubi
  for (let i = 0; i < 6; i++) {
    const box = document.createElement('a-box');
    box.setAttribute('depth', '0.3');
    box.setAttribute('height', '0.3');
    box.setAttribute('width', '0.3');

    const color = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    box.setAttribute('color', color);

    const x = (i - 2.5) * 0.6;
    const y = 0.5;
    box.setAttribute('position', `${x} ${y} ${zFixed}`);

    box.setAttribute('class', 'draggable');
    box.id = 'cube' + i;

    container.appendChild(box);
  }

  // helper: ritorna l'array di three.Object3D dei figli
  function getObjects() {
    return Array.from(container.children).map(c => c.object3D);
  }

  // helper: cast dal camera e coords NDC
  function setRayFromNDC(ndc) {
    const cam = cameraEl.getObject3D('camera');
    if (!cam) return false;
    raycaster.setFromCamera(ndc, cam);
    return true;
  }

  // calcola punto di intersezione del ray con piano Z = zFixed
  function getIntersectionWithZPlane() {
    // t = (zFixed - origin.z) / direction.z
    const originZ = raycaster.ray.origin.z;
    const dirZ = raycaster.ray.direction.z;
    if (Math.abs(dirZ) < 1e-6) return null;
    const t = (zFixed - originZ) / dirZ;
    const point = new THREE.Vector3();
    raycaster.ray.at(t, point);
    return point;
  }

  // seleziona un oggetto dato ndc (normalized device coords) — ritorna true se selezionato
  function trySelectAtNDC(ndc) {
    if (!setRayFromNDC(ndc)) return false;
    const intersects = raycaster.intersectObjects(getObjects(), true);
    if (intersects.length > 0) {
      selectedBox = intersects[0].object.el;
      const ip = getIntersectionWithZPlane();
      if (ip) offset.copy(selectedBox.object3D.position).sub(ip);
      return true;
    }
    return false;
  }

  // ============================
  // EVENTI DESKTOP (mouse)
  // ============================
  window.addEventListener('mousedown', (e) => {
    const ndc = new THREE.Vector2((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    trySelectAtNDC(ndc);
  });

  window.addEventListener('mousemove', (e) => {
    if (!selectedBox) return;
    const ndc = new THREE.Vector2((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    if (!setRayFromNDC(ndc)) return;
    const ip = getIntersectionWithZPlane();
    if (ip) selectedBox.object3D.position.set(ip.x + offset.x, ip.y + offset.y, zFixed);
  });

  window.addEventListener('mouseup', () => {
    selectedBox = null;
  });

  // ============================
  // TOUCH SUL CANVAS (mobile) — aggiungiamo su canvas per miglior compatibilità
  // ============================
  sceneEl.addEventListener('loaded', () => {
    const canvas = sceneEl.canvas;
    if (!canvas) return;

    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const t = e.touches[0];
      lastTouchNDC = new THREE.Vector2((t.clientX / window.innerWidth) * 2 - 1, -(t.clientY / window.innerHeight) * 2 + 1);
      // prima prova a selezionare al punto di touch
      trySelectAtNDC(lastTouchNDC);
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (!selectedBox) return;
      const t = e.touches[0];
      lastTouchNDC = new THREE.Vector2((t.clientX / window.innerWidth) * 2 - 1, -(t.clientY / window.innerHeight) * 2 + 1);
      if (!setRayFromNDC(lastTouchNDC)) return;
      const ip = getIntersectionWithZPlane();
      if (ip) selectedBox.object3D.position.set(ip.x + offset.x, ip.y + offset.y, zFixed);
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      selectedBox = null;
      lastTouchNDC = null;
    }, { passive: false });
  });

  // ============================
  // WEBXR / AR: selectstart/selectend sul sceneEl (A-Frame propaga questi eventi)
  // ============================
  sceneEl.addEventListener('selectstart', (evt) => {
    // in AR il "tap" viene spesso mappato al centro dello schermo: proviamo con center (0,0) NDC
    const centerNDC = new THREE.Vector2(0, 0);
    trySelectAtNDC(centerNDC);
  });

  sceneEl.addEventListener('selectend', () => {
    selectedBox = null;
  });

  // ============================
  // XR session loop — per aggiornare la posizione mentre sei in AR (requestAnimationFrame della session)
  // ============================
  sceneEl.addEventListener('enter-vr', () => {
    // otteniamo la session (treerenderer.xr.getSession) dopo l'entrata in VR/AR
    try {
      xrSession = (sceneEl.renderer && sceneEl.renderer.xr) ? sceneEl.renderer.xr.getSession() : (sceneEl.xrSession || null);
    } catch (err) {
      xrSession = (sceneEl.xrSession || null);
    }

    if (!xrSession) {
      // potrebbe non esserci subito: proviamo a leggere sceneEl.xrSession se esiste
      xrSession = sceneEl.xrSession || xrSession;
    }

    if (!xrSession) {
      // non disponibile -> niente da fare
      return;
    }

    // solo una volta
    if (xrLoopRequested) return;
    xrLoopRequested = true;

    // loop XR
    const onXRFrame = (time, xrFrame) => {
      // aggiorna posizione del box selezionato — usa il touch se presente, altrimenti il centro dello schermo
      const ndc = lastTouchNDC ? lastTouchNDC : new THREE.Vector2(0, 0);
      if (selectedBox) {
        if (setRayFromNDC(ndc)) {
          const ip = getIntersectionWithZPlane();
          if (ip) selectedBox.object3D.position.set(ip.x + offset.x, ip.y + offset.y, zFixed);
        }
      }
      // richiesta successiva
      xrSession.requestAnimationFrame(onXRFrame);
    };

    // avvia il loop
    try {
      xrSession.requestAnimationFrame(onXRFrame);
    } catch (err) {
      // se fallisce, non interrompiamo: lasciamo al fallback RAF normale
      console.warn('XR requestAnimationFrame non disponibile:', err);
    }
  });

  // ============================
  // fallback: requestAnimationFrame loop normale per aggiornare se non siamo in XR
  // ============================
  (function rafLoop() {
    if (selectedBox && !xrLoopRequested) {
      // se c'è un lastTouchNDC usalo, altrimenti centro dello schermo
      const ndc = lastTouchNDC ? lastTouchNDC : new THREE.Vector2(0, 0);
      if (setRayFromNDC(ndc)) {
        const ip = getIntersectionWithZPlane();
        if (ip) selectedBox.object3D.position.set(ip.x + offset.x, ip.y + offset.y, zFixed);
      }
    }
    requestAnimationFrame(rafLoop);
  })();

  // DEBUG: utile se vuoi vedere quali eventi arrivano (puoi disattivare se vuoi)
  /*
  sceneEl.addEventListener('selectstart', () => console.log('selectstart'));
  sceneEl.addEventListener('selectend', () => console.log('selectend'));
  window.addEventListener('touchstart', () => console.log('touchstart window'));
  window.addEventListener('touchstart', () => console.log('touchstart canvas'), true);
  */
});



