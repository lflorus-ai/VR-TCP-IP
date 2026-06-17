const P2S4 = (() => {
  let _score = 0;
  let _processed = 0;
  let _onComplete = null;
  let _selectedPaket = null;
  let _feedbackTimeout = null;
  let _carryRaf = null;
  let _activePackets = null;
  let _dynamicEntities = [];

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
      reason: '✓ DNS — MX-Einträge im DNS liefern den zuständigen Mailserver.',
    },
  ];

  const ASSESSMENT_EXTRA = [
    {
      id: 'l4-paket-7', protocol: 'http', label: 'REST-API-Aufruf',
      pos: [-4.5, 1.18, -23.3],
      reason: '✓ HTTP — REST-Dienste nutzen HTTP als Übertragungsprotokoll.',
    },
    {
      id: 'l4-paket-8', protocol: 'smtp', label: 'Newsletter senden',
      pos: [-5.5, 1.18, -23.1],
      reason: '✓ SMTP — Auch Massen-E-Mails werden per SMTP versendet.',
    },
    {
      id: 'l4-paket-9', protocol: 'ftp', label: 'Backup hochladen',
      pos: [-6.5, 1.18, -23.5],
      reason: '✓ FTP — FTP überträgt große Dateien wie Backups zuverlässig.',
    },
    {
      id: 'l4-paket-10', protocol: 'dns', label: 'MX-Record abfragen',
      pos: [-7.5, 1.18, -23.3],
      reason: '✓ DNS — MX-Records im DNS verweisen auf Mailserver.',
    },
  ];

  function _showFeedback(text, correct) {
    const panel = document.getElementById('l4-feedback-panel');
    const txt   = document.getElementById('l4-feedback-text');
    if (!panel || !txt) return;
    txt.setAttribute('value', text);
    txt.setAttribute('color', correct ? '#60ff90' : '#ff7050');
    panel.setAttribute('visible', true);
    clearTimeout(_feedbackTimeout);
    _feedbackTimeout = setTimeout(() => {
      panel.setAttribute('visible', false);
    }, 8000);
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
      el.setAttribute('geometry', 'primitive:box;width:0.45;height:0.35;depth:0.35');
      el.setAttribute('material', 'color:#c8a060;roughness:0.9');
      el.setAttribute('position', p.pos.join(' '));
      el.setAttribute('shadow', 'cast:true;receive:true');
      const txt = document.createElement('a-text');
      txt.setAttribute('value', p.label);
      txt.setAttribute('align', 'center');
      txt.setAttribute('color', '#ffffff');
      txt.setAttribute('scale', '0.5 0.5 0.5');
      txt.setAttribute('position', '0 0.28 0.18');
      el.appendChild(txt);
      scene.appendChild(el);
      _dynamicEntities.push(el);
    });
  }

  function _onDrop(paketId, inboxProtocol) {
    const packet = _activePackets.find(p => p.id === paketId);
    if (!packet) return;

    const el = document.getElementById(paketId);
    if (el) el.setAttribute('visible', false);

    _processed++;
    const correct = packet.protocol === inboxProtocol;
    if (correct) {
      _score += 100;
      _showFeedback(packet.reason, true);
    } else {
      _score = Math.max(0, _score - 20);
      _showFeedback(
        '✗ Falsch! ' + packet.label + ' gehört zu ' + packet.protocol.toUpperCase()
        + '\n→ ' + packet.reason.replace('✓ ', ''),
        false,
      );
    }

    const scorePill = document.getElementById('score-pill');
    if (scorePill) scorePill.textContent = _score + ' P';

    if (_processed >= _activePackets.length) {
      clearTimeout(_feedbackTimeout);
      const panel = document.getElementById('l4-feedback-panel');
      if (panel) panel.setAttribute('visible', false);
      setTimeout(() => { if (_onComplete) _onComplete(_score); }, 1200);
    }
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
      if (el) el.setAttribute('visible', true);
    });
    const panel = document.getElementById('l4-feedback-panel');
    if (panel) panel.setAttribute('visible', false);

    const taskTextEl = document.getElementById('task-text');
    if (taskTextEl) taskTextEl.textContent = taskText;
    const scorePill = document.getElementById('score-pill');
    if (scorePill) scorePill.textContent = '0 P';
  }

  return {
    init(onComplete) {
      _commonInit(
        onComplete,
        PACKETS,
        'Anwendungs-Flügel: Nimm ein Paket (E) und lege es in den richtigen Protokoll-Briefkasten',
      );
    },

    initAssessment(onComplete) {
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
      _selectedPaket = null;
      _onComplete = null;
    },

    getScore() { return _score; },

    handlePickup(target) {
      if (target.classList.contains('paket-l4') && !_selectedPaket) {
        _selectedPaket = target;
        _startCarrying(target);
        _highlightInboxes(true);

        const badge = document.getElementById('selected-badge');
        if (badge) {
          badge.classList.add('visible');
          badge.textContent = '📦 ' + (target.getAttribute('data-protocol') || '').toUpperCase() + '?';
        }
        target.setAttribute('material', 'color:#ffffff');
        return true;
      }
      if (target.classList.contains('inbox-zone') && _selectedPaket) {
        _stopCarrying();
        _highlightInboxes(false);
        const inboxProto = target.getAttribute('data-protocol');
        const paketId = _selectedPaket.id;
        _selectedPaket.setAttribute('material', 'color:#c8a060;roughness:0.9');
        _selectedPaket = null;
        const badge = document.getElementById('selected-badge');
        if (badge) badge.classList.remove('visible');
        _onDrop(paketId, inboxProto);
        return true;
      }
      return false;
    },

    _dropForTest(paketId, inboxProtocol) { _onDrop(paketId, inboxProtocol); },
  };
})();

const L4 = P2S4;
