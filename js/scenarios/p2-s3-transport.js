const P2S3 = (() => {
  let _score = 0;
  let _assigned = 0;  // only correct ones (for score display)
  let _processed = 0; // all handled packets (for completion check)
  let _onComplete = null;
  let _selectedPaket = null;
  let _feedbackTimeout = null;
  let _carryRaf = null;

  const PACKETS = [
    {
      id: 'l3-paket-1', protocol: 'tcp', label: 'E-Mail-Versand',
      reason: '✓ TCP — E-Mails müssen vollständig ankommen. Jedes Byte wird bestätigt.',
    },
    {
      id: 'l3-paket-2', protocol: 'udp', label: 'Video-Stream',
      reason: '✓ UDP — Bei Live-Video zählt Geschwindigkeit. Kurze Verluste sind akzeptabel.',
    },
    {
      id: 'l3-paket-3', protocol: 'tcp', label: 'Datei-Download',
      reason: '✓ TCP — Jedes Byte der Datei muss korrekt übertragen werden.',
    },
    {
      id: 'l3-paket-4', protocol: 'udp', label: 'Online-Gaming',
      reason: '✓ UDP — Echtzeitreaktion ist wichtiger als Vollständigkeit.',
    },
    {
      id: 'l3-paket-5', protocol: 'tcp', label: 'Webseitenanfrage',
      reason: '✓ TCP — HTTP(S) braucht TCP: Webseiten müssen vollständig laden.',
    },
  ];

  function _showFeedback(text, correct) {
    const panel = document.getElementById('l3-feedback-panel');
    const txt   = document.getElementById('l3-feedback-text');
    if (!panel || !txt) return;
    txt.setAttribute('value', text);
    txt.setAttribute('color', correct ? '#60ff90' : '#ff7050');
    panel.setAttribute('visible', true);
    clearTimeout(_feedbackTimeout);
    _feedbackTimeout = setTimeout(() => {
      panel.setAttribute('visible', false);
    }, 8000);
  }

  function _startCarrying(paketEl) {
    const THREE = AFRAME.THREE;
    const cam = document.querySelector('[camera]');
    if (!cam) return;

    const _camPos = new THREE.Vector3();
    const _camQ   = new THREE.Quaternion();
    const _fwd    = new THREE.Vector3();

    function _tick() {
      if (!_selectedPaket) return;

      cam.object3D.getWorldPosition(_camPos);
      cam.object3D.getWorldQuaternion(_camQ);

      // Camera looks along local -Z; project to XZ plane so packet stays level
      _fwd.set(0, 0, -1).applyQuaternion(_camQ);
      _fwd.y = 0;
      if (_fwd.lengthSq() > 0.001) _fwd.normalize();

      const x = _camPos.x + _fwd.x * 0.85;
      const y = _camPos.y - 0.25 + Math.sin(Date.now() * 0.003) * 0.04; // gentle bob
      const z = _camPos.z + _fwd.z * 0.85;

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

  function _onDrop(paketId, beltId) {
    const packet = PACKETS.find(p => p.id === paketId);
    if (!packet) return;

    const el = document.getElementById(paketId);
    if (el) el.setAttribute('visible', false);

    _processed++;
    const correct = packet.protocol === beltId;
    if (correct) {
      _score += 100;
      _assigned++;
      _showFeedback(packet.reason, true);
    } else {
      _score = Math.max(0, _score - 20);
      _showFeedback(
        '✗ Falsch! ' + packet.label + ' gehört zu ' + packet.protocol.toUpperCase()
        + '\n→ ' + (packet.protocol === 'tcp'
          ? 'TCP garantiert Zustellung — wichtig für vollständige Daten.'
          : 'UDP ist schneller — gut wenn einzelne Verluste tolerierbar sind.'),
        false,
      );
    }

    const scorePill = document.getElementById('score-pill');
    if (scorePill) scorePill.textContent = _score + ' P';

    if (_processed >= PACKETS.length) {
      clearTimeout(_feedbackTimeout);
      const panel = document.getElementById('l3-feedback-panel');
      if (panel) panel.setAttribute('visible', false);
      setTimeout(() => { if (_onComplete) _onComplete(_score); }, 1200);
    }
  }

  return {
    init(onComplete) {
      _score = 0;
      _assigned = 0;
      _processed = 0;
      _selectedPaket = null;
      _onComplete = onComplete;
      _stopCarrying();

      ['l3-belt-tcp', 'l3-belt-udp', 'l3-belt-feed', 'l3-belt-junction'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.setAttribute('visible', true);
      });
      PACKETS.forEach(p => {
        const el = document.getElementById(p.id);
        if (el) el.setAttribute('visible', true);
      });
      const panel = document.getElementById('l3-feedback-panel');
      if (panel) panel.setAttribute('visible', false);

      const taskText = document.getElementById('task-text');
      if (taskText) taskText.textContent = 'Transport-Flügel: Nimm ein Paket (E) und trage es auf das richtige Förderband — TCP oder UDP';

      const scorePill = document.getElementById('score-pill');
      if (scorePill) scorePill.textContent = '0 P';
    },

    teardown() {
      _stopCarrying();
      clearTimeout(_feedbackTimeout);
      ['l3-belt-tcp', 'l3-belt-udp', 'l3-belt-feed', 'l3-belt-junction'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.setAttribute('visible', false);
      });
      PACKETS.forEach(p => {
        const el = document.getElementById(p.id);
        if (el) el.setAttribute('visible', false);
      });
      const panel = document.getElementById('l3-feedback-panel');
      if (panel) panel.setAttribute('visible', false);
      _selectedPaket = null;
      _onComplete = null;
    },

    getScore() { return _score; },

    handlePickup(target) {
      if (target.classList.contains('paket-l3') && !_selectedPaket) {
        _selectedPaket = target;
        _startCarrying(target);

        const badge = document.getElementById('selected-badge');
        if (badge) {
          badge.classList.add('visible');
          badge.textContent = '📦 ' + (target.getAttribute('data-protocol') || '').toUpperCase() + '?';
        }
        target.setAttribute('material', 'color:#ffffff');
        return true;
      }
      if (target.classList.contains('belt-zone') && _selectedPaket) {
        _stopCarrying();
        const beltId  = target.getAttribute('data-belt');
        const paketId = _selectedPaket.id;
        _selectedPaket.setAttribute('material', 'color:#c8a060;roughness:0.9');
        _selectedPaket = null;
        const badge = document.getElementById('selected-badge');
        if (badge) badge.classList.remove('visible');
        _onDrop(paketId, beltId);
        return true;
      }
      return false;
    },

    _dropForTest(paketId, beltId) { _onDrop(paketId, beltId); },
  };
})();

// Alias für game.js (L3 → P2S3)
const L3 = P2S3;
