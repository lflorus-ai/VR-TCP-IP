const P2S4 = (() => {
  let _score = 0;
  let _processed = 0;
  let _onComplete = null;
  let _selectedPaket = null;
  let _feedbackTimeout = null;
  let _carryRaf = null;
  let _activePackets = null;
  let _assessMode = false;
  let _dynamicEntities = [];
  const _homePos = {}; // id -> {x,y,z,color} Ausgangszustand (fuer Reset beim Neustart)

  const PACKETS = [
    {
      id: 'l4-paket-1', protocol: 'http', label: 'Webseite laden',
      reason: '✓ HTTP — Browser laden Webseiten über HTTP/HTTPS.',
    },
    {
      id: 'l4-paket-2', protocol: 'dns', label: 'Domain → IP',
      reason: '✓ DNS — DNS übersetzt Domainnamen in IP-Adressen.',
    },
    {
      id: 'l4-paket-3', protocol: 'ftp', label: 'Datei hochladen',
      reason: '✓ FTP — FTP ist das Standardprotokoll für Dateiübertragung.',
    },
    {
      id: 'l4-paket-4', protocol: 'smtp', label: 'E-Mail senden',
      reason: '✓ SMTP — SMTP überträgt E-Mails zwischen Mailservern.',
    },
    {
      id: 'l4-paket-5', protocol: 'http', label: 'API-Request',
      reason: '✓ HTTP — REST-APIs kommunizieren über HTTP/HTTPS.',
    },
    {
      id: 'l4-paket-6', protocol: 'dns', label: 'Mail-Server finden',
      reason: '✓ DNS — DNS findet über den MX-Eintrag (Mail-Exchange, der Wegweiser zum Mailserver einer Domain) den zuständigen Mailserver.',
    },
  ];

  // Zusatzpakete fürs Assessment: liegen in den freien Plätzen der Tisch-Reihe
  // (Originale stehen bei x=-4.5..-9.0, z≈-21.5; Tisch ist im Assessment auf width:10 verbreitert)
  const ASSESSMENT_EXTRA = [
    {
      id: 'l4-paket-7', protocol: 'http', label: 'REST-API-Aufruf',
      pos: [-3.5, 1.18, -21.5], color: '#c8a060',
      reason: '✓ HTTP — REST-Dienste nutzen HTTP als Übertragungsprotokoll.',
    },
    {
      id: 'l4-paket-8', protocol: 'smtp', label: 'Newsletter senden',
      pos: [-2.5, 1.18, -21.5], color: '#b09050',
      reason: '✓ SMTP — Auch Massen-E-Mails werden per SMTP versendet.',
    },
    {
      id: 'l4-paket-9', protocol: 'ftp', label: 'Backup hochladen',
      pos: [-10.0, 1.18, -21.5], color: '#d0a850',
      reason: '✓ FTP — FTP überträgt große Dateien wie Backups zuverlässig.',
    },
    {
      id: 'l4-paket-10', protocol: 'dns', label: 'Mailserver nachschlagen',
      pos: [-11.0, 1.18, -21.5], color: '#c8a060',
      reason: '✓ DNS — Der MX-Eintrag (Mail-Exchange) im DNS ist der Wegweiser zum Mailserver einer Domain.',
    },
  ];

  // persist=true: Panel bleibt sichtbar bis zur nächsten Aktion (Fehler-Hinweise),
  // sonst blendet es nach 8 s aus.
  function _showFeedback(text, correct, persist) {
    const panel = document.getElementById('l4-feedback-panel');
    const txt   = document.getElementById('l4-feedback-text');
    if (!panel || !txt) return;
    txt.setAttribute('value', window.deumlaut ? window.deumlaut(text) : text);
    txt.setAttribute('color', correct ? '#60ff90' : '#ff7050');
    panel.setAttribute('visible', true);
    clearTimeout(_feedbackTimeout);
    if (!persist) {
      _feedbackTimeout = setTimeout(() => {
        panel.setAttribute('visible', false);
      }, 8000);
    }
  }

  function _hideFeedback() {
    clearTimeout(_feedbackTimeout);
    const panel = document.getElementById('l4-feedback-panel');
    if (panel) panel.setAttribute('visible', false);
  }

  // Im Lern-Modus gibt es keine Punkte (nur Feedback), daher auch keine
  // Score-Anzeige. Punkte zählen ausschließlich im Assessment.
  function _updateScoreHud() {
    if (_assessMode && window.refreshScoreHud) window.refreshScoreHud();
  }

  const _INBOX_COLORS = {
    'l4-drop-http': '#3060a0',
    'l4-drop-dns':  '#f5c518',
    'l4-drop-ftp':  '#50e0a0',
    'l4-drop-smtp': '#ff7850',
  };

  function _highlightInboxes(on) {
    Object.entries(_INBOX_COLORS).forEach(([id, color]) => {
      const el = document.getElementById(id);
      if (el) el.setAttribute('material', `color:${color};opacity:${on ? 0.4 : 0.0};transparent:true`);
    });
  }

  function _startCarrying(paketEl) {
    const THREE = AFRAME.THREE;
    const cam = document.querySelector('[camera]');
    if (!cam) return;

    const _camPos = new THREE.Vector3();
    const _camQ   = new THREE.Quaternion();
    const _fwd    = new THREE.Vector3();
    const _right  = new THREE.Vector3();
    const _up     = new THREE.Vector3(0, 1, 0);

    function _tick() {
      if (!_selectedPaket) return;

      cam.object3D.getWorldPosition(_camPos);
      cam.object3D.getWorldQuaternion(_camQ);

      _fwd.set(0, 0, -1).applyQuaternion(_camQ);
      _fwd.y = 0;
      if (_fwd.lengthSq() > 0.001) _fwd.normalize();
      _right.crossVectors(_fwd, _up).normalize();

      const x = _camPos.x + _fwd.x * 0.75 + _right.x * 0.35;
      const y = _camPos.y - 0.40 + Math.sin(Date.now() * 0.003) * 0.04;
      const z = _camPos.z + _fwd.z * 0.75 + _right.z * 0.35;

      paketEl.object3D.position.set(x, y, z);
      _carryRaf = requestAnimationFrame(_tick);
    }

    _carryRaf = requestAnimationFrame(_tick);
  }

  function _stopCarrying() {
    if (_carryRaf !== null) {
      cancelAnimationFrame(_carryRaf);
      _carryRaf = null;
    }
  }

  function _spawnExtraPackets() {
    const scene = document.querySelector('a-scene');
    if (!scene) return;
    ASSESSMENT_EXTRA.forEach(p => {
      const el = document.createElement('a-entity');
      el.setAttribute('id', p.id);
      el.setAttribute('class', 'interactable paket-l4');
      el.setAttribute('data-protocol', p.protocol);
      // gleiche Geometrie wie die Original-Pakete (l4-paket-1..6)
      el.setAttribute('geometry', 'primitive:box;width:0.55;height:0.48;depth:0.48');
      el.setAttribute('material', 'color:' + (p.color || '#c8a060') + ';roughness:0.9');
      el.setAttribute('position', p.pos.join(' '));
      el.setAttribute('shadow', 'cast:true;receive:true');

      // kamera-zugewandtes Label mit Hintergrundplatte (wie Originale) → keine
      // überlappenden Welttexte mehr
      const labelWrap = document.createElement('a-entity');
      labelWrap.setAttribute('look-at', '[camera]');
      labelWrap.setAttribute('position', '0 0.3 0');
      const plane = document.createElement('a-plane');
      plane.setAttribute('material', 'color:#0a1828;opacity:0.9;shader:flat;side:double');
      plane.setAttribute('width', '0.55');
      plane.setAttribute('height', '0.12');
      const txt = document.createElement('a-text');
      txt.setAttribute('value', p.label);
      txt.setAttribute('color', '#a8d8ff');
      txt.setAttribute('scale', '0.38 0.38 0.38');
      txt.setAttribute('align', 'center');
      txt.setAttribute('position', '0 0 0.002');
      txt.setAttribute('material', 'shader:flat');
      labelWrap.appendChild(plane);
      labelWrap.appendChild(txt);
      el.appendChild(labelWrap);

      scene.appendChild(el);
      // Hover-Listener nachrüsten, damit hoveredEl gesetzt wird (sonst nicht aufnehmbar)
      if (window.registerHover) window.registerHover(el);
      _dynamicEntities.push(el);
    });
  }

  // Gibt zurück, ob das Paket abgelegt (verbraucht) wurde. Falsche Ablage wird
  // abgelehnt: das Paket bleibt in der Hand und muss in den richtigen Briefkasten
  // getragen werden. Der Punktabzug (-20) bleibt erhalten.
  function _onDrop(paketId, inboxProtocol) {
    const packet = _activePackets.find(p => p.id === paketId);
    if (!packet) return false;

    const correct = packet.protocol === inboxProtocol;
    if (!correct) {
      if (_assessMode) _score = Math.max(0, _score - 20);
      _showFeedback(
        '✗ Falsch! „' + packet.label + '“ gehört zu '
        + packet.protocol.toUpperCase() + '.\n→ ' + packet.reason.replace('✓ ', '')
        + '\nTrag das Paket in den richtigen Briefkasten.',
        false, true,
      );
      _updateScoreHud();
      return false;
    }

    const el = document.getElementById(paketId);
    // Verbrauchtes Paket vollständig aus der Interaktion nehmen: unsichtbar UND
    // nicht mehr interactable, sonst kann der Ray es weiter anvisieren und man
    // "nimmt" ein längst zugeordnetes (unsichtbares) Paket erneut auf.
    if (el) { el.classList.remove('interactable'); el.setAttribute('visible', false); }

    _processed++;
    if (_assessMode) _score += 100;
    _showFeedback(packet.reason, true);
    _updateScoreHud();

    if (_processed >= _activePackets.length) {
      // Feedback zum letzten Paket sichtbar lassen und erst danach abschliessen,
      // damit man die Rueckmeldung noch lesen kann (Abschluss-Screen verdeckt sie).
      setTimeout(() => { if (_onComplete) _onComplete(_score); }, 2800);
    }
    return true;
  }

  function _commonInit(onComplete, packets, taskText) {
    _score = 0;
    _processed = 0;
    _selectedPaket = null;
    _onComplete = onComplete;
    _activePackets = packets;
    _stopCarrying();

    ['l4-inbox-http', 'l4-inbox-dns', 'l4-inbox-ftp', 'l4-inbox-smtp'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.setAttribute('visible', true);
    });
    _activePackets.forEach(p => {
      const el = document.getElementById(p.id);
      if (!el) return;
      // Ausgangsposition + Farbe einmalig merken, dann bei jedem Start
      // zuruecksetzen — sonst tauchen die Pakete beim Neustart dort auf, wo sie
      // zuletzt lagen und ueberlappen sich (ein getragenes bliebe zudem weiss).
      if (!_homePos[p.id]) {
        const pos = el.getAttribute('position');
        const mat = el.getAttribute('material');
        if (pos) _homePos[p.id] = {
          x: pos.x, y: pos.y, z: pos.z,
          color: (mat && mat.color) ? mat.color : '#c8a060',
        };
      }
      const h = _homePos[p.id];
      if (h) {
        el.object3D.position.set(h.x, h.y, h.z);
        el.setAttribute('material', 'color:' + h.color + ';roughness:0.9');
      }
      // 'interactable' defensiv wieder setzen (wird beim Tragen entfernt).
      el.classList.add('interactable');
      el.setAttribute('visible', true);
    });
    const panel = document.getElementById('l4-feedback-panel');
    if (panel) panel.setAttribute('visible', false);

    const taskTextEl = document.getElementById('task-text');
    if (taskTextEl) taskTextEl.textContent = taskText;
    // Score-Anzeige nur im Assessment; im Lern-Modus ausblenden (keine Punkte).
    const scorePill = document.getElementById('score-pill');
    if (scorePill) {
      if (_assessMode) { scorePill.style.display = ''; scorePill.textContent = '0 P'; }
      else scorePill.style.display = 'none';
    }
  }

  return {
    init(onComplete) {
      _assessMode = false;
      _commonInit(
        onComplete,
        PACKETS,
        'Anwendungs-Flügel: Nimm ein Paket (E) und lege es in den richtigen Protokoll-Briefkasten',
      );
    },

    initAssessment(onComplete) {
      _assessMode = true;
      _spawnExtraPackets();
      _commonInit(
        onComplete,
        [...PACKETS, ...ASSESSMENT_EXTRA],
        'Assessment Anwendungs-Flügel: 10 Pakete — HTTP/DNS/FTP/SMTP-Briefkasten (E)',
      );
    },

    teardown() {
      _stopCarrying();
      _highlightInboxes(false);
      clearTimeout(_feedbackTimeout);
      ['l4-inbox-http', 'l4-inbox-dns', 'l4-inbox-ftp', 'l4-inbox-smtp'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.setAttribute('visible', false);
      });
      (_activePackets || PACKETS).forEach(p => {
        const el = document.getElementById(p.id);
        if (el) el.setAttribute('visible', false);
      });
      _dynamicEntities.forEach(el => { if (el.parentNode) el.parentNode.removeChild(el); });
      _dynamicEntities = [];
      _activePackets = null;
      const panel = document.getElementById('l4-feedback-panel');
      if (panel) panel.setAttribute('visible', false);
      // Score-Anzeige wieder freigeben (im Lern-Modus ausgeblendet).
      const scorePill = document.getElementById('score-pill');
      if (scorePill) scorePill.style.display = '';
      _selectedPaket = null;
      _onComplete = null;
    },

    getScore() { return _score; },
    getMaxScore() { return (_activePackets || PACKETS).length * 100; },

    handlePickup(target) {
      if (target.classList.contains('paket-l4') && !_selectedPaket) {
        _selectedPaket = target;
        // Getragenes Paket aus dem Cursor-Ray nehmen (Peilung).
        target.classList.remove('interactable');
        _hideFeedback();
        _startCarrying(target);
        _highlightInboxes(true);

        const badge = document.getElementById('selected-badge');
        if (badge) {
          badge.classList.add('visible');
          const picked = _activePackets ? _activePackets.find(p => p.id === target.id) : null;
          badge.textContent = '📦 ' + (picked ? picked.label : '');
        }
        target.setAttribute('material', 'color:#ffffff');
        return true;
      }
      if (target.classList.contains('inbox-zone') && _selectedPaket) {
        const inboxProto = target.getAttribute('data-protocol');
        const paketId = _selectedPaket.id;
        const consumed = _onDrop(paketId, inboxProto);
        if (consumed) {
          _stopCarrying();
          _highlightInboxes(false);
          _selectedPaket.setAttribute('material', 'color:#c8a060;roughness:0.9');
          _selectedPaket = null;
          const badge = document.getElementById('selected-badge');
          if (badge) badge.classList.remove('visible');
        }
        // Falsche Ablage: Paket bleibt in der Hand — zum richtigen Briefkasten tragen.
        return true;
      }
      return false;
    },

    _dropForTest(paketId, inboxProtocol) { _onDrop(paketId, inboxProtocol); },
  };
})();

const L4 = P2S4;
