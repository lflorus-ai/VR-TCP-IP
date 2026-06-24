function showNPCBriefing() {
  if (gameState !== 'S1_ACTIVE') return;
  playMaxAudio('max_briefing_s1');
  const t = document.getElementById('task-text');
  const badge = document.getElementById('selected-badge');
  badge.classList.add('visible');
  badge.textContent = '\u{1F477} Max — Lagerlogistik';
  t.style.color = '#64a0ff';
  t.textContent = 'Starte bei der blauen S1-Tafel links in der Halle — geh hin und drücke E.';
  setTimeout(() => {
    t.style.color = '#e8edf5';
    t.textContent = 'Fadenkreuz auf die blaue S1-Tafel links richten und E drücken.';
    badge.classList.remove('visible');
  }, 5000);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const lieferschein = shuffle([
  { id:'24513', ip:'192.168.1.10', network:'192.168.1', done:false },
  { id:'24514', ip:'10.0.0.5',     network:'10.0.0',    done:false },
  { id:'24515', ip:'172.16.5.3',   network:'172.16.5',  done:false },
  { id:'24516', ip:'192.168.1.10', network:'192.168.1', done:false },
  { id:'24517', ip:'10.0.0.5',     network:'10.0.0',    done:false },
]);

const slotPool = [
  // Regal A – unten (Boden board top y=0.88, Paketzentrum y=1.12)
  [-5.8,1.12,-7.8], [-4.2,1.12,-7.8], [-5.8,1.12,-9.5], [-4.2,1.12,-9.5],
  [-5.8,1.12,-11.2],[-4.2,1.12,-11.2],[-5.0,1.12,-8.5], [-5.0,1.12,-12.0],
  // Regal A – mitte (board top y=2.08, Paketzentrum y=2.32)
  [-5.8,2.32,-8.0], [-4.2,2.32,-8.0], [-5.8,2.32,-10.0],[-4.2,2.32,-10.0],[-5.0,2.32,-11.5],
  // Regal A – oben (board top y=3.28, Paketzentrum y=3.52)
  [-5.0,3.52,-8.5], [-5.0,3.52,-11.0],
  // Regal B – unten
  [4.2,1.12,-7.8],  [5.8,1.12,-7.8],  [4.2,1.12,-9.5],  [5.8,1.12,-9.5],
  [4.2,1.12,-11.2], [5.8,1.12,-11.2],
  // Regal B – mitte
  [4.2,2.32,-8.5],  [5.8,2.32,-9.5],
  // Regal B – oben
  [5.0,3.52,-9.0],
];
const netzwerkMap  = { '192.168.1':'palette-1', '10.0.0':'palette-2', '172.16.5':'palette-3', '10.1.0':'palette-4' };
const palLabelMap  = { 'palette-1':'LKW 1 (192.168.1.x)', 'palette-2':'LKW 2 (10.0.0.x)', 'palette-3':'LKW 3 (172.16.5.x)', 'palette-4':'LKW 4 (10.1.0.x)' };
let selectedPaket = null;
let score = 0;
let gameState = 'INTRO';

// Fortschritt + Freischaltung liegen jetzt zentral im ScenarioManager
// (siehe js/scenario-manager.js). ScenarioManager.canEnter('sN') / .isDone('sN')
// / .markDone('sN') ersetzen das frühere lokale _zoneDone-Objekt.

let _assessmentMode = false;
let _s5aExtras = []; // dynamically created paket-A entities for S5 assessment

let _arrowTarget = null;

function setInstruction(text) {
  const el = document.getElementById('bottom-instruction');
  if (!el) return;
  el.textContent = text;
  el.style.display = text ? 'block' : 'none';
}

function setArrowTarget(x, z) {
  _arrowTarget = (x !== null) ? { x, z } : null;
  const el = document.getElementById('dir-arrow');
  if (el) el.style.display = _arrowTarget ? 'block' : 'none';
}

// Hard-gate collision boxes (added dynamically, removed when gate opens)
const _gates = {
  s3door:   { box: { xmin: 4.5,   xmax: 7.5,   zmin:-16.2, zmax:-15.7 }, entityId: 'gate-s3',       open: false },
  s4door:   { box: { xmin:-7.5,   xmax:-4.5,   zmin:-16.2, zmax:-15.7 }, entityId: 'gate-s4',       open: false },
  divider:  { box: { xmin:-0.2,   xmax: 0.2,   zmin:-30,   zmax:-16   }, entityId: null,             open: false },
  routing:  { box: { xmin:-12.2,  xmax:-11.85, zmin:-8,    zmax:-5    }, entityId: 'gate-routing',   open: false },
};

function openGate(gateName) {
  const gate = _gates[gateName];
  if (!gate || gate.open) return;
  gate.open = true;
  const el = document.getElementById(gate.entityId);
  if (el) el.setAttribute('visible', false);
  const cam = document.querySelector('[collision-walls]');
  if (cam && cam.components['collision-walls']) {
    const boxes = cam.components['collision-walls'].boxes;
    const idx = boxes.indexOf(gate.box);
    if (idx !== -1) boxes.splice(idx, 1);
  }
}

function initGates() {
  const cam = document.querySelector('[collision-walls]');
  if (!cam || !cam.components['collision-walls']) return;
  Object.values(_gates).forEach(g => cam.components['collision-walls'].boxes.push(g.box));
}

// Frei-Modus: alle Türen entsperren (keine Reihenfolge erzwungen)
function openAllGates() {
  Object.keys(_gates).forEach(openGate);
}

// Frei-Modus: grüne Start-Knöpfe ein-/ausblenden (im geführten Modus inaktiv)
function setFreeTriggersVisible(vis) {
  document.querySelectorAll('.free-trigger').forEach(el => {
    el.setAttribute('visible', vis ? 'true' : 'false');
  });
}

// S3 state
let s3Lieferschein = [];
let s3LostPackets  = [];
let s3Score        = 0;
let s3Errors       = 0;
let s3TotalAttempts = 0;
let s3Phase        = 'main'; // 'main' | 'retransmit'
let s3StartMs      = 0;
let s1FinalSeconds = 0;
let s3FinalSeconds = 0;

const s3Data = [
  { id:'30001', ip:'192.168.1.20', network:'192.168.1' },
  { id:'30002', ip:'192.168.1.21', network:'192.168.1' },
  { id:'30003', ip:'10.0.0.10',    network:'10.0.0'    },
  { id:'30004', ip:'10.0.0.11',    network:'10.0.0'    },
  { id:'30005', ip:'172.16.5.20',  network:'172.16.5'  },
  { id:'30006', ip:'172.16.5.21',  network:'172.16.5'  },
  { id:'30007', ip:'10.1.0.5',     network:'10.1.0'    },
  { id:'30008', ip:'10.1.0.6',     network:'10.1.0'    },
];

function getActiveList() {
  if (gameState === 'S2_ACTIVE') return s2LostPackets;
  if (gameState === 'S3_ACTIVE') return s3Phase === 'retransmit' ? s3LostPackets : s3Lieferschein;
  return lieferschein;
}

function getTotalScore() { return score + s2Score + s3Score; }

// Audio
let audioCtx;
function ensureAudio() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
function playTone(freq, dur, type = 'sine', vol = 0.26) {
  ensureAudio();
  const osc = audioCtx.createOscillator(), g = audioCtx.createGain();
  osc.connect(g); g.connect(audioCtx.destination);
  osc.type = type; osc.frequency.value = freq;
  g.gain.setValueAtTime(vol, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
  osc.start(); osc.stop(audioCtx.currentTime + dur);
}
function playSoundCorrect() { playTone(880, 0.1); setTimeout(() => playTone(1100, 0.18), 100); }
function playSoundWrong()   { playTone(160, 0.22, 'sawtooth', 0.2); }
function playSoundComplete(){ [523,659,784,1047].forEach((f,i) => setTimeout(() => playTone(f, 0.4), i*130)); }

// ── Max Audio ────────────────────────────────────────────────────────────────
// Lege MP3s in /audio/ ab (deutsch, männliche Stimme "Max"). Fehlende Dateien
// werden still ignoriert. Texte zum Einsprechen / TTS-Generieren:
//
//   max_tutorial_01.mp3        "Drücke W, A, S oder D um dich zu bewegen."
//   max_tutorial_02.mp3        "Bewege die Maus, um dich umzusehen."
//   max_tutorial_03.mp3        "Drücke die Leertaste zum Springen."
//   max_tutorial_04.mp3        "Drücke E — so greifst du später Pakete."
//   max_tutorial_complete.mp3  "Sehr gut! Du wirst bereits im Lagerhaus erwartet."
//   max_briefing_s1.mp3        "Willkommen! Heute sortierst du Pakete nach IP-Netzwerken auf die richtige Palette."
//   max_teaching_01.mp3        "Richtig! Die ersten Oktette verraten das Zielnetz — wie eine Postleitzahl."
//   max_teaching_02.mp3        "Gut! Das Netzwerk ergibt sich aus den führenden Oktetten der IP-Adresse."
//   max_teaching_03.mp3        "Korrekt. Netz-ID und Host-Teil getrennt durch die Subnetzmaske."
//   max_teaching_04.mp3        "Perfekt erkannt! Die Subnetzmaske zeigt, welche Bits das Netz definieren."
//   max_s1_complete_100.mp3    "Perfekt — Alle IP-Netzwerke auf Anhieb erkannt!"
//   max_s1_complete_hi.mp3     "Sehr gut — Fast fehlerfrei. Weiter so!"
//   max_s1_complete_mid.mp3    "Gut — IP-Grundlagen sitzen, weiter üben hilft."
//   max_s1_complete_lo.mp3     "Weiter üben — Schau dir die Netzklassen nochmal an."
//   max_s2_briefing.mp3        "Einige Pakete sind nicht angekommen — schau auf den Computer."
//   max_s2_complete.mp3        "Gut gemacht! TCP stellt sicher, dass alle Pakete ankommen."
//   max_s3_briefing.mp3        "Jetzt das Assessment — mehr Pakete, mehr Netzwerke. Zeig was du gelernt hast."
//   max_s3_retransmit.mp3      "Achtung! Drei Pakete wurden nicht bestätigt — retransmittiere sie aus Regal B."
//   max_s3_complete_100.mp3    "Perfekt! Du kennst dich mit Netzwerken aus."
//   max_s3_complete_hi.mp3     "Sehr gut! Noch ein paar Details zu vertiefen."
//   max_s3_complete_mid.mp3    "Gut gemacht! Die Grundlagen sitzen."
//   max_s3_complete_lo.mp3     "Übung macht den Meister — probiere es nochmal."
//   max_final_100.mp3          "Ausgezeichnet! Alle drei Szenarien gemeistert."
//   max_final_hi.mp3           "Sehr gute Leistung! Du hast TCP/IP gut verstanden."
//   max_final_mid.mp3          "Solide Basis! Mit etwas Übung wird es noch besser."
//   max_final_lo.mp3           "Gut angefangen! Die Grundlagen sind da — weitermachen."
const _maxAudio = { el: null };
function playMaxAudio(key) {
  if (_maxAudio.el) { _maxAudio.el.pause(); _maxAudio.el.currentTime = 0; }
  const a = new Audio(`audio/${key}.mp3`);
  _maxAudio.el = a;
  a.play().catch(() => {});
}

// ── Tutorial Step Banner ──────────────────────────────────────────────────────
const TUTORIAL_STEP_CONTENT = [
  { counter:'Schritt 1 von 4', icon:'🚶', title:'Bewege dich',     keys:['W','A','S','D'], desc:'Nutze diese Tasten um dich im Lagerhaus zu bewegen' },
  { counter:'Schritt 2 von 4', icon:'⬆️', title:'Springe',         keys:['Leertaste'],     desc:'Drücke die Leertaste um zu springen' },
  { counter:'Schritt 3 von 4', icon:'📦', title:'Paket aufheben',  keys:['E'],             desc:'Geh nah an ein Paket heran und drücke E' },
  { counter:'Schritt 4 von 4', icon:'🎯', title:'Paket abliefern', keys:['E'],             desc:'Geh zur markierten Palette und drücke E erneut' },
];
let _bannerHideTimer = null;

function showStepBanner(indexOrContent) {
  clearTimeout(_bannerHideTimer);
  _bannerHideTimer = null;
  const s = typeof indexOrContent === 'number' ? TUTORIAL_STEP_CONTENT[indexOrContent] : indexOrContent;
  const banner = document.getElementById('step-banner');
  document.getElementById('sb-counter').textContent = s.counter;
  document.getElementById('sb-icon').textContent    = s.icon;
  document.getElementById('sb-title').textContent   = s.title;
  document.getElementById('sb-desc').textContent    = s.desc;
  const keysEl = document.getElementById('sb-keys');
  keysEl.textContent = '';
  s.keys.forEach(k => {
    const kbd = document.createElement('kbd');
    kbd.textContent = k;
    keysEl.appendChild(kbd);
  });
  banner.classList.remove('hidden');
  requestAnimationFrame(() => banner.classList.add('visible'));
}

function hideStepBanner() {
  const banner = document.getElementById('step-banner');
  banner.classList.remove('visible');
  _bannerHideTimer = setTimeout(() => {
    _bannerHideTimer = null;
    banner.classList.add('hidden');
  }, 400);
}

// ── Steuer-Tutorial ───────────────────────────────────────────────────────────
const _tutStepKeys  = ['move', 'jump', 'pickup', 'deliver'];
const _tutStepTexts = [
  'Drücke W/A/S/D um dich zu bewegen',
  'Drücke Leertaste zum Springen',
  'Geh nah an den gelben Karton und drücke E',
  'Geh zur Ablagezone und drücke E',
];
const _tutStepAudio = ['max_tutorial_01', 'max_tutorial_03', 'max_tutorial_04', null];

function startTutorial() {
  const camEl    = document.querySelector('[camera]');
  const paketEl  = document.getElementById('tutorial-paket');
  const palEl    = document.getElementById('tutorial-palette');
  const _camPos  = new AFRAME.THREE.Vector3();
  let tutStep = 0;

  const hudTag = document.getElementById('hud-tag');
  hudTag.textContent = '■ Steuer-Tutorial';
  hudTag.classList.add('tutorial');
  document.getElementById('tutorial-steps').style.display = 'block';

  function markStepDone(idx) {
    const el = document.querySelector(`.tutorial-step[data-step="${_tutStepKeys[idx]}"]`);
    if (el) { el.classList.remove('active'); el.classList.add('done'); }
  }
  function markStepActive(idx) {
    const el = document.querySelector(`.tutorial-step[data-step="${_tutStepKeys[idx]}"]`);
    if (el) el.classList.add('active');
    document.getElementById('task-text').textContent = _tutStepTexts[idx];
    if (_tutStepAudio[idx]) playMaxAudio(_tutStepAudio[idx]);
    showStepBanner(idx);
  }
  function advanceStep() {
    hideStepBanner();
    markStepDone(tutStep);
    tutStep++;
    if (tutStep >= _tutStepKeys.length) {
      completeTutorial();
    } else {
      markStepActive(tutStep);
    }
  }

  function getCamWorldPos() {
    camEl.object3D.getWorldPosition(_camPos);
    return _camPos;
  }

  // Tutorial E-key: Näherungsbasiert (kein Cursor-Hover nötig)
  function tutorialEHandler(e) {
    if (e.key !== 'e' && e.key !== 'E') return;
    if (tutStep === 2 && !selectedPaket) {
      const camPos = getCamWorldPos();
      const pakPos = new AFRAME.THREE.Vector3();
      paketEl.object3D.getWorldPosition(pakPos);
      if (camPos.distanceTo(pakPos) > 4.5) return;
      selectedPaket = paketEl;
      const origPos = paketEl.getAttribute('position');
      paketEl._origPos = { x: origPos.x, y: origPos.y, z: origPos.z };
      paketEl.classList.remove('interactable');
      paketEl.setAttribute('package-follow', 'active:true;mode:carry');
      paketEl.setAttribute('material', 'emissive', '#f0c030');
      paketEl.setAttribute('material', 'emissiveIntensity', '0.7');
      advanceStep();
    } else if (tutStep === 3 && selectedPaket) {
      const camPos = getCamWorldPos();
      const palPos = new AFRAME.THREE.Vector3();
      palEl.object3D.getWorldPosition(palPos);
      if (camPos.distanceTo(palPos) > 7) return;
      const tp = selectedPaket;
      selectedPaket = null;
      tp.removeAttribute('package-follow');
      tp.setAttribute('position', '0 0.78 4.2');
      tp.setAttribute('material', 'emissive', '#000000');
      tp.setAttribute('material', 'emissiveIntensity', '0');
      document.removeEventListener('keydown', tutorialEHandler);
      playSoundCorrect();
      triggerFlash(true);
      advanceStep();
    }
  }
  document.addEventListener('keydown', tutorialEHandler);

  // Jump detection
  function tutorialJumpHandler(e) {
    if (tutStep === 1 && e.code === 'Space') {
      document.removeEventListener('keydown', tutorialJumpHandler);
      setTimeout(advanceStep, 400);
    }
  }
  document.addEventListener('keydown', tutorialJumpHandler);

  // Move detection: WASD-Tastendruck direkt erkennen
  const MOVE_KEYS = new Set(['w','a','s','d','W','A','S','D','ArrowUp','ArrowDown','ArrowLeft','ArrowRight']);
  function tutorialMoveHandler(e) {
    if (tutStep !== 0) return;
    if (!MOVE_KEYS.has(e.key)) return;
    document.removeEventListener('keydown', tutorialMoveHandler);
    advanceStep();
  }
  document.addEventListener('keydown', tutorialMoveHandler);

  window._tutorialCleanup = () => {
    document.removeEventListener('keydown', tutorialMoveHandler);
    document.removeEventListener('keydown', tutorialJumpHandler);
    document.removeEventListener('keydown', tutorialEHandler);
  };

  markStepActive(0);
}

function completeTutorial() {
  if (window._tutorialCleanup) { window._tutorialCleanup(); window._tutorialCleanup = null; }
  hideStepBanner();
  playMaxAudio('max_tutorial_complete');

  // Inhalt des Abschluss-Overlays an den Modus anpassen (geführt vs. frei).
  const body = document.getElementById('tutc-body');
  const btn  = document.getElementById('tutorial-done-btn');
  if (ScenarioManager.isFree()) {
    if (body) body.innerHTML =
      'Du weißt jetzt, wie das Lager funktioniert. Im <strong>freien Modus</strong> wählst du selbst, welches Szenario du spielst.'
      + '<div class="overlay-learn-box">'
      + '<div class="olb-header">🟢 Freier Modus</div>'
      + '<p style="font-size:13px;color:#c8d8f0;line-height:1.7;margin:0">'
      + 'Geh zu einem der <strong>grünen Knöpfe (S1–S5)</strong> und drücke <strong>[E]</strong>. '
      + 'Du kannst die Szenarien in beliebiger Reihenfolge und beliebig oft spielen. '
      + 'Das <strong>Assessment</strong> startest du am grünen Knopf an der Nordwand.'
      + '</p></div>';
    if (btn) btn.innerHTML = "Los geht's &rarr;";
  } else {
    if (body) body.innerHTML =
      'Du weißt jetzt, wie das Lager funktioniert. Jetzt lernst du das <strong>TCP/IP-Modell</strong> kennen — in fünf Szenarien arbeitest du dich durch alle vier Schichten.'
      + '<div class="overlay-learn-box">'
      + '<div class="olb-header">📚 5 Szenarien · 4 Schichten</div>'
      + '<p style="font-size:13px;color:#c8d8f0;line-height:1.7;margin:0">'
      + 'Szenario 1 startet mit dem <strong>Schichtenmodell</strong>: Welche Schicht macht was? '
      + 'Danach folgen Protokolle, Transport (TCP/UDP), Anwendung und zum Schluss das IP-Sortieren.'
      + '</p>'
      + '<div class="olb-example">Tafel anschauen &nbsp;→&nbsp; [E] &nbsp;→&nbsp; Quiz lösen</div>'
      + '</div>';
    if (btn) btn.innerHTML = 'Weiter zu Szenario 1 &rarr;';
  }

  document.getElementById('tutorial-complete-overlay').classList.remove('hidden');
  setTimeout(() => document.exitPointerLock(), 300);

  function onEnterDone(e) {
    if (e.key === 'Enter') {
      document.removeEventListener('keydown', onEnterDone);
      document.getElementById('tutorial-done-btn').click();
    }
  }
  document.addEventListener('keydown', onEnterDone);
}

// Startbildschirm: Modus-Auswahl → setzt den Modus zentral und zeigt danach
// das (in beiden Modi gleiche) Steuer-Tutorial.
function chooseMode(mode) {
  ScenarioManager.setMode(mode);
  document.getElementById('mode-selector-overlay').classList.add('hidden');
  document.getElementById('tutorial-start-overlay').classList.remove('hidden');
}
document.getElementById('mode-guided-btn').addEventListener('click', () => chooseMode(Mode.GUIDED));
document.getElementById('mode-free-btn').addEventListener('click', () => chooseMode(Mode.FREE));

document.getElementById('tutorial-start-btn').addEventListener('click', () => {
  document.getElementById('tutorial-start-overlay').classList.add('hidden');
  const canvas = document.querySelector('a-scene canvas');
  if (canvas) canvas.requestPointerLock();

  gameState = 'TUTORIAL';
  const task = document.getElementById('task-text');
  task.style.color = '#f5c518';
  task.textContent = '👷 Max: Willkommen! Ich zeige dir kurz die Steuerung — folge den Schritten unten links.';
  setTimeout(() => {
    task.style.color = '#e8edf5';
    startTutorial();
  }, 3500);
});

// Tutorial-Abschluss-Button
document.getElementById('tutorial-done-btn').addEventListener('click', () => {
  document.getElementById('tutorial-complete-overlay').classList.add('hidden');

  // Tutorial-Entities verstecken
  document.getElementById('tutorial-barrier').setAttribute('visible', 'false');
  document.getElementById('tutorial-floor').setAttribute('visible', 'false');
  document.getElementById('tutorial-paket-area').setAttribute('visible', 'false');
  document.getElementById('tutorial-palette-area').setAttribute('visible', 'false');
  document.getElementById('tutorial-paket').setAttribute('visible', 'false');

  // Tutorial-HUD zurücksetzen
  document.getElementById('tutorial-steps').style.display = 'none';
  const hudTag = document.getElementById('hud-tag');
  hudTag.textContent = '■ Lern-Szenario 1';
  hudTag.classList.remove('tutorial');

  // Direkt zu S1_ACTIVE
  gameState = 'S1_ACTIVE';
  // Lieferschein-Liste/Pips/Klemmbrett gehören zum IP-Sortieren (S5) und bleiben
  // im Hub ausgeblendet — erst beim Start von S5 sichtbar.
  setS5Hud(false);
  const canvas = document.querySelector('a-scene canvas');
  if (canvas) canvas.requestPointerLock();

  if (ScenarioManager.isFree()) {
    // Freier Modus: alle Türen offen, grüne Knöpfe sichtbar, keine erzwungene
    // Reihenfolge und keine richtungsweisende Führung.
    openAllGates();
    setFreeTriggersVisible(true);
    document.getElementById('s2-station').setAttribute('visible', true);
    const hudTag = document.getElementById('hud-tag');
    if (hudTag) hudTag.textContent = '■ Freier Modus';
    setArrowTarget(null, null);
    setInstruction('Freier Modus: Gehe zu einem beliebigen Raum und drücke den grünen Knopf [E].');
    const t = document.getElementById('task-text');
    if (t) t.textContent = 'Freier Modus — starte ein Szenario (S1–S5) per grünem Knopf.';
  } else {
    // Geführter Modus (bisheriges Verhalten): Wegpunkt + Pfeil zur S1-Tafel
    const wpS1immediate = document.getElementById('waypoint-s1');
    if (wpS1immediate) wpS1immediate.setAttribute('visible', 'true');
    setArrowTarget(-7, 0.15);
    setInstruction('Geh zur blauen S1-Tafel links — drücke [E]');
    showNPCBriefing();
  }
  updateLieferschein();
});

// IP-Sortier-HUD (Lieferschein-Liste, Fortschritts-Pips, Hand-Klemmbrett) ein-/
// ausblenden. Diese Elemente sind Überreste des alten Lernpfads und gehören jetzt
// ausschließlich zu Szenario 5.
function setS5Hud(on) {
  const disp = on ? '' : 'none';
  const ll = document.getElementById('lieferschein-list');
  const pp = document.getElementById('progress-pips');
  if (ll) ll.style.display = disp;
  if (pp) pp.style.display = disp;
  const clip = document.getElementById('hand-clipboard');
  if (clip) clip.setAttribute('visible', on ? 'true' : 'false');
}

// Büro-Computer (Paketverlust-Meldung der S5-Phase 2) in den Ruhezustand
// zurücksetzen, damit die Fehlermeldung nach Abschluss von S5 nicht stehen bleibt.
function resetOfficeComputer() {
  const screen = document.getElementById('computer-screen');
  if (screen) {
    screen.removeAttribute('animation__blink');
    screen.setAttribute('material', 'color:#001428;emissive:#002244;emissiveIntensity:0.8;shader:flat');
  }
  ['computer-line1', 'computer-line2', 'office-glow', 'computer-waypoint', 'computer-hint']
    .forEach(id => { const el = document.getElementById(id); if (el) el.setAttribute('visible', 'false'); });
}

// Complete overlay
function showCompleteOverlay() {
  playSoundComplete();
  document.exitPointerLock();
  gameState = 'S1_COMPLETE';
  s1FinalSeconds = timerSeconds;
  const m = String(Math.floor(timerSeconds/60)).padStart(2,'0');
  const s = String(timerSeconds%60).padStart(2,'0');
  document.getElementById('co-score').textContent = score;
  document.getElementById('co-time').textContent  = m + ':' + s;

  const maxPossible = lieferschein.length * 100;
  const pct = score / maxPossible;
  const qualEl = document.getElementById('co-quality');
  if (pct >= 1.0) {
    qualEl.style.color = '#ffd700';
    qualEl.textContent = 'Perfekt — Alle IP-Netzwerke auf Anhieb erkannt!';
    playMaxAudio('max_s1_complete_100');
  } else if (pct >= 0.7) {
    qualEl.style.color = '#50e0a0';
    qualEl.textContent = 'Sehr gut — Fast fehlerfrei. Weiter so!';
    playMaxAudio('max_s1_complete_hi');
  } else if (pct >= 0.4) {
    qualEl.style.color = '#64a0ff';
    qualEl.textContent = 'Gut — IP-Grundlagen sitzen, weiter üben.';
    playMaxAudio('max_s1_complete_mid');
  } else {
    qualEl.style.color = '#aaa';
    qualEl.textContent = 'Weiter üben — Schau dir die Netzklassen nochmal an.';
    playMaxAudio('max_s1_complete_lo');
  }

  document.getElementById('complete-overlay').classList.remove('hidden');
}

function showS2CompleteOverlay() {
  playSoundComplete();
  playMaxAudio('max_s2_complete');
  document.exitPointerLock();
  gameState = 'S2_COMPLETE';
  document.getElementById('s2-score').textContent = score + s2Score;
  document.getElementById('s2-count').textContent = s2LostPackets.length + ' / ' + s2LostPackets.length;
  document.getElementById('s2-complete-overlay').classList.remove('hidden');
}

document.getElementById('s2-close-btn').addEventListener('click', () => {
  document.getElementById('s2-complete-overlay').classList.add('hidden');
  showS3BriefingOverlay();
});

document.getElementById('complete-btn').addEventListener('click', () => {
  document.getElementById('complete-overlay').classList.add('hidden');
  document.getElementById('s2-briefing-overlay').classList.remove('hidden');
});

document.getElementById('s2-briefing-ok-btn').addEventListener('click', () => {
  document.getElementById('s2-briefing-overlay').classList.add('hidden');
  showS2Transition();
  const canvas = document.querySelector('a-scene canvas');
  if (canvas) canvas.requestPointerLock();
});

let s2BriefingTimeout = null;
// Steuert, wohin die Paketverlust-Fehlerbehandlung (S2-Mechanik) nach Abschluss
// zurückkehrt: 's2' = klassischer Lernpfad, 's5' = als Phase 2 von Szenario 5.
let lostPacketReturn = 's2';

function showS2Transition(returnTo) {
  lostPacketReturn = returnTo || 's2';
  const isS5 = lostPacketReturn === 's5';
  gameState = 'S2_BRIEFING';
  playMaxAudio('max_s2_briefing');

  const hudTag = document.getElementById('hud-tag');
  if (hudTag) hudTag.textContent = isS5
    ? '■ Szenario 5 — Paketverlust (TCP-Fehlerbehandlung)'
    : 'Lern-Szenario 2 — Paketverlust';

  const task = document.getElementById('task-text');
  task.style.color = '#ffcc40';
  task.textContent = '① Büro links durch die Tür — tritt an den Computer heran und drücke E';

  showStepBanner({
    counter: isS5 ? 'Szenario 5 · Fehlerbehandlung' : 'Szenario 2 · Schritt 1 von 2',
    icon: '🖥️',
    title: 'Geh zum Computer',
    keys: ['W','A','S','D'],
    desc: 'Büro links durch die Tür — tritt an den Bildschirm heran und drücke E'
  });

  // Computer-Screen rot blinken
  const screen = document.getElementById('computer-screen');
  if (screen) {
    screen.setAttribute('material', 'color:#200000;emissive:#cc0000;emissiveIntensity:0.9;shader:flat');
    screen.setAttribute('animation__blink',
      'property:material.emissiveIntensity;from:0.9;to:0.2;dur:600;dir:alternate;loop:true;easing:easeInOutSine');
  }

  // Office-Glow einblenden
  const glow = document.getElementById('office-glow');
  if (glow) glow.setAttribute('visible', 'true');

  // Waypoint-Marker einblenden
  const waypoint = document.getElementById('computer-waypoint');
  if (waypoint) waypoint.setAttribute('visible', 'true');

  // Lieferschein-Liste leeren (S2 hat eigene Pakete)
  const listEl = document.getElementById('lieferschein-list');
  if (listEl) while (listEl.firstChild) listEl.removeChild(listEl.firstChild);
}

let s2LostPackets = [];
let s2Score = 0;

function enterZoneS1() {
  if (!ScenarioManager.canEnter('s1')) return;
  if (!['S1_ACTIVE', 'INTRO', 'TUTORIAL'].includes(gameState)) return;
  gameState = 'ZONE_S1';
  setArrowTarget(null, null); setInstruction('');
  document.exitPointerLock?.();
  document.getElementById('s1-info-overlay').classList.remove('hidden');
}

function enterZoneS2() {
  if (!ScenarioManager.canEnter('s2')) return;
  if (!['S1_ACTIVE', 'INTRO', 'TUTORIAL'].includes(gameState)) return;
  gameState = 'ZONE_S2';
  setArrowTarget(null, null); setInstruction('');
  document.exitPointerLock?.();
  document.getElementById('s2-info-overlay').classList.remove('hidden');
}

// Frei-Modus: ein laufendes Tafel-Quiz (ZONE_S1/ZONE_S2) abbrechen, damit der
// Spieler jederzeit zu einem anderen Szenario wechseln (oder dasselbe erneut
// lesen) kann. Räumt das Modul auf, schließt das Info-Overlay und gibt den
// Basis-State frei, sodass die enterZoneSN-Guards wieder greifen.
function abortBoardZoneIfActive() {
  if (gameState === 'ZONE_S1') {
    P1.teardown?.();
    document.getElementById('s1-info-overlay').classList.add('hidden');
  } else if (gameState === 'ZONE_S2') {
    P2.teardown?.();
    document.getElementById('s2-info-overlay').classList.add('hidden');
  } else {
    return;
  }
  gameState = 'S1_ACTIVE';
}

function enterZoneS3() {
  if (!ScenarioManager.isFree() && ScenarioManager.isDone('s3')) return;
  if (!ScenarioManager.canEnter('s3')) {
    const t = document.getElementById('task-text');
    if (t) t.textContent = '🔒 Schließe zuerst S1 (links vom Eingang) und S2 (rechts vom Eingang) ab!';
    return;
  }
  if (!['S1_ACTIVE', 'INTRO', 'TUTORIAL'].includes(gameState)) return;
  gameState = 'ZONE_S3';
  setArrowTarget(null, null); setInstruction('');
  const hudTag = document.getElementById('hud-tag');
  if (hudTag) hudTag.textContent = '■ Lern-Szenario 3 — Transport';
  const wpS3 = document.getElementById('waypoint-s3');
  if (wpS3) wpS3.setAttribute('visible', 'false');
  P2S3.init((score) => {
    hideStepBanner();
    ScenarioManager.markDone('s3');
    gameState = 'S1_ACTIVE';
    openGate('s4door');
    const hudTag = document.getElementById('hud-tag');
    const t = document.getElementById('task-text');
    if (ScenarioManager.isFree()) {
      if (hudTag) hudTag.textContent = '■ Freier Modus';
      if (t) t.textContent = 'S3 abgeschlossen! Wähle das nächste Szenario per grünem Knopf [E].';
      setArrowTarget(null, null); setInstruction('');
    } else {
      if (hudTag) hudTag.textContent = '■ Lern-Szenario 4';
      if (t) t.textContent = 'S3 (Transport) abgeschlossen! Geh nach links für S4 (Anwendungs-Flügel).';
      setArrowTarget(-5, -20);
      setInstruction('Geh nach links in den Anwendungs-Flügel (S4)');
    }
  });
  // Erklärung beim Betreten: was ist zu tun + Hinweis auf die Infotafel
  showStepBanner({
    counter: 'Szenario 3 · Transportschicht',
    icon: '🚚',
    title: 'TCP oder UDP?',
    keys: ['E'],
    desc: 'Lies zuerst die Infotafel in der Ecke ([E], wenn du davor stehst). Dann: Paket aufnehmen [E] und auf das richtige Förderband (TCP oder UDP) legen [E].',
  });
  setTimeout(hideStepBanner, 11000);
  setInstruction('📋 Infotafel in der Ecke lesen: [E]  ·  Paket: [E]');
  setTimeout(() => { if (gameState === 'ZONE_S3') setInstruction(''); }, 5000);
}

function enterZoneS4() {
  if (!ScenarioManager.isFree() && ScenarioManager.isDone('s4')) return;
  if (!ScenarioManager.canEnter('s4')) {
    const t = document.getElementById('task-text');
    if (t) t.textContent = '🔒 Schließe zuerst S3 (Transport-Flügel, rechte Seite) ab!';
    return;
  }
  if (!['S1_ACTIVE', 'INTRO', 'TUTORIAL'].includes(gameState)) return;
  gameState = 'ZONE_S4';
  setArrowTarget(null, null); setInstruction('');
  const hudTag = document.getElementById('hud-tag');
  if (hudTag) hudTag.textContent = '■ Lern-Szenario 4 — Anwendung';
  P2S4.init((score) => {
    hideStepBanner();
    ScenarioManager.markDone('s4');
    gameState = 'S1_ACTIVE';
    openGate('routing');
    const hudTag = document.getElementById('hud-tag');
    const t = document.getElementById('task-text');
    if (ScenarioManager.isFree()) {
      if (hudTag) hudTag.textContent = '■ Freier Modus';
      if (t) t.textContent = 'S4 abgeschlossen! Wähle das nächste Szenario per grünem Knopf [E].';
      setArrowTarget(null, null); setInstruction('');
    } else {
      if (hudTag) hudTag.textContent = '■ Lern-Szenario 5';
      if (t) t.textContent = 'S4 (Anwendung) abgeschlossen! Büro-Flügel (Routing, x<-12) freigeschaltet.';
      setArrowTarget(-13, -6);
      setInstruction('Geh ins Büro links (weit links, S5 — Routing)');
    }
  });
  // Erklärung beim Betreten: was ist zu tun + Hinweis auf die Infotafel
  showStepBanner({
    counter: 'Szenario 4 · Anwendungsschicht',
    icon: '📮',
    title: 'Welches Protokoll?',
    keys: ['E'],
    desc: 'Lies zuerst die Infotafel in der Ecke ([E], wenn du davor stehst). Dann: Paket aufnehmen [E] und in den richtigen Protokoll-Briefkasten (HTTP/DNS/FTP/SMTP) tragen [E].',
  });
  setTimeout(hideStepBanner, 11000);
  setInstruction('📋 Infotafel in der Ecke lesen: [E]  ·  Paket: [E]');
  setTimeout(() => { if (gameState === 'ZONE_S4') setInstruction(''); }, 5000);
}

function enterZoneS5() {
  if (!ScenarioManager.isFree() && ScenarioManager.isDone('s5')) return;
  if (!ScenarioManager.canEnter('s5')) {
    const t = document.getElementById('task-text');
    if (t) t.textContent = '🔒 Schließe zuerst S4 (Anwendungs-Flügel, linke Seite im Nordflügel) ab!';
    return;
  }
  if (!['S1_ACTIVE', 'INTRO', 'TUTORIAL'].includes(gameState)) return;
  gameState = 'ZONE_S5';
  setArrowTarget(null, null); setInstruction('');
  const hudTag = document.getElementById('hud-tag');
  if (hudTag) hudTag.textContent = '■ Lern-Szenario 5 — IP-Routing';
  document.exitPointerLock();
  document.getElementById('s5-briefing-overlay').classList.remove('hidden');
}

function showS5CompleteOverlay() {
  playSoundComplete();
  document.exitPointerLock();
  gameState = 'S5_COMPLETE';
  const scoreEl = document.getElementById('s5-score');
  if (scoreEl) scoreEl.textContent = getTotalScore() + ' P';
  document.getElementById('s5-complete-overlay').classList.remove('hidden');
}

// ── Assessment Zone Entry Functions ──────────────────────────────────────────

function enterZoneS1A() {
  if (P2S6.isDone('s1') || gameState !== 'S1_ACTIVE') return;
  gameState = 'ZONE_S1';
  setArrowTarget(null, null); setInstruction('');
  document.exitPointerLock?.();
  document.getElementById('s1-info-overlay').classList.remove('hidden');
}

function enterZoneS2A() {
  if (P2S6.isDone('s2') || !P2S6.isDone('s1') || gameState !== 'S1_ACTIVE') return;
  gameState = 'ZONE_S2';
  setArrowTarget(null, null); setInstruction('');
  document.exitPointerLock?.();
  document.getElementById('s2-info-overlay').classList.remove('hidden');
}

function enterZoneS3A() {
  if (P2S6.isDone('s3') || !P2S6.isDone('s2') || gameState !== 'S1_ACTIVE') return;
  gameState = 'ZONE_S3';
  setArrowTarget(null, null); setInstruction('');
  const hudTag = document.getElementById('hud-tag');
  if (hudTag) hudTag.textContent = '■ Assessment — Transport';
  P2S3.initAssessment((s) => {
    P2S6.markDone('s3');
    gameState = 'S1_ACTIVE';
    const t = document.getElementById('task-text');
    if (t) t.textContent = 'Assessment S3 abgeschlossen! Geh nach links für S4 (Anwendungs-Flügel).';
    setArrowTarget(-5, -20);
    setInstruction('Assessment: Geh nach links in den Anwendungs-Flügel (S4)');
  });
}

function enterZoneS4A() {
  if (P2S6.isDone('s4') || !P2S6.isDone('s3') || gameState !== 'S1_ACTIVE') return;
  gameState = 'ZONE_S4';
  setArrowTarget(null, null); setInstruction('');
  const hudTag = document.getElementById('hud-tag');
  if (hudTag) hudTag.textContent = '■ Assessment — Anwendung';
  P2S4.initAssessment((s) => {
    P2S6.markDone('s4');
    gameState = 'S1_ACTIVE';
    const t = document.getElementById('task-text');
    if (t) t.textContent = 'Assessment S4 abgeschlossen! Büro-Flügel für S5 (Routing).';
    setArrowTarget(-13, -6);
    setInstruction('Assessment: Geh ins Büro links (S5 — Routing)');
  });
}

function enterZoneS5A() {
  if (P2S6.isDone('s5') || !P2S6.isDone('s4') || gameState !== 'S1_ACTIVE') return;
  gameState = 'ZONE_S5';
  setArrowTarget(null, null); setInstruction('');
  const hudTag = document.getElementById('hud-tag');
  if (hudTag) hudTag.textContent = '■ Assessment — IP-Routing';
  document.exitPointerLock();
  document.getElementById('s5-briefing-overlay').classList.remove('hidden');
}


function initS2() {
  const delivered = lieferschein.filter(p => p.done);
  const source = delivered.length > 0 ? delivered : lieferschein;
  const lostCount = Math.min(2, source.length);
  const shuffled = source.slice().sort(() => Math.random() - 0.5);
  s2LostPackets = shuffled.slice(0, lostCount).map(p => ({
    id: p.id, ip: p.ip, network: p.network, done: false
  }));
}

function renderComputerScreen(lostPackets, fullList) {
  const line1El = document.getElementById('computer-line1');
  const line2El = document.getElementById('computer-line2');
  const screen  = document.getElementById('computer-screen');

  const activeLost = lostPackets || s2LostPackets;
  const activeList = fullList    || lieferschein;

  if (screen) {
    screen.removeAttribute('animation__blink');
    screen.setAttribute('material', 'color:#001428;emissive:#002244;emissiveIntensity:0.8;shader:flat');
  }
  if (line2El) line2El.setAttribute('visible', 'false');

  if (line1El) {
    line1El.setAttribute('visible', 'true');
    const lostIds = activeLost.map(p => p.id);
    const palName = { 'palette-1':'LKW 1', 'palette-2':'LKW 2', 'palette-3':'LKW 3', 'palette-4':'LKW 4' };
    const okCount = activeList.filter(p => !lostIds.includes(p.id)).length;

    const lines = [
      'TCP-FEHLERPROTOKOLL',
      'VERLOREN: ' + activeLost.length + ' / ' + activeList.length,
      '──────────────────',
    ];

    activeLost.forEach(p => {
      const ziel = palName[netzwerkMap[p.network]] || '?';
      lines.push('! ' + p.id + '  ' + p.ip);
      lines.push('  Ziel: ' + ziel);
    });

    lines.push('──────────────────');
    lines.push('Pakete in Regal B');
    lines.push('TCP: Neuuebertragung');

    line1El.setAttribute('value', lines.join('\n'));
    line1El.setAttribute('color', '#00ff88');
    line1El.setAttribute('scale', '0.045 0.045 0.045');
    line1El.setAttribute('position', '0 1.52 0.029');
    line1El.setAttribute('baseline', 'top');
    line1El.setAttribute('wrap-count', '22');
  }
}

function startS2() {
  clearTimeout(s2BriefingTimeout);
  hideStepBanner();
  const hint = document.getElementById('computer-hint');
  if (hint) hint.setAttribute('visible', 'false');
  initS2();
  renderComputerScreen();
  gameState = 'S2_ACTIVE';

  const waypoint = document.getElementById('computer-waypoint');
  if (waypoint) waypoint.setAttribute('visible', 'false');

  const glow = document.getElementById('office-glow');
  if (glow) glow.setAttribute('visible', 'false');

  renderLieferscheinList(s2LostPackets, 'lieferschein-list', true);
  setClipboardText(s2LostPackets, 'VERLOREN — Neuübertragung\nMusterFirma GmbH');

  spawnS2Packages();

  const badge2 = document.getElementById('selected-badge');
  badge2.textContent = 'Max — Schritt 2 von 2';
  badge2.classList.add('visible');
  setTimeout(() => badge2.classList.remove('visible'), 5000);

  const task = document.getElementById('task-text');
  task.style.color = '#ffcc40';
  task.textContent = '② ' + s2LostPackets.length + ' Paket(e) verloren! Hole sie aus Regal B (oben) und liefere erneut.';
}

const s2SlotPositions = [
  [4.2, 3.52, -7.8],
  [5.8, 3.52, -9.5],
];

function spawnS2Packages() {
  const scene = document.querySelector('a-scene');
  // Reste aus einem früheren Durchlauf entfernen (S5 ist im Frei-Modus
  // wiederholbar; gleiche Paket-IDs würden sonst doppelt im DOM landen).
  document.querySelectorAll('.s2-paket').forEach(el => { if (el.parentNode) el.parentNode.removeChild(el); });
  s2LostPackets.forEach((entry, i) => {
    const [x, y, z] = s2SlotPositions[i] || [8.0, 3.62, -8.5];

    const el = document.createElement('a-entity');
    el.setAttribute('class', 'interactable paket s2-paket');
    el.setAttribute('id', 's2-paket-' + entry.id);
    el.setAttribute('data-ip', entry.ip);
    el.setAttribute('data-id', entry.id);
    el.setAttribute('data-s2', 'true');
    el.setAttribute('position', x + ' ' + y + ' ' + z);
    el.setAttribute('geometry', 'primitive:box;width:0.58;height:0.48;depth:0.48');
    el.setAttribute('material', 'color:#c8a060;roughness:0.9;emissive:#ffaa00;emissiveIntensity:0.4');
    el.setAttribute('shadow', 'cast:true;receive:true');

    const labelWrapper = document.createElement('a-entity');
    labelWrapper.setAttribute('look-at', '[camera]');
    labelWrapper.setAttribute('position', '0 0.30 0');

    const bg = document.createElement('a-plane');
    bg.setAttribute('material', 'color:#0a1828;opacity:0.9;shader:flat;side:double');
    bg.setAttribute('width', '0.58');
    bg.setAttribute('height', '0.14');

    const txt = document.createElement('a-text');
    txt.setAttribute('value', entry.ip);
    txt.setAttribute('color', '#ffcc40');
    txt.setAttribute('scale', '0.65 0.65 0.65');
    txt.setAttribute('align', 'center');
    txt.setAttribute('position', '0 0 0.002');
    txt.setAttribute('material', 'shader:flat');

    labelWrapper.appendChild(bg);
    labelWrapper.appendChild(txt);
    el.appendChild(labelWrapper);

    const tape = document.createElement('a-box');
    tape.setAttribute('material', 'color:#ff8800;roughness:0.8');
    tape.setAttribute('position', '0 0.245 0');
    tape.setAttribute('width', '0.62');
    tape.setAttribute('height', '0.03');
    tape.setAttribute('depth', '0.1');
    el.appendChild(tape);

    scene.appendChild(el);

    el.addEventListener('mouseenter', () => {
      hoveredEl = el;
      if (el !== selectedPaket) {
        el.setAttribute('material', 'emissive', '#8b6a20');
        el.setAttribute('material', 'emissiveIntensity', '0.35');
      }
    });
    el.addEventListener('mouseleave', () => {
      if (hoveredEl === el) hoveredEl = null;
      if (el !== selectedPaket) {
        el.setAttribute('material', 'emissive', '#ffaa00');
        el.setAttribute('material', 'emissiveIntensity', '0.4');
      }
    });
  });
}

// Progress Pips
const pipsEl = document.getElementById('progress-pips');
lieferschein.forEach((_,i) => {
  const pip = document.createElement('div');
  pip.className = 'pip' + (i===0?' active':'');
  pip.id = 'pip-'+i;
  pipsEl.appendChild(pip);
});

let hoveredEl = null;

function dropSelectedPaket() {
  if (!selectedPaket) return;
  selectedPaket.removeAttribute('package-follow');
  if (selectedPaket._origPos) {
    const op = selectedPaket._origPos;
    selectedPaket.setAttribute('position', `${op.x} ${op.y} ${op.z}`);
  }
  selectedPaket.classList.add('interactable');
  selectedPaket.setAttribute('material','emissive','#000000');
  selectedPaket.setAttribute('material','emissiveIntensity','0');
  selectedPaket = null;
}

document.querySelectorAll('.paket').forEach(p => {
  p.addEventListener('mouseenter', () => {
    hoveredEl = p;
    if (p !== selectedPaket) {
      p.setAttribute('material','emissive','#8b6a20');
      p.setAttribute('material','emissiveIntensity','0.35');
    }
  });
  p.addEventListener('mouseleave', () => {
    if (hoveredEl === p) hoveredEl = null;
    if (p !== selectedPaket) {
      p.setAttribute('material','emissive','#000000');
      p.setAttribute('material','emissiveIntensity','0');
    }
  });
});

document.querySelectorAll('.palette-zone').forEach(pal => {
  pal.addEventListener('mouseenter', () => { hoveredEl = pal; });
  pal.addEventListener('mouseleave', () => { if (hoveredEl === pal) hoveredEl = null; });
});

// Zone entities: S1, S2, P2S3, P2S4, P2S5 + Frei-Modus-Start-Knöpfe (.free-trigger)
document.querySelectorAll('.s1-info-board, .s2-info-board, .quiz-option-s1, .quiz-option-s2, .paket-l3, .paket-l4, .belt-zone, .inbox-zone, .quiz-option-l3, .quiz-option-l4, .paket-r5, .router-exit, .quiz-option-r5, .free-trigger').forEach(el => {
  el.addEventListener('mouseenter', () => { hoveredEl = el; });
  el.addEventListener('mouseleave', () => { if (hoveredEl === el) hoveredEl = null; });
});

// Hover-Registrierung für dynamisch erzeugte Interactables (z.B. Assessment-
// Zusatzpakete in p2-s3-transport.js), die nach dem initialen querySelectorAll
// entstehen und sonst nie hoveredEl setzen → nicht aufnehmbar.
function registerHover(el) {
  el.addEventListener('mouseenter', () => { hoveredEl = el; });
  el.addEventListener('mouseleave', () => { if (hoveredEl === el) hoveredEl = null; });
}
window.registerHover = registerHover;

// B: Netzklasse ermitteln
function getNetClass(ip) {
  const first = parseInt(ip.split('.')[0]);
  if (first === 10)  return 'Klasse A · Private';
  if (first === 172) return 'Klasse B · Private';
  if (first === 192) return 'Klasse C · Private';
  return '';
}

// E: IP in Binär umwandeln
function ipToBinary(ip) {
  return ip.split('.').map(o => parseInt(o).toString(2).padStart(8,'0')).join('.');
}

// C: Timer
let timerInterval = null, timerSeconds = 0, timerStarted = false;
function startTimer() {
  if (timerStarted) return;
  timerStarted = true;
  timerInterval = setInterval(() => {
    timerSeconds++;
    const m = String(Math.floor(timerSeconds/60)).padStart(2,'0');
    const s = String(timerSeconds%60).padStart(2,'0');
    document.getElementById('timer-pill').textContent = '⏱ ' + m + ':' + s;
  }, 1000);
}
function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

// D: Palette als "voll" markieren
function checkPaletteComplete(palId, list) {
  const relevant = list.filter(e => netzwerkMap[e.network] === palId);
  if (relevant.length > 0 && relevant.every(e => e.done)) markPaletteFull(palId);
}
function markPaletteFull(palId) {
  const n = palId.split('-')[1];
  const statusEl = document.getElementById('pal-status-' + n);
  const bgEl     = document.getElementById('pal-bg-' + n);
  if (statusEl) {
    statusEl.setAttribute('value', 'FERTIG');
    statusEl.setAttribute('color', '#22cc55');
    statusEl.setAttribute('material', 'shader:flat;emissive:#22cc55;emissiveIntensity:0.7');
  }
  if (bgEl) {
    bgEl.setAttribute('material', 'color:#22cc55;emissive:#22cc55;emissiveIntensity:0.6');
    bgEl.setAttribute('animation__pulse',
      'property:material.emissiveIntensity;from:0.3;to:0.9;dur:500;dir:alternate;loop:4;easing:easeInOutSine');
  }
}

function interactWithPaket(el) {
  const ip   = el.getAttribute('data-ip');
  const pkid = el.getAttribute('data-id');
  const activeList = getActiveList();
  const eintrag = activeList.find(e => e.id===pkid && !e.done);
  if (!eintrag) { showFeedback('Dieses Paket ist bereits erledigt!', false); return; }
  if (selectedPaket && selectedPaket !== el) {
    const prev = selectedPaket;
    prev.setAttribute('package-follow',
      `active:true;mode:return;targetX:${prev._origPos.x};targetY:${prev._origPos.y};targetZ:${prev._origPos.z}`);
    setTimeout(() => {
      prev.removeAttribute('package-follow');
      prev.setAttribute('position', `${prev._origPos.x} ${prev._origPos.y} ${prev._origPos.z}`);
      prev.classList.add('interactable');
    }, 700);
  }
  selectedPaket = el;
  const origPos = el.getAttribute('position');
  el._origPos = { x: origPos.x, y: origPos.y, z: origPos.z };
  el.classList.remove('interactable');
  el.setAttribute('package-follow', 'active:true;mode:carry');
  el.setAttribute('material','emissive','#f0c030');
  el.setAttribute('material','emissiveIntensity','0.6');
  startTimer();
  const badge = document.getElementById('selected-badge');
  badge.textContent = '';
  const mainLine = document.createTextNode('📦 Paket ' + pkid + ' — ' + ip);
  const small = document.createElement('span');
  small.style.cssText = 'font-size:10px;opacity:0.7';
  small.textContent = getNetClass(ip);
  badge.appendChild(mainLine);
  badge.appendChild(document.createElement('br'));
  badge.appendChild(small);
  badge.classList.add('visible');
  document.getElementById('task-text').textContent = 'Paket ' + pkid + ' ausgewählt — lege es auf die richtige Palette!';
  const binEl = document.getElementById('binary-display');
  binEl.textContent = ipToBinary(ip);
  binEl.style.display = 'block';
}

const maxFeedbackMessages = [
  'Richtig! Die ersten Oktette verraten das Zielnetz — wie eine Postleitzahl.',
  'Gut! Das Netzwerk ergibt sich aus den führenden Oktetten der IP-Adresse.',
  'Korrekt. Netz-ID und Host-Teil getrennt durch die Subnetzmaske.',
  'Perfekt erkannt! Die Subnetzmaske zeigt, welche Bits das Netz definieren.',
];
let maxFeedbackIndex = 0;

function showMaxFeedback(ip) {
  const msg = maxFeedbackMessages[maxFeedbackIndex % maxFeedbackMessages.length];
  playMaxAudio('max_teaching_' + String((maxFeedbackIndex % 4) + 1).padStart(2, '0'));
  maxFeedbackIndex++;
  const badge = document.getElementById('selected-badge');
  const task  = document.getElementById('task-text');
  badge.textContent = 'Max — Lagerlogistik';
  badge.classList.add('visible');
  task.style.color = '#50e0a0';
  task.textContent  = msg;
  setTimeout(() => {
    badge.classList.remove('visible');
    task.style.color = '#e8edf5';
    const offen = getActiveList().find(e => !e.done);
    if (offen) task.textContent = 'Nächstes Paket: ' + offen.id + ' (' + offen.ip + ') — richtige Palette wählen.';
  }, 4000);
}

const paletteDeliveries = { 'palette-1': 0, 'palette-2': 0, 'palette-3': 0, 'palette-4': 0 };
const palettePosMap = { 'palette-1': [14, -11.5], 'palette-2': [17, -11.5], 'palette-3': [20, -11.5], 'palette-4': [21, -7.5] };


function interactWithPalette(pal) {
  if (!selectedPaket) { showFeedback('Wähle zuerst ein Paket aus dem Regal!', false); return; }
  const paketIp = selectedPaket.getAttribute('data-ip');
  const paketId = selectedPaket.getAttribute('data-id');
  const palId   = pal.getAttribute('id');
  const net     = paketIp.split('.').slice(0,3).join('.');
  if (netzwerkMap[net] === palId) {
    if (gameState === 'S3_ACTIVE') {
      s3TotalAttempts++;
      const activeList = s3Phase === 'retransmit' ? s3LostPackets : s3Lieferschein;
      const e = activeList.find(x => x.id===paketId && !x.done);
      if (e) e.done = true;
      s3Score += s3Phase === 'retransmit' ? 50 : 100;
    } else if (selectedPaket.getAttribute('data-s2') === 'true') {
      const s2e = s2LostPackets.find(x => x.id===paketId && !x.done);
      if (s2e) s2e.done = true;
    } else {
      const e = lieferschein.find(x => x.id===paketId && !x.done);
      if (e) e.done = true;
    }

    const count = paletteDeliveries[palId];
    const [px, pz] = palettePosMap[palId];
    const col = count % 2;
    const row = Math.floor(count / 2);
    const tx = px + (col - 0.5) * 0.38;
    const ty = 0.20 + row * 0.26;
    const tz = pz + 0.36;

    const pEl = selectedPaket;
    pEl.setAttribute('package-follow',
      `active:true;mode:deliver;targetX:${tx};targetY:${ty};targetZ:${tz}`);
    selectedPaket.setAttribute('material','emissive','#000000');
    selectedPaket = null;
    document.getElementById('selected-badge').classList.remove('visible');
    document.getElementById('binary-display').style.display = 'none';
    document.getElementById('score-pill').textContent = '★ ' + getTotalScore() + ' Punkte';

    const stateAtDelivery = gameState;
    setTimeout(() => {
      if (gameState !== stateAtDelivery) return;
      pEl.removeAttribute('package-follow');
      pEl.setAttribute('position', `${tx} ${ty} ${tz}`);
      pEl.setAttribute('animation__shrink',
        'property:scale;to:0.55 0.46 0.58;dur:300;easing:easeOutQuad');
      pEl.classList.remove('paket');
      pEl.classList.add('delivered-box');
      const label = document.createElement('a-text');
      label.setAttribute('value', paketIp);
      label.setAttribute('color','#fff');
      label.setAttribute('scale','0.3 0.3 0.3');
      label.setAttribute('position','0 0 0.15');
      label.setAttribute('align','center');
      label.setAttribute('material','shader:flat');
      pEl.appendChild(label);
      const check = document.createElement('a-text');
      check.setAttribute('value','ok');
      check.setAttribute('color','#22cc55');
      check.setAttribute('scale','0.45 0.45 0.45');
      check.setAttribute('position','0 0.14 0.15');
      check.setAttribute('align','center');
      check.setAttribute('material','shader:flat');
      pEl.appendChild(check);
      paletteDeliveries[palId]++;
    }, 550);
    playSoundCorrect();
    triggerFlash(true);
    showMaxFeedback(paketIp);

    if (gameState === 'S3_ACTIVE') {
      updateS3Lieferschein();
      if (s3Phase === 'main') {
        checkPaletteComplete(palId, s3Lieferschein);
        if (s3Lieferschein.every(x=>x.done)) setTimeout(startS3Retransmit, 1600);
      } else {
        if (s3LostPackets.every(x=>x.done)) {
          setTimeout(showS3CompleteOverlay, 1600);
        }
      }
    } else if (gameState === 'S2_ACTIVE') {
      updateS2Lieferschein();
      if (s2LostPackets.every(x=>x.done)) {
        // Phase 2 von S5 → zurück zum S5-Abschluss; sonst klassischer S2-Abschluss.
        if (lostPacketReturn === 's5') setTimeout(showS5CompleteOverlay, 1600);
        else setTimeout(showS2CompleteOverlay, 1600);
      }
    } else if (gameState === 'S5_ACTIVE') {
      updateLieferschein(); updatePips();
      checkPaletteComplete(palId, lieferschein);
      if (lieferschein.every(x=>x.done)) {
        stopTimer();
        // Nach dem Sortieren folgt die TCP-Fehlerbehandlung (Paketverlust) als
        // Phase 2 von S5 — erst danach der Abschluss-Screen.
        setTimeout(() => showS2Transition('s5'), 1600);
      }
    } else {
      updateLieferschein(); updatePips();
      checkPaletteComplete(palId, lieferschein);
      if (lieferschein.every(x=>x.done)) {
        stopTimer();
        setTimeout(showCompleteOverlay, 1600);
      }
    }
  } else {
    playSoundWrong();
    const correctPalId = netzwerkMap[net];
    const correctLabel = palLabelMap[correctPalId] || correctPalId;
    showFeedback('Falsch! ' + paketIp + ' gehört zu Netz ' + net + '.x — richtige Palette: ' + correctLabel, false);
    triggerFlash(false);
    if (gameState === 'S3_ACTIVE') {
      s3TotalAttempts++;
      s3Errors++;
      s3Score = Math.max(0, s3Score - (s3Phase === 'retransmit' ? 10 : 20));
    }
    document.getElementById('score-pill').textContent = '★ ' + getTotalScore() + ' Punkte';
    selectedPaket.setAttribute('material','emissive','#ff2020');
    selectedPaket.setAttribute('material','emissiveIntensity','0.7');
    const pEl = selectedPaket;
    setTimeout(() => {
      if (pEl === selectedPaket) {
        pEl.setAttribute('material','emissive','#f0c030');
        pEl.setAttribute('material','emissiveIntensity','0.6');
      }
    }, 600);
  }
}

document.addEventListener('keydown', (e) => {
  if ((e.key === 'e' || e.key === 'E') && (gameState === 'S2_BRIEFING' || gameState === 'S3_RETRANSMIT_BRIEFING')) {
    const compEl = document.getElementById('office-computer-entity');
    const comp = compEl && compEl.components['computer-proximity'];
    const near = comp && comp._hintVisible;
    if (!near) return;
    if (comp) { comp.triggered = true; comp._hintVisible = false; }
    const hint = document.getElementById('computer-hint');
    if (hint) hint.setAttribute('visible', 'false');
    if (gameState === 'S2_BRIEFING') startS2();
    else confirmS3Retransmit();
    return;
  }
  if (e.key !== 'e' && e.key !== 'E') return;

  // Kiosk-Interaktion (Info-Tafeln S3/S4) — proximitybasiert, in jedem State.
  // Die Kioske haben kein interactable-Kind (Fadenkreuz trifft sie nicht), daher
  // per Nähe: ist ein Kiosk in Reichweite (_hintVisible) und der Spieler zielt
  // nicht gerade auf ein Paket/Band, öffnet E das Info-Overlay (wie bei S1/S2).
  if (!hoveredEl) {
    const kiosks = document.querySelectorAll('[kiosk-interaction]');
    for (const kEl of kiosks) {
      const comp = kEl.components && kEl.components['kiosk-interaction'];
      if (comp && comp._hintVisible) {
        const ov = document.getElementById(kEl.id === 'l4-kiosk' ? 's4-info-overlay' : 's3-info-overlay');
        if (ov) ov.classList.remove('hidden');
        document.exitPointerLock();
        return;
      }
    }
  }

  // Frei-Modus: grüner Start-Knopf → zugehöriges Szenario (oder Assessment) starten.
  // ZONE_S1/ZONE_S2 sind erlaubt, damit man aus einem laufenden Tafel-Quiz heraus
  // direkt zu einem anderen Szenario wechseln (oder dasselbe erneut lesen) kann.
  if (hoveredEl && ScenarioManager.isFree() && ['S1_ACTIVE', 'INTRO', 'TUTORIAL', 'ZONE_S1', 'ZONE_S2'].includes(gameState)) {
    const trig = hoveredEl.closest ? hoveredEl.closest('.free-trigger') : null;
    if (trig) {
      abortBoardZoneIfActive();   // laufendes Tafel-Quiz abbrechen, falls aktiv
      const sid = trig.getAttribute('data-scenario');
      if (sid === 'assessment') {
        // Assessment im Frei-Modus: alle grünen Knöpfe ausblenden, dann läuft
        // die geführte Reihenfolge (wie im geführten Modus) bis zur Endauswertung.
        setFreeTriggersVisible(false);
        showFinalSummary();
        return;
      }
      const scn = ScenarioManager.get(sid);
      if (scn && scn.enter) scn.enter();
      return;
    }
  }

  // S1/S2 Info-Board trigger
  if (hoveredEl) {
    if (_assessmentMode && gameState === 'S1_ACTIVE') {
      if (hoveredEl.classList.contains('s1-info-board')) { enterZoneS1A(); return; }
      if (hoveredEl.classList.contains('s2-info-board')) { enterZoneS2A(); return; }
    } else {
      // Frei-Modus: auch aus einem laufenden Tafel-Quiz (ZONE_S1/ZONE_S2) heraus
      // darf die andere/eigene Tafel erneut angeschaut werden.
      const freeSwitch = ScenarioManager.isFree() && ['ZONE_S1', 'ZONE_S2'].includes(gameState);
      if (['S1_ACTIVE', 'INTRO', 'TUTORIAL'].includes(gameState) || freeSwitch) {
        if (hoveredEl.classList.contains('s1-info-board') && ScenarioManager.canEnter('s1')) { abortBoardZoneIfActive(); enterZoneS1(); return; }
        if (hoveredEl.classList.contains('s2-info-board') && ScenarioManager.canEnter('s2')) { abortBoardZoneIfActive(); enterZoneS2(); return; }
      }
    }
  }

  // Zone-Modul Delegation
  if (gameState === 'ZONE_S1' && hoveredEl) {
    if (P1.handlePickup(hoveredEl)) return;
  }
  if (gameState === 'ZONE_S2' && hoveredEl) {
    if (P2.handlePickup(hoveredEl)) return;
  }
  if (gameState === 'ZONE_S3' && hoveredEl) {
    if (P2S3.handlePickup(hoveredEl)) return;
  }
  if (gameState === 'ZONE_S4' && hoveredEl) {
    if (P2S4.handlePickup(hoveredEl)) return;
  }

  if (gameState !== 'S1_ACTIVE' && gameState !== 'S2_ACTIVE' && gameState !== 'S3_ACTIVE' && gameState !== 'S5_ACTIVE') return;
  if (!hoveredEl) return;

  const cam = document.querySelector('[camera]');
  if (!cam) return;
  const camPos = new AFRAME.THREE.Vector3();
  cam.object3D.getWorldPosition(camPos);
  const elPos = new AFRAME.THREE.Vector3();
  hoveredEl.object3D.getWorldPosition(elPos);
  const dist = camPos.distanceTo(elPos);

  if (hoveredEl.classList.contains('paket')) {
    if (dist > 4.5) { showFeedback('Geh näher an das Paket heran!', false); return; }
    interactWithPaket(hoveredEl);
  } else if (hoveredEl.classList.contains('palette-zone')) {
    if (dist > 7) { showFeedback('Geh näher an die Palette heran!', false); return; }
    interactWithPalette(hoveredEl);
  }
});

function updatePips() {
  const nextOpen = lieferschein.findIndex(x => !x.done);
  lieferschein.forEach((e,i) => {
    const pip = document.getElementById('pip-'+i);
    if (!pip) return;
    pip.className = 'pip' + (e.done ? ' done' : (i===nextOpen ? ' active' : ''));
  });
}

// Hand-Klemmbrett (3D a-text, kein Strikethrough möglich) mit einer Paketliste
// befüllen. Wird sowohl für die normale Lieferung als auch für die
// Paketverlust-Phase (S5 Phase 2) genutzt, damit das Klemmbrett zur HUD-Liste passt.
function setClipboardText(entries, header) {
  const rows = entries.map(e =>
    e.done ? 'v ' + e.id + ' erledigt' : '  ' + e.id + '  ' + e.ip
  ).join('\n');
  const th = document.getElementById('ls-text-hand');
  if (th) th.setAttribute('value', (header || 'MusterFirma GmbH\n14.01.2026') + '\n\nID      IP\n' + rows);
}

function updateLieferschein() {
  setClipboardText(lieferschein);
  // HTML-HUD mit Strikethrough
  renderLieferscheinList(lieferschein, 'lieferschein-list');
}

function renderLieferscheinList(entries, containerId, showDest) {
  const listEl = document.getElementById(containerId);
  if (!listEl) return;
  while (listEl.firstChild) listEl.removeChild(listEl.firstChild);
  const palName = { 'palette-1':'LKW 1', 'palette-2':'LKW 2', 'palette-3':'LKW 3', 'palette-4':'LKW 4' };
  const nextOpen = entries.findIndex(x => !x.done);
  entries.forEach((e, i) => {
    const row = document.createElement('div');
    row.className = 'ls-row ' + (e.done ? 'done' : i === nextOpen ? 'active' : 'pending');
    const label = document.createElement('span');
    let text = e.id + '  ' + e.ip;
    if (showDest && e.network && netzwerkMap[e.network]) {
      text += '  ' + palName[netzwerkMap[e.network]];
    }
    label.textContent = text;
    const mark = document.createElement('span');
    mark.className = 'ls-mark';
    mark.textContent = e.done ? 'v' : i === nextOpen ? '<<' : '-';
    row.appendChild(label);
    row.appendChild(mark);
    listEl.appendChild(row);
  });
}

function updateS2Lieferschein() {
  renderLieferscheinList(s2LostPackets, 'lieferschein-list', true);
  setClipboardText(s2LostPackets, 'VERLOREN — Neuübertragung\nMusterFirma GmbH');
}

function showFeedback(msg, ok) {
  const t = document.getElementById('task-text');
  t.style.color = ok ? '#4cff88' : '#ff5555';
  t.textContent = msg;
  setTimeout(() => {
    t.style.color = '#e8edf5';
    const offen = getActiveList().find(e => !e.done);
    if (offen) t.textContent = 'Nächstes Paket: ' + offen.id + ' (' + offen.ip + ') — richtige Palette wählen.';
  }, 2200);
}

function triggerFlash(ok) {
  const f = document.getElementById('flash');
  f.className = ok ? 'good' : 'bad';
  setTimeout(() => { f.className = ''; }, 350);
}

function shiftBrightness(hex, delta) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  const clamp = v => Math.max(0, Math.min(255, v + delta));
  return `rgb(${clamp(r)},${clamp(g)},${clamp(b)})`;
}

function mkConcreteCanvas(baseHex, tileSize, gridStep = 0) {
  const c = document.createElement('canvas');
  c.width = c.height = tileSize;
  const ctx = c.getContext('2d');
  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, tileSize, tileSize);
  for (let i = 0; i < tileSize * tileSize * 0.25; i++) {
    ctx.globalAlpha = Math.random() * 0.1;
    ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
    const x = Math.random() * tileSize | 0, y = Math.random() * tileSize | 0;
    ctx.fillRect(x, y, 1 + (Math.random() * 2 | 0), 1 + (Math.random() * 2 | 0));
  }
  ctx.globalAlpha = 1;
  ctx.strokeStyle = 'rgba(0,0,0,0.07)'; ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    const x = Math.random() * tileSize;
    ctx.beginPath(); ctx.moveTo(x, 0);
    ctx.lineTo(x + (Math.random() - 0.5) * 15, tileSize); ctx.stroke();
  }
  if (gridStep > 0) {
    ctx.strokeStyle = 'rgba(0,0,0,0.28)'; ctx.lineWidth = 2;
    for (let i = gridStep; i < tileSize; i += gridStep) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, tileSize); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(tileSize, i); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 1;
    for (let i = gridStep + 2; i < tileSize; i += gridStep) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, tileSize); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(tileSize, i); ctx.stroke();
    }
  }
  const tex = new AFRAME.THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = AFRAME.THREE.RepeatWrapping;
  return tex;
}

function mkWoodCanvas(baseHex, tileSize) {
  const c = document.createElement('canvas');
  c.width = tileSize; c.height = tileSize >> 1;
  const ctx = c.getContext('2d');
  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < 28; i++) {
    const y0 = (i / 28) * c.height;
    ctx.strokeStyle = i % 3 === 0 ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 0.7 + Math.random() * 1.1;
    ctx.beginPath(); ctx.moveTo(0, y0);
    for (let x = 0; x <= c.width; x += 16) ctx.lineTo(x, y0 + (Math.random() - 0.5) * 2);
    ctx.stroke();
  }
  const tex = new AFRAME.THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = AFRAME.THREE.RepeatWrapping;
  return tex;
}

function mkMetalPanelCanvas(baseHex, tileSize) {
  const c = document.createElement('canvas');
  c.width = c.height = tileSize;
  const ctx = c.getContext('2d');
  const panelH = Math.floor(tileSize / 3);
  for (let p = 0; p < 3; p++) {
    const y0 = p * panelH;
    const light = p % 2 === 0 ? 12 : -8;
    ctx.fillStyle = shiftBrightness(baseHex, light);
    ctx.fillRect(0, y0, tileSize, panelH);
  }
  for (let i = 0; i < 80; i++) {
    const y = Math.random() * tileSize;
    ctx.strokeStyle = `rgba(255,255,255,${0.015 + Math.random() * 0.03})`;
    ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(tileSize, y); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  for (let p = 1; p < 3; p++) {
    const y = p * panelH;
    ctx.fillRect(0, y - 1, tileSize, 4);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, y + 3); ctx.lineTo(tileSize, y + 3); ctx.stroke();
  }
  const tex = new AFRAME.THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = AFRAME.THREE.RepeatWrapping;
  return tex;
}

function mkAsphaltCanvas(tileSize) {
  const c = document.createElement('canvas');
  c.width = c.height = tileSize;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#585858';
  ctx.fillRect(0, 0, tileSize, tileSize);
  for (let i = 0; i < tileSize * tileSize * 0.55; i++) {
    const x = Math.random() * tileSize | 0, y = Math.random() * tileSize | 0;
    ctx.globalAlpha = 0.06 + Math.random() * 0.14;
    ctx.fillStyle = Math.random() > 0.5 ? '#888' : '#3a3a3a';
    const r = 1 + (Math.random() * 2 | 0);
    ctx.fillRect(x, y, r, r);
  }
  ctx.globalAlpha = 1;
  const tex = new AFRAME.THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = AFRAME.THREE.RepeatWrapping;
  return tex;
}

function applyProceduralTextures() {
  const floorTex = mkConcreteCanvas('#5a4e3a', 512, 128); floorTex.repeat.set(8, 10);
  const wallTex  = mkMetalPanelCanvas('#32364a', 512);    wallTex.repeat.set(5, 2);
  const ceilTex  = mkConcreteCanvas('#22253a', 512, 0);   ceilTex.repeat.set(8, 6);
  const woodTex  = mkWoodCanvas('#9a7c42', 512);          woodTex.repeat.set(4, 1);
  const palTex   = mkWoodCanvas('#8a6628', 512);          palTex.repeat.set(2, 2);
  const asphTex  = mkAsphaltCanvas(512);                  asphTex.repeat.set(12, 10);

  function applyTex(el, tex, roughness, metalness) {
    el.object3D.traverse(node => {
      if (node.isMesh && node.material && node.material.isMeshStandardMaterial) {
        node.material.map = tex;
        node.material.color.set(0xffffff);
        if (roughness !== undefined) node.material.roughness = roughness;
        if (metalness !== undefined) node.material.metalness = metalness;
        node.material.needsUpdate = true;
      }
    });
  }

  document.querySelectorAll('[mixin~="m-boden"]').forEach(el  => applyTex(el, floorTex, 0.42, 0.06));
  document.querySelectorAll('[mixin~="m-wand"]').forEach(el   => applyTex(el, wallTex,  0.55, 0.18));
  document.querySelectorAll('[mixin~="m-decke"]').forEach(el  => applyTex(el, ceilTex,  0.95, 0.0));
  document.querySelectorAll('[mixin~="m-regal-b"]').forEach(el => applyTex(el, woodTex));
  document.querySelectorAll('[mixin~="m-palette"]').forEach(el => applyTex(el, palTex));
  const roadEl = document.getElementById('outdoor-ground');
  if (roadEl) applyTex(roadEl, asphTex, 0.92, 0.0);
}

// ── S3: Assessment-Szenario ──────────────────────────────────────────────────

function showS3BriefingOverlay() {
  gameState = 'S3_BRIEFING';
  playMaxAudio('max_s3_briefing');
  document.getElementById('s3-briefing-overlay').classList.remove('hidden');
}

document.getElementById('s3-start-btn').addEventListener('click', () => {
  document.getElementById('s3-briefing-overlay').classList.add('hidden');
  initS3();
  const canvas = document.querySelector('a-scene canvas');
  if (canvas) canvas.requestPointerLock();
});

function initS3() {
  gameState = 'S3_ACTIVE';
  s3Phase = 'main';
  s3Score = 0;
  s3Errors = 0;
  s3TotalAttempts = 0;
  s3StartMs = Date.now();

  stopTimer();
  timerSeconds = 0;
  timerStarted = false;
  document.getElementById('timer-pill').textContent = '⏱ 00:00';

  s3Lieferschein = shuffle(s3Data.map(d => ({ ...d, done: false })));
  s3LostPackets  = [];

  // HUD anpassen
  const hudTag = document.getElementById('hud-tag');
  if (hudTag) hudTag.textContent = '■ Assessment — Lernkontrolle';
  document.getElementById('task-text').style.color = '#e8edf5';
  document.getElementById('task-text').textContent = 'Assessment: Fadenkreuz auf Paket richten und E drücken.';

  // Palette 4 einblenden
  const pal4 = document.getElementById('palette-4');
  if (pal4) pal4.setAttribute('visible', 'true');

  // Palettenstatus zurücksetzen
  resetPaletteStatuses();

  dropSelectedPaket();

  // Alte gelieferte Boxen verstecken
  document.querySelectorAll('.delivered-box').forEach(el => el.setAttribute('visible', 'false'));
  Object.keys(paletteDeliveries).forEach(k => paletteDeliveries[k] = 0);

  // PC-Bildschirm auf Standby zurücksetzen
  (function resetComputerScreen() {
    const scr = document.getElementById('computer-screen');
    if (scr) {
      scr.removeAttribute('animation__blink');
      scr.setAttribute('material', 'color:#001428;emissive:#002244;emissiveIntensity:0.8;shader:flat');
    }
    const l1 = document.getElementById('computer-line1');
    if (l1) { l1.setAttribute('value', 'SYSTEM BEREIT'); l1.setAttribute('scale', '0.1 0.1 0.1'); l1.setAttribute('position', '0 1.365 0.029'); }
    const l2 = document.getElementById('computer-line2');
    if (l2) { l2.setAttribute('value', '---'); l2.setAttribute('visible', 'true'); }
  })();

  // S1-Pakete verstecken
  document.querySelectorAll('.interactable.paket:not(.s3-paket)').forEach(el => el.setAttribute('visible', 'false'));
  document.querySelectorAll('.s2-paket').forEach(el => el.setAttribute('visible', 'false'));

  // Progress-Pips für S3 neu rendern
  const pipsEl = document.getElementById('progress-pips');
  while (pipsEl.firstChild) pipsEl.removeChild(pipsEl.firstChild);
  s3Lieferschein.forEach((_, i) => {
    const pip = document.createElement('div');
    pip.className = 'pip' + (i === 0 ? ' active' : '');
    pip.id = 's3pip-' + i;
    pipsEl.appendChild(pip);
  });

  renderLieferscheinList(s3Lieferschein, 'lieferschein-list', true);
  updateClipboard(s3Lieferschein, 'Assessment Phase 1');
  spawnS3Packages();
}

const s3SlotPositions = [
  [-5.8,1.12,-7.8],  [-4.2,1.12,-9.5],
  [-5.8,1.12,-11.2], [-4.2,1.12,-12.0],
  [ 5.8,1.12,-7.8],  [ 4.2,1.12,-9.5],
  [ 5.8,1.12,-11.2], [ 4.2,1.12,-12.0],
];

function spawnS3Packages() {
  const scene = document.querySelector('a-scene');
  const slots = shuffle([...s3SlotPositions]);
  s3Lieferschein.forEach((entry, i) => {
    const [x, y, z] = slots[i];
    const el = document.createElement('a-entity');
    el.setAttribute('class', 'interactable paket s3-paket');
    el.setAttribute('id', 's3-paket-' + entry.id);
    el.setAttribute('data-ip', entry.ip);
    el.setAttribute('data-id', entry.id);
    el.setAttribute('position', x + ' ' + y + ' ' + z);
    el.setAttribute('geometry', 'primitive:box;width:0.58;height:0.48;depth:0.48');
    el.setAttribute('material', 'color:#c8a060;roughness:0.9;emissive:#000000;emissiveIntensity:0');
    el.setAttribute('shadow', 'cast:true;receive:true');

    const lw = document.createElement('a-entity');
    lw.setAttribute('look-at', '[camera]');
    lw.setAttribute('position', '0 0.30 0');
    const bg = document.createElement('a-plane');
    bg.setAttribute('material', 'color:#0a1828;opacity:0.9;shader:flat;side:double');
    bg.setAttribute('width', '0.58'); bg.setAttribute('height', '0.14');
    const txt = document.createElement('a-text');
    txt.setAttribute('value', entry.ip);
    txt.setAttribute('color', '#a8d8ff');
    txt.setAttribute('scale', '0.65 0.65 0.65');
    txt.setAttribute('align', 'center');
    txt.setAttribute('position', '0 0 0.002');
    txt.setAttribute('material', 'shader:flat');
    lw.appendChild(bg); lw.appendChild(txt);
    el.appendChild(lw);

    const tape = document.createElement('a-box');
    tape.setAttribute('material', 'color:#e8d060;roughness:0.8');
    tape.setAttribute('position', '0 0.245 0');
    tape.setAttribute('width', '0.62'); tape.setAttribute('height', '0.03'); tape.setAttribute('depth', '0.1');
    el.appendChild(tape);

    scene.appendChild(el);

    el.addEventListener('mouseenter', () => {
      hoveredEl = el;
      if (el !== selectedPaket) {
        el.setAttribute('material', 'emissive', '#8b6a20');
        el.setAttribute('material', 'emissiveIntensity', '0.35');
      }
    });
    el.addEventListener('mouseleave', () => {
      if (hoveredEl === el) hoveredEl = null;
      if (el !== selectedPaket) {
        el.setAttribute('material', 'emissive', '#000000');
        el.setAttribute('material', 'emissiveIntensity', '0');
      }
    });
  });
}

const s3RetransmitSlots = [
  [4.2, 3.52, -7.8],
  [5.8, 3.52, -9.5],
  [5.0, 3.52, -11.2],
];

function startS3Retransmit() {
  s3Phase = 'retransmit';
  const shuffled = shuffle([...s3Lieferschein]);
  s3LostPackets = shuffled.slice(0, 3).map(p => ({ ...p, done: false }));
  playMaxAudio('max_s3_retransmit');
  gameState = 'S3_RETRANSMIT_BRIEFING';

  const task = document.getElementById('task-text');
  task.style.color = '#ffcc40';
  task.textContent = '⚠ Paketverlust erkannt! Geh ins Büro und schau auf den Computer.';

  showStepBanner({
    counter: 'Assessment · Retransmission',
    icon: '🖥️',
    title: 'Geh zum Computer',
    keys: ['W','A','S','D'],
    desc: 'Büro links durch die Tür — tritt an den Bildschirm heran und drücke E'
  });

  const scrS3 = document.getElementById('computer-screen');
  if (scrS3) {
    scrS3.setAttribute('material', 'color:#200000;emissive:#cc0000;emissiveIntensity:0.9;shader:flat');
    scrS3.setAttribute('animation__blink',
      'property:material.emissiveIntensity;from:0.9;to:0.2;dur:600;dir:alternate;loop:true;easing:easeInOutSine');
  }

  const glow = document.getElementById('office-glow');
  if (glow) glow.setAttribute('visible', 'true');
  const waypoint = document.getElementById('computer-waypoint');
  if (waypoint) waypoint.setAttribute('visible', 'true');

  const compEl = document.getElementById('office-computer-entity');
  const comp = compEl && compEl.components['computer-proximity'];
  if (comp) { comp.triggered = false; comp._hintVisible = false; }
}

function confirmS3Retransmit() {
  hideStepBanner();
  const hint = document.getElementById('computer-hint');
  if (hint) hint.setAttribute('visible', 'false');

  const glow = document.getElementById('office-glow');
  if (glow) glow.setAttribute('visible', 'false');
  const waypoint = document.getElementById('computer-waypoint');
  if (waypoint) waypoint.setAttribute('visible', 'false');

  const pipsEl = document.getElementById('progress-pips');
  while (pipsEl.firstChild) pipsEl.removeChild(pipsEl.firstChild);
  s3LostPackets.forEach((_, i) => {
    const pip = document.createElement('div');
    pip.className = 'pip' + (i === 0 ? ' active' : '');
    pip.id = 's3rpip-' + i;
    pipsEl.appendChild(pip);
  });

  renderComputerScreen(s3LostPackets, s3Lieferschein);
  renderLieferscheinList(s3LostPackets, 'lieferschein-list', true);
  updateClipboard(s3LostPackets, 'Assessment Phase 2');
  gameState = 'S3_ACTIVE';

  const task = document.getElementById('task-text');
  task.style.color = '#ffcc40';
  task.textContent = '⚠ 3 Pakete retransmittieren — sie sind in Regal B (oben).';

  spawnS3RetransmitPackages();
}

function spawnS3RetransmitPackages() {
  const scene = document.querySelector('a-scene');
  s3LostPackets.forEach((entry, i) => {
    const [x, y, z] = s3RetransmitSlots[i] || [8.0, 3.62, -8.5];
    const el = document.createElement('a-entity');
    el.setAttribute('class', 'interactable paket s3-paket s3-retransmit-paket');
    el.setAttribute('id', 's3r-paket-' + entry.id);
    el.setAttribute('data-ip', entry.ip);
    el.setAttribute('data-id', entry.id);
    el.setAttribute('position', x + ' ' + y + ' ' + z);
    el.setAttribute('geometry', 'primitive:box;width:0.58;height:0.48;depth:0.48');
    el.setAttribute('material', 'color:#c8a060;roughness:0.9;emissive:#ffaa00;emissiveIntensity:0.4');
    el.setAttribute('shadow', 'cast:true;receive:true');

    const lw = document.createElement('a-entity');
    lw.setAttribute('look-at', '[camera]');
    lw.setAttribute('position', '0 0.30 0');
    const bg = document.createElement('a-plane');
    bg.setAttribute('material', 'color:#0a1828;opacity:0.9;shader:flat;side:double');
    bg.setAttribute('width', '0.58'); bg.setAttribute('height', '0.14');
    const txt = document.createElement('a-text');
    txt.setAttribute('value', entry.ip);
    txt.setAttribute('color', '#ffcc40');
    txt.setAttribute('scale', '0.65 0.65 0.65');
    txt.setAttribute('align', 'center');
    txt.setAttribute('position', '0 0 0.002');
    txt.setAttribute('material', 'shader:flat');
    lw.appendChild(bg); lw.appendChild(txt);
    el.appendChild(lw);

    const tape = document.createElement('a-box');
    tape.setAttribute('material', 'color:#ff8800;roughness:0.8');
    tape.setAttribute('position', '0 0.245 0');
    tape.setAttribute('width', '0.62'); tape.setAttribute('height', '0.03'); tape.setAttribute('depth', '0.1');
    el.appendChild(tape);

    scene.appendChild(el);

    el.addEventListener('mouseenter', () => {
      hoveredEl = el;
      if (el !== selectedPaket) {
        el.setAttribute('material', 'emissive', '#8b6a20');
        el.setAttribute('material', 'emissiveIntensity', '0.35');
      }
    });
    el.addEventListener('mouseleave', () => {
      if (hoveredEl === el) hoveredEl = null;
      if (el !== selectedPaket) {
        el.setAttribute('material', 'emissive', '#ffaa00');
        el.setAttribute('material', 'emissiveIntensity', '0.4');
      }
    });
  });
}

function updateClipboard(entries, title) {
  const th = document.getElementById('ls-text-hand');
  if (!th) return;
  const rows = entries.map(e =>
    e.done ? 'v ' + e.id + ' erledigt' : '  ' + e.id + '  ' + e.ip
  ).join('\n');
  th.setAttribute('value', title + '\n\nID      IP\n' + rows);
}

function updateS3Lieferschein() {
  const list = s3Phase === 'retransmit' ? s3LostPackets : s3Lieferschein;
  renderLieferscheinList(list, 'lieferschein-list', true);
  updateClipboard(list, s3Phase === 'retransmit' ? 'Assessment Phase 2' : 'Assessment Phase 1');

  // Pips aktualisieren
  const prefix = s3Phase === 'retransmit' ? 's3rpip-' : 's3pip-';
  const nextOpen = list.findIndex(x => !x.done);
  list.forEach((e, i) => {
    const pip = document.getElementById(prefix + i);
    if (!pip) return;
    pip.className = 'pip' + (e.done ? ' done' : (i === nextOpen ? ' active' : ''));
  });
}

function getS3Rating(pct) {
  if (pct >= 0.90) return '"Perfekt! Du kennst dich mit Netzwerken aus." — Max';
  if (pct >= 0.75) return '"Sehr gut! Noch ein paar Details, und du bist Profi." — Max';
  if (pct >= 0.60) return '"Gut gemacht! Die Grundlagen sitzen." — Max';
  return '"Übung macht den Meister — versuch\'s nochmal!" — Max';
}

function fmtMs(ms) {
  const s = Math.floor(ms / 1000);
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}

function showS3CompleteOverlay() {
  playSoundComplete();
  stopTimer();
  s3FinalSeconds = timerSeconds;
  document.exitPointerLock();
  gameState = 'S3_COMPLETE';

  const maxPts = 8 * 100 + 3 * 50;
  const pct = s3Score / maxPts;
  const m = String(Math.floor(s3FinalSeconds / 60)).padStart(2, '0');
  const s = String(s3FinalSeconds % 60).padStart(2, '0');

  if (pct >= 0.90) playMaxAudio('max_s3_complete_100');
  else if (pct >= 0.75) playMaxAudio('max_s3_complete_hi');
  else if (pct >= 0.60) playMaxAudio('max_s3_complete_mid');
  else playMaxAudio('max_s3_complete_lo');

  document.getElementById('s3-score').textContent = s3Score + ' / ' + maxPts + '  (' + Math.round(pct * 100) + '%)';
  document.getElementById('s3-time').textContent   = m + ':' + s;
  const correct = s3TotalAttempts - s3Errors;
  document.getElementById('s3-correct').textContent = correct + ' / ' + s3TotalAttempts + ' Versuche';
  document.getElementById('s3-errors').textContent  = s3Errors;
  document.getElementById('s3-max-quote').textContent = getS3Rating(pct);

  document.getElementById('s3-complete-overlay').classList.remove('hidden');
}

document.getElementById('s3-retry-btn').addEventListener('click', () => {
  document.getElementById('s3-complete-overlay').classList.add('hidden');
  // S3-Pakete entfernen, neu starten
  document.querySelectorAll('.s3-paket').forEach(el => el.parentNode && el.parentNode.removeChild(el));
  initS3();
  const canvas = document.querySelector('a-scene canvas');
  if (canvas) canvas.requestPointerLock();
});

document.getElementById('s3-training-btn').addEventListener('click', resetToS1);

document.getElementById('s3-finish-btn').addEventListener('click', () => {
  document.getElementById('s3-complete-overlay').classList.add('hidden');
  showFinalSummary();
});

function resetToS1() {
  document.getElementById('s3-complete-overlay').classList.add('hidden');

  // S3-Pakete entfernen
  document.querySelectorAll('.s3-paket').forEach(el => el.parentNode && el.parentNode.removeChild(el));

  // S1-Pakete wiederherstellen
  dropSelectedPaket();
  shuffle(slotPool);
  let slotIdx = 0;
  ['paket-A1','paket-A2','paket-A3','paket-A4','paket-A5'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const [x, y, z] = slotPool[slotIdx++];
    el.removeAttribute('animation__shrink');
    el.removeAttribute('package-follow');
    el.setAttribute('position', `${x} ${y} ${z}`);
    el.object3D.position.set(x, y, z);
    el.setAttribute('scale', '1 1 1');
    el.object3D.scale.set(1, 1, 1);
    el.setAttribute('visible', 'true');
    el.classList.add('interactable', 'paket');
    el.classList.remove('delivered-box');
    el.setAttribute('material', 'emissive', '#000000');
    el.setAttribute('material', 'emissiveIntensity', '0');
    Array.from(el.querySelectorAll(':scope > a-text')).forEach(t => t.parentNode.removeChild(t));
  });

  // Palette 4 ausblenden (nur S3)
  const pal4 = document.getElementById('palette-4');
  if (pal4) pal4.setAttribute('visible', 'false');

  resetPaletteStatuses();
  Object.keys(paletteDeliveries).forEach(k => paletteDeliveries[k] = 0);

  // Lieferschein zurücksetzen
  lieferschein.forEach(e => { e.done = false; });
  shuffle(lieferschein);

  // Score und Timer zurücksetzen
  score = 0;
  s2Score = 0;
  s3Score = 0;
  s1FinalSeconds = 0;
  s3FinalSeconds = 0;
  stopTimer();
  timerSeconds = 0;
  timerStarted = false;
  document.getElementById('score-pill').textContent = '★ 0 Punkte';
  document.getElementById('timer-pill').textContent = '⏱ 00:00';

  // HUD zurücksetzen
  document.getElementById('selected-badge').classList.remove('visible');
  document.getElementById('binary-display').style.display = 'none';
  const hudTag = document.getElementById('hud-tag');
  hudTag.textContent = '■ Lern-Szenario 1';
  hudTag.classList.remove('tutorial');

  // Progress-Pips für S1 neu aufbauen
  const pipsEl = document.getElementById('progress-pips');
  while (pipsEl.firstChild) pipsEl.removeChild(pipsEl.firstChild);
  lieferschein.forEach((_, i) => {
    const pip = document.createElement('div');
    pip.className = 'pip' + (i === 0 ? ' active' : '');
    pip.id = 'pip-' + i;
    pipsEl.appendChild(pip);
  });
  pipsEl.style.display = '';

  document.getElementById('player').object3D.position.set(0, 0, 2);
  gameState = 'S1_ACTIVE';

  // A-Frame-Komponenten-Flags zurücksetzen, damit Proximity-Trigger erneut feuern
  const compEl = document.querySelector('[computer-proximity]');
  if (compEl && compEl.components['computer-proximity']) {
    compEl.components['computer-proximity'].triggered = false;
  }
  const npcEl = document.querySelector('[proximity-dialog]');
  if (npcEl && npcEl.components['proximity-dialog']) {
    npcEl.components['proximity-dialog'].triggered = false;
  }

  updateLieferschein();

  // Wegweiser zurücksetzen: alle aus, S1 sofort an
  ['waypoint-s2', 'waypoint-s3'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.setAttribute('visible', 'false');
  });
  const wpReset = document.getElementById('waypoint-s1');
  if (wpReset) wpReset.setAttribute('visible', 'true');

  showNPCBriefing();

  const canvas = document.querySelector('a-scene canvas');
  if (canvas) canvas.requestPointerLock();
}

function showFinalSummary() {
  _assessmentMode = true;
  // Lern-Tafeln S1/S2 neutralisieren, damit beim Assessment nicht die alte
  // Lern-Frage inkl. markierter Lösung an der Tafel hängen bleibt.
  P1.reset?.();
  P2.reset?.();
  P2S6.start(function() { _showFinalOverlay(); });
  const hudTag = document.getElementById('hud-tag');
  if (hudTag) hudTag.textContent = '■ Assessment — alle Zonen';
  const taskText = document.getElementById('task-text');
  if (taskText) taskText.textContent = '🎯 Assessment! Besuche alle Zonen erneut. Start: S1-Tafel (links).';
  gameState = 'S1_ACTIVE';
  const canvas = document.querySelector('a-scene canvas');
  if (canvas) canvas.requestPointerLock();
  setArrowTarget(-7, 0);
  setInstruction('Assessment: Geh zur S1-Tafel (links vom Eingang)');
}

function _showFinalOverlay() {
  playMaxAudio('max_final_hi');
  document.exitPointerLock?.();
  document.getElementById('final-s1').textContent = 'abgeschlossen';
  document.getElementById('final-s2').textContent = 'abgeschlossen';
  document.getElementById('final-s3').textContent = 'Assessment — abgeschlossen';
  document.getElementById('final-total').textContent = 'Alle Szenarien & Assessment';
  document.getElementById('final-time').textContent = '—';
  document.getElementById('final-max-quote').textContent =
    '"Hervorragend! Du hast alle Lernszenarien und das Assessment abgeschlossen." — Max';
  document.getElementById('final-overlay').classList.remove('hidden');
}

function resetPaletteStatuses() {
  const configs = [
    { n: '1', color: '#3a5fcc', label: '#aaccff' },
    { n: '2', color: '#1e7040', label: '#aaffcc' },
    { n: '3', color: '#b04a18', label: '#ffcc88' },
    { n: '4', color: '#6a2ea0', label: '#cc88ff' },
  ];
  configs.forEach(({ n, color, label }) => {
    const bg = document.getElementById('pal-bg-' + n);
    const status = document.getElementById('pal-status-' + n);
    if (bg) {
      bg.removeAttribute('animation__pulse');
      bg.setAttribute('material', 'shader:flat;color:' + color);
    }
    if (status) {
      status.setAttribute('value', 'ABLADEN');
      status.setAttribute('color', label);
      status.removeAttribute('material');
    }
  });
}

document.querySelector('a-scene').addEventListener('loaded', () => {
  updateLieferschein();
  shuffle(slotPool);
  document.querySelectorAll('.interactable.paket:not(#tutorial-paket)').forEach((el, i) => {
    const [x, y, z] = slotPool[i];
    el.setAttribute('position', `${x} ${y} ${z}`);
  });
  applyProceduralTextures();

  // Lieferschein + Pips während Tutorial ausblenden
  document.getElementById('lieferschein-list').style.display = 'none';
  document.getElementById('progress-pips').style.display  = 'none';

  // S1/S2 Info-Overlay Buttons
  document.getElementById('s1-info-close').addEventListener('click', () => {
    document.getElementById('s1-info-overlay').classList.add('hidden');
    const canvas = document.querySelector('a-scene canvas');
    if (canvas) canvas.requestPointerLock();
    if (_assessmentMode) {
      P1.initAssessment((s) => {
        P2S6.markDone('s1');
        gameState = 'S1_ACTIVE';
        const t = document.getElementById('task-text');
        if (t) t.textContent = 'Assessment S1 abgeschlossen! Geh zur grünen Tafel rechts für S2.';
        setArrowTarget(7, 0.15);
        setInstruction('Assessment: Geh zur grünen S2-Tafel (E)');
      });
    } else {
      P1.init((s) => {
        ScenarioManager.markDone('s1');
        gameState = 'S1_ACTIVE';
        document.getElementById('s2-station').setAttribute('visible', true);
        const hudTag = document.getElementById('hud-tag');
        const t = document.getElementById('task-text');
        if (ScenarioManager.isFree()) {
          if (hudTag) hudTag.textContent = '■ Freier Modus';
          if (t) t.textContent = 'S1 abgeschlossen! Wähle das nächste Szenario per grünem Knopf [E].';
          const wpS1 = document.getElementById('waypoint-s1');
          if (wpS1) wpS1.setAttribute('visible', 'false');
          setArrowTarget(null, null); setInstruction('');
        } else {
          if (hudTag) hudTag.textContent = '■ Lern-Szenario 2';
          const wpS1 = document.getElementById('waypoint-s1');
          if (wpS1) wpS1.setAttribute('visible', 'false');
          const wpS2 = document.getElementById('waypoint-s2');
          if (wpS2) wpS2.setAttribute('visible', 'true');
          if (t) t.textContent = 'S1 abgeschlossen! Geh zur grünen Tafel rechts vom Eingang für S2.';
          setArrowTarget(7, 0.15);
          setInstruction('Geh zur grünen S2-Tafel rechts — drücke [E]');
        }
      });
    }
  });
  document.getElementById('s2-info-close').addEventListener('click', () => {
    document.getElementById('s2-info-overlay').classList.add('hidden');
    const canvas = document.querySelector('a-scene canvas');
    if (canvas) canvas.requestPointerLock();
    if (_assessmentMode) {
      P2.initAssessment((s) => {
        P2S6.markDone('s2');
        gameState = 'S1_ACTIVE';
        const t = document.getElementById('task-text');
        if (t) t.textContent = 'Assessment S2 abgeschlossen! Geh durch die Tür rechts für S3 (Transport).';
        setArrowTarget(5, -20);
        setInstruction('Assessment: Geh nach Norden — Transport-Flügel rechts (S3)');
      });
    } else {
      P2.init((s) => {
        ScenarioManager.markDone('s2');
        gameState = 'S1_ACTIVE';
        openGate('s3door');
        const hudTag = document.getElementById('hud-tag');
        const t = document.getElementById('task-text');
        const wpS2 = document.getElementById('waypoint-s2');
        if (wpS2) wpS2.setAttribute('visible', 'false');
        if (ScenarioManager.isFree()) {
          if (hudTag) hudTag.textContent = '■ Freier Modus';
          if (t) t.textContent = 'S2 abgeschlossen! Wähle das nächste Szenario per grünem Knopf [E].';
          setArrowTarget(null, null); setInstruction('');
        } else {
          if (hudTag) hudTag.textContent = '■ Lern-Szenario 3';
          const wpS3 = document.getElementById('waypoint-s3');
          if (wpS3) wpS3.setAttribute('visible', 'true');
          if (t) t.textContent = 'S2 abgeschlossen! Nordflügel freigeschaltet — geh durch die Tür! S3 (Transport) ist rechts.';
          setArrowTarget(5, -20);
          setInstruction('Geh nach Norden durch die Halle — Transport-Flügel rechts (S3)');
        }
      });
    }
  });

  // S3/S4 Info-Overlays (reine Infotafeln, kein Quiz) — schließen + Maus wieder sperren
  ['s3-info-close', 's4-info-close'].forEach(id => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('click', () => {
      document.getElementById(id.replace('-close', '-overlay')).classList.add('hidden');
      const canvas = document.querySelector('a-scene canvas');
      if (canvas) canvas.requestPointerLock();
    });
  });

  function _resetS5Packets(baseIds, slotOffset) {
    let _slotIdx = slotOffset || 0;
    baseIds.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const [x, y, z] = slotPool[_slotIdx++];
      el.removeAttribute('animation__shrink');
      el.removeAttribute('package-follow');
      el.setAttribute('position', `${x} ${y} ${z}`);
      el.object3D.position.set(x, y, z);
      el.setAttribute('scale', '1 1 1');
      el.object3D.scale.set(1, 1, 1);
      el.setAttribute('visible', 'true');
      el.classList.add('interactable', 'paket');
      el.classList.remove('delivered-box');
      el.setAttribute('material', 'emissive', '#000000');
      el.setAttribute('material', 'emissiveIntensity', '0');
      Array.from(el.querySelectorAll(':scope > a-text')).forEach(t => t.parentNode.removeChild(t));
    });
  }

  function _spawnS5ExtraPackets() {
    const S5A_EXTRAS = [
      { elemId: 'paket-A6', lieferId: '24518', ip: '10.1.0.5',  network: '10.1.0' },
      { elemId: 'paket-A7', lieferId: '24519', ip: '10.1.0.22', network: '10.1.0' },
      { elemId: 'paket-A8', lieferId: '24520', ip: '10.1.0.8',  network: '10.1.0' },
    ];
    const scene = document.querySelector('a-scene');
    S5A_EXTRAS.forEach((extra, i) => {
      lieferschein.push({ id: extra.lieferId, ip: extra.ip, network: extra.network, done: false });

      const [x, y, z] = slotPool[5 + i];
      const el = document.createElement('a-entity');
      el.setAttribute('id', extra.elemId);
      el.setAttribute('class', 'interactable paket');
      el.setAttribute('data-ip', extra.ip);
      el.setAttribute('data-id', extra.lieferId);
      el.setAttribute('geometry', 'primitive:box;width:0.58;height:0.48;depth:0.48');
      el.setAttribute('material', 'color:#c8a060;roughness:0.9;emissive:#ffaa00;emissiveIntensity:0.4');
      el.setAttribute('shadow', 'cast:true;receive:true');
      el.setAttribute('position', `${x} ${y} ${z}`);

      const labelWrapper = document.createElement('a-entity');
      labelWrapper.setAttribute('look-at', '[camera]');
      labelWrapper.setAttribute('position', '0 0.30 0');
      const bg = document.createElement('a-plane');
      bg.setAttribute('material', 'color:#0a1828;opacity:0.9;shader:flat;side:double');
      bg.setAttribute('width', '0.58');
      bg.setAttribute('height', '0.14');
      const txt = document.createElement('a-text');
      txt.setAttribute('value', extra.ip);
      txt.setAttribute('color', '#ffcc40');
      txt.setAttribute('scale', '0.65 0.65 0.65');
      txt.setAttribute('align', 'center');
      txt.setAttribute('position', '0 0 0.002');
      txt.setAttribute('material', 'shader:flat');
      labelWrapper.appendChild(bg);
      labelWrapper.appendChild(txt);
      el.appendChild(labelWrapper);

      scene.appendChild(el);
      // Hover-Listener nachrüsten: dynamisch erzeugte Pakete bekommen sonst nie
      // die mouseenter/mouseleave-Handler (die nur beim Laden via querySelectorAll
      // verteilt werden) → hoveredEl bleibt null → nicht aufnehmbar.
      // Beim Verlassen den gelben Eigenglow (#ffaa00) wiederherstellen statt #000000.
      el.addEventListener('mouseenter', () => {
        hoveredEl = el;
        if (el !== selectedPaket) {
          el.setAttribute('material', 'emissive', '#ffcc40');
          el.setAttribute('material', 'emissiveIntensity', '0.7');
        }
      });
      el.addEventListener('mouseleave', () => {
        if (hoveredEl === el) hoveredEl = null;
        if (el !== selectedPaket) {
          el.setAttribute('material', 'emissive', '#ffaa00');
          el.setAttribute('material', 'emissiveIntensity', '0.4');
        }
      });
      _s5aExtras.push(el);
    });
  }

  function _cleanupS5Extras() {
    _s5aExtras.forEach(el => { if (el.parentNode) el.parentNode.removeChild(el); });
    _s5aExtras = [];
    // Remove extra lieferschein entries (IDs 24518-24520)
    const extraIds = new Set(['24518', '24519', '24520']);
    for (let i = lieferschein.length - 1; i >= 0; i--) {
      if (extraIds.has(lieferschein[i].id)) lieferschein.splice(i, 1);
    }
    const p4 = document.getElementById('palette-4');
    if (p4) p4.setAttribute('visible', false);
  }

  // S5-Briefing: Spielmechanik starten
  document.getElementById('s5-briefing-start-btn').addEventListener('click', () => {
    document.getElementById('s5-briefing-overlay').classList.add('hidden');

    // IP-Sortier-HUD + Hand-Klemmbrett einblenden (gehören zu S5)
    setS5Hud(true);

    dropSelectedPaket();
    shuffle(slotPool);

    // Pakete in Regale zurücksetzen
    _resetS5Packets(['paket-A1','paket-A2','paket-A3','paket-A4','paket-A5'], 0);

    // Paletten zurücksetzen
    resetPaletteStatuses();
    Object.keys(paletteDeliveries).forEach(k => paletteDeliveries[k] = 0);

    // Lieferschein zurücksetzen
    lieferschein.forEach(e => { e.done = false; });
    shuffle(lieferschein);

    if (_assessmentMode) {
      // Assessment: 3 extra IP-Pakete + palette-4 aktivieren
      _cleanupS5Extras();
      const p4 = document.getElementById('palette-4');
      if (p4) p4.setAttribute('visible', true);
      _spawnS5ExtraPackets();
    }

    // Score und Timer zurücksetzen
    score = 0;
    stopTimer();
    timerSeconds = 0;
    timerStarted = false;
    document.getElementById('score-pill').textContent = '★ 0 Punkte';
    document.getElementById('timer-pill').textContent = '⏱ 00:00';
    document.getElementById('selected-badge').classList.remove('visible');
    document.getElementById('binary-display').style.display = 'none';

    // Pips neu aufbauen
    const pipsEl = document.getElementById('progress-pips');
    while (pipsEl.firstChild) pipsEl.removeChild(pipsEl.firstChild);
    lieferschein.forEach((_, i) => {
      const pip = document.createElement('div');
      pip.className = 'pip' + (i === 0 ? ' active' : '');
      pip.id = 'pip-' + i;
      pipsEl.appendChild(pip);
    });

    updateLieferschein();

    const taskText = document.getElementById('task-text');
    if (taskText) taskText.textContent = _assessmentMode
      ? 'Assessment S5: 8 Pakete sortieren — prüfe die IP-Adresse und lege es auf die richtige Palette (E).'
      : 'S5: Nimm ein Paket (E), prüfe die IP-Adresse und lege es auf die richtige Palette (E).';

    gameState = 'S5_ACTIVE';
    const canvas = document.querySelector('a-scene canvas');
    if (canvas) canvas.requestPointerLock();
    setArrowTarget(0, -5);
    setInstruction(_assessmentMode
      ? 'Assessment: Sortiere 8 IP-Pakete (inkl. 10.1.0.x → LKW 4)'
      : 'Geh zurück zur Lagerhalle und sortiere die IP-Pakete');
  });

  // S5-Abschluss: Gesamtauswertung anzeigen
  document.getElementById('s5-complete-btn').addEventListener('click', () => {
    document.getElementById('s5-complete-overlay').classList.add('hidden');
    // IP-Sortier-HUD + Klemmbrett wieder ausblenden (gehören nur zu S5)
    setS5Hud(false);
    // Paketverlust-Meldung am Büro-Computer zurücksetzen (S5 ist abgeschlossen)
    resetOfficeComputer();
    if (_assessmentMode) {
      _cleanupS5Extras();
      gameState = 'S1_ACTIVE';
      P2S6.markDone('s5');
    } else if (ScenarioManager.isFree()) {
      // Frei-Modus: KEIN automatischer Assessment-Start. Zurück in die freie
      // Wahl — das Assessment hat einen eigenen grünen Trigger.
      ScenarioManager.markDone('s5');
      gameState = 'S1_ACTIVE';
      const t = document.getElementById('task-text');
      if (t) t.textContent = 'S5 abgeschlossen! Freier Modus — wähle das nächste Szenario oder das Assessment per grünem Knopf [E].';
      const hudTag = document.getElementById('hud-tag');
      if (hudTag) hudTag.textContent = '■ Freier Modus';
      const canvas = document.querySelector('a-scene canvas');
      if (canvas) canvas.requestPointerLock();
    } else {
      // Geführter Modus: nach S5 folgt direkt das Assessment (unverändert).
      ScenarioManager.markDone('s5');
      gameState = 'S1_ACTIVE';
      showFinalSummary();
    }
  });

  // Szenarien beim ScenarioManager registrieren (einheitlicher Vertrag).
  // `enter` startet das Szenario; `module` ist das jeweilige IIFE-Modul.
  ScenarioManager.register('s1', { enter: enterZoneS1, module: P1 });
  ScenarioManager.register('s2', { enter: enterZoneS2, module: P2 });
  ScenarioManager.register('s3', { enter: enterZoneS3, module: P2S3 });
  ScenarioManager.register('s4', { enter: enterZoneS4, module: P2S4 });
  ScenarioManager.register('s5', { enter: enterZoneS5, module: P2S5 });

  // Zone-Detektion (alle P2-Zonen)
  initGates();
  let _zoneCheckInterval = setInterval(() => {
    const cam = document.querySelector('[camera]');
    if (!cam) return;
    const pos = new AFRAME.THREE.Vector3();
    cam.object3D.getWorldPosition(pos);

    // Entry — tiefste Zone zuerst (else-if verhindert Mehrfachtrigger).
    // Im freien Modus erfolgt der Start NUR per grünem Knopf → kein Auto-Entry
    // (ScenarioManager.isFree() blockt die positionsbasierten Trigger).
    if (pos.z < -16.5) {
      if (_assessmentMode && gameState === 'S1_ACTIVE') {
        if (pos.x >= 0) enterZoneS3A();
        else            enterZoneS4A();
      } else if (!ScenarioManager.isFree() && ['S1_ACTIVE', 'INTRO', 'TUTORIAL'].includes(gameState)) {
        if (pos.x >= 0) enterZoneS3();
        else            enterZoneS4();
      }
    } else if (pos.x < -12.5 && pos.z > -12 && pos.z < 0) {
      if (_assessmentMode && gameState === 'S1_ACTIVE') {
        enterZoneS5A();
      } else if (!ScenarioManager.isFree() && ['S1_ACTIVE', 'INTRO', 'TUTORIAL'].includes(gameState)) {
        enterZoneS5();
      }
    }
    // Exit — Nordflügel zurück in Haupthalle
    if (pos.z >= -15.5) {
      if (gameState === 'ZONE_S3') {
        P2S3.teardown(); gameState = 'S1_ACTIVE';
        hideStepBanner(); setInstruction('');
        const t = document.getElementById('task-text');
        if (t) t.textContent = 'Haupthalle — S3 abgebrochen. Geh erneut in den Transport-Flügel (rechts).';
      } else if (gameState === 'ZONE_S4') {
        P2S4.teardown(); gameState = 'S1_ACTIVE';
        hideStepBanner(); setInstruction('');
        const t = document.getElementById('task-text');
        if (t) t.textContent = 'Haupthalle — S4 abgebrochen. Geh erneut in den Anwendungs-Flügel (links).';
      }
    }
    // (Früher: positionsbasierter Abbruch des S5-Briefings beim Verlassen des Büros.
    //  Entfernt — das Briefing ist ein modales Overlay (Pointer entsperrt, keine
    //  Bewegung möglich) und wird im Frei-Modus vom grünen Knopf in der Haupthalle
    //  ausgelöst. Die Prüfung feuerte dort sofort und schloss das Overlay direkt
    //  wieder. Beendet wird das Briefing jetzt ausschließlich über seine Buttons.)
    // Richtungspfeil drehen: Zielrichtung in Kamera-Lokalraum projizieren
    if (_arrowTarget) {
      const THREE = AFRAME.THREE;
      const wpos = new THREE.Vector3();
      cam.object3D.getWorldPosition(wpos);
      // Weltvektor zum Ziel (Y ignorieren)
      const toTarget = new THREE.Vector3(
        _arrowTarget.x - wpos.x, 0, _arrowTarget.z - wpos.z
      ).normalize();
      // Kamera-Weltquaternion invertieren → Welt→Lokal-Rotation
      const camQ = new THREE.Quaternion();
      cam.object3D.getWorldQuaternion(camQ);
      camQ.invert();
      toTarget.applyQuaternion(camQ);
      // Im Kamera-Lokalraum: -Z = vorwärts, +X = rechts
      // rel > 0 = Ziel rechts, rel < 0 = Ziel links
      const rel = Math.atan2(toTarget.x, -toTarget.z) * 180 / Math.PI;
      const arrowEl = document.getElementById('dir-arrow');
      if (arrowEl) arrowEl.style.transform = `translateX(-50%) rotate(${rel}deg)`;
    }
    // Frei-Modus: grüne Start-Knöpfe bleiben sichtbar — Szenarien sind beliebig
    // oft wiederholbar. Ausgeblendet werden sie nur während des Assessments
    // (siehe setFreeTriggersVisible(false) beim Assessment-Start).
  }, 400);

});
