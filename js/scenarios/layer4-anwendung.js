const L4 = (() => {
  let _score = 0;
  let _assigned = 0;
  let _quizAnswered = false;
  let _onComplete = null;
  let _selectedPaket = null;

  const PACKETS = [
    { id: 'l4-paket-1', protocol: 'http',  label: 'Webseite laden'     },
    { id: 'l4-paket-2', protocol: 'dns',   label: 'Domain → IP'        },
    { id: 'l4-paket-3', protocol: 'ftp',   label: 'Datei hochladen'    },
    { id: 'l4-paket-4', protocol: 'smtp',  label: 'E-Mail senden'      },
    { id: 'l4-paket-5', protocol: 'http',  label: 'API-Request'        },
    { id: 'l4-paket-6', protocol: 'dns',   label: 'Mail-Server finden' },
  ];

  const QUIZ = {
    question: 'Welches Protokoll wird zum Versenden von E-Mails verwendet?',
    options: [
      { text: 'HTTP — für Web-Anfragen',             correct: false },
      { text: 'DNS  — für Namensauflösung',           correct: false },
      { text: 'SMTP — Simple Mail Transfer Protocol', correct: true  },
      { text: 'FTP  — für Datei-Transfer',            correct: false },
    ],
  };

  function _showQuiz() {
    const term = document.getElementById('l4-quiz-terminal');
    if (!term) return;
    term.setAttribute('visible', true);

    document.getElementById('l4-quiz-question').setAttribute('value', QUIZ.question);
    const ids = ['a', 'b', 'c', 'd'];
    QUIZ.options.forEach((opt, i) => {
      const box = document.getElementById('l4-quiz-' + ids[i]);
      if (box) {
        box.setAttribute('data-correct', opt.correct ? 'true' : 'false');
        box._opt = opt;
      }
      const txt = document.getElementById('l4-quiz-' + ids[i] + '-text');
      if (txt) txt.setAttribute('value', ['A','B','C','D'][i] + ': ' + opt.text);
    });
  }

  function _onDrop(paketId, inboxProtocol) {
    if (_quizAnswered) return;
    const packet = PACKETS.find(p => p.id === paketId);
    if (!packet) return;

    const el = document.getElementById(paketId);
    if (el) el.setAttribute('visible', false);

    const correct = packet.protocol === inboxProtocol;
    if (correct) {
      _score += 100;
      _assigned++;
    } else {
      _score = Math.max(0, _score - 20);
    }

    const scorePill = document.getElementById('score-pill');
    if (scorePill) scorePill.textContent = _score + ' P';

    const taskText = document.getElementById('task-text');
    if (taskText) taskText.textContent = correct
      ? '✓ Richtig! ' + packet.label + ' → ' + inboxProtocol.toUpperCase()
      : '✗ Falsch! ' + packet.label + ' gehört zu ' + packet.protocol.toUpperCase();

    if (_assigned >= PACKETS.length) {
      setTimeout(_showQuiz, 800);
    }
  }

  function _onQuizAnswer(boxEl) {
    if (_quizAnswered) return;
    _quizAnswered = true;

    const correct = boxEl.getAttribute('data-correct') === 'true';
    const ids = ['a', 'b', 'c', 'd'];
    ids.forEach(id => {
      const b = document.getElementById('l4-quiz-' + id);
      if (b) {
        if (b._opt && b._opt.correct) {
          b.setAttribute('material', 'color:#1a4020;roughness:0.5');
        } else if (b === boxEl && !correct) {
          b.setAttribute('material', 'color:#401010;roughness:0.5');
        }
      }
    });

    if (correct) _score += 200;

    setTimeout(() => {
      if (_onComplete) _onComplete(_score);
    }, 1500);
  }

  return {
    init(onComplete) {
      _score = 0;
      _assigned = 0;
      _quizAnswered = false;
      _selectedPaket = null;
      _onComplete = onComplete;

      ['l4-inbox-http', 'l4-inbox-dns', 'l4-inbox-ftp', 'l4-inbox-smtp'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.setAttribute('visible', true);
      });
      PACKETS.forEach(p => {
        const el = document.getElementById(p.id);
        if (el) el.setAttribute('visible', true);
      });
      const term = document.getElementById('l4-quiz-terminal');
      if (term) term.setAttribute('visible', false);

      const taskText = document.getElementById('task-text');
      if (taskText) taskText.textContent = 'Anwendungs-Flügel: Sortiere Pakete in den richtigen Protokoll-Briefkasten';

      const scorePill = document.getElementById('score-pill');
      if (scorePill) scorePill.textContent = '0 P';
    },

    teardown() {
      ['l4-inbox-http', 'l4-inbox-dns', 'l4-inbox-ftp', 'l4-inbox-smtp'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.setAttribute('visible', false);
      });
      PACKETS.forEach(p => {
        const el = document.getElementById(p.id);
        if (el) el.setAttribute('visible', false);
      });
      const term = document.getElementById('l4-quiz-terminal');
      if (term) term.setAttribute('visible', false);
      _selectedPaket = null;
      _onComplete = null;
    },

    getScore() { return _score; },

    handlePickup(target) {
      if (_quizAnswered) return false;
      if (target.classList.contains('paket-l4') && !_selectedPaket) {
        _selectedPaket = target;
        const badge = document.getElementById('selected-badge');
        if (badge) {
          badge.classList.add('visible');
          badge.textContent = '📦 ' + (target.getAttribute('data-protocol') || '').toUpperCase();
        }
        target.setAttribute('material', 'color:#ffffff');
        return true;
      }
      if (target.classList.contains('inbox-zone') && _selectedPaket) {
        const inboxProto = target.getAttribute('data-protocol');
        const paketId = _selectedPaket.id;
        _selectedPaket.setAttribute('material', 'color:#c8a060;roughness:0.9');
        _selectedPaket = null;
        const badge = document.getElementById('selected-badge');
        if (badge) badge.classList.remove('visible');
        _onDrop(paketId, inboxProto);
        return true;
      }
      if (target.classList.contains('quiz-option-l4') && _assigned >= PACKETS.length) {
        _onQuizAnswer(target);
        return true;
      }
      return false;
    },

    _dropForTest(paketId, inboxProtocol) { _onDrop(paketId, inboxProtocol); },
    _answerQuizForTest(correct) {
      const ids = ['a', 'b', 'c', 'd'];
      for (const id of ids) {
        const b = document.getElementById('l4-quiz-' + id);
        if (b && b.getAttribute('data-correct') === (correct ? 'true' : 'false')) {
          _onQuizAnswer(b);
          return;
        }
      }
    },
  };
})();
