const P2S4 = (() => {
  let _score = 0;
  let _processed = 0;
  let _onComplete = null;
  let _selectedPaket = null;
  let _feedbackTimeout = null;
  let _carryRaf = null;

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

  function _onDrop(paketId, inboxProtocol) {
    const packet = PACKETS.find(p => p.id === paketId);
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

    if (_processed >= PACKETS.length) {
      clearTimeout(_feedbackTimeout);
      const panel = document.getElementById('l4-feedback-panel');
      if (panel) panel.setAttribute('visible', false);
      setTimeout(() => { if (_onComplete) _onComplete(_score); }, 1200);
    }
  }

  return {
    init(onComplete) {
      _score = 0;
      _processed = 0;
      _selectedPaket = null;
      _onComplete = onComplete;
      _stopCarrying();

      ['l4-inbox-http', 'l4-inbox-dns', 'l4-inbox-ftp', 'l4-inbox-smtp'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.setAttribute('visible', true);
      });
      PACKETS.forEach(p => {
        const el = document.getElementById(p.id);
        if (el) el.setAttribute('visible', true);
      });
      const panel = document.getElementById('l4-feedback-panel');
      if (panel) panel.setAttribute('visible', false);

      const taskText = document.getElementById('task-text');
      if (taskText) taskText.textContent = 'Anwendungs-Flügel: Nimm ein Paket (E) und lege es in den richtigen Protokoll-Briefkasten';

      const scorePill = document.getElementById('score-pill');
      if (scorePill) scorePill.textContent = '0 P';
    },

    teardown() {
      _stopCarrying();
      _highlightInboxes(false);
      clearTimeout(_feedbackTimeout);
      ['l4-inbox-http', 'l4-inbox-dns', 'l4-inbox-ftp', 'l4-inbox-smtp'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.setAttribute('visible', false);
      });
      PACKETS.forEach(p => {
        const el = document.getElementById(p.id);
        if (el) el.setAttribute('visible', false);
      });
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
