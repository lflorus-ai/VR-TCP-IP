const P5 = (() => {
  let _score = 0;
  let _routed = 0;
  let _quizAnswered = false;
  let _onComplete = null;
  let _selectedPaket = null;

  const PACKETS = [
    { id: 'r5-paket-1', dest: '10.0.0.5',    exit: 'r5-exit-a', label: '10.0.0.5'    },
    { id: 'r5-paket-2', dest: '192.168.1.10', exit: 'r5-exit-b', label: '192.168.1.10' },
    { id: 'r5-paket-3', dest: '172.16.5.3',   exit: 'r5-exit-c', label: '172.16.5.3'  },
  ];

  const QUIZ = {
    question: 'Welche Information nutzt ein Router, um ein Paket weiterzuleiten?',
    options: [
      { text: 'MAC-Adresse des Absenders',     correct: false },
      { text: 'Ziel-IP + Routing-Tabelle',     correct: true  },
      { text: 'Portnummer der Anwendung',      correct: false },
      { text: 'Dateigröße des Pakets', correct: false },
    ],
  };

  function _showQuiz() {
    const term = document.getElementById('r5-quiz-terminal');
    if (!term) return;
    term.setAttribute('visible', true);
    document.getElementById('r5-quiz-question').setAttribute('value', QUIZ.question);
    const ids = ['a', 'b', 'c', 'd'];
    QUIZ.options.forEach((opt, i) => {
      const box = document.getElementById('r5-quiz-' + ids[i]);
      if (box) { box.setAttribute('data-correct', opt.correct ? 'true' : 'false'); box._opt = opt; }
      const txt = document.getElementById('r5-quiz-' + ids[i] + '-text');
      if (txt) txt.setAttribute('value', ['A','B','C','D'][i] + ': ' + opt.text);
    });
  }

  function _onDrop(paketId, exitId) {
    if (_quizAnswered) return;
    const packet = PACKETS.find(p => p.id === paketId);
    if (!packet) return;
    const el = document.getElementById(paketId);
    if (el) el.setAttribute('visible', false);

    const correct = packet.exit === exitId;
    if (correct) {
      _score += 100;
      _routed++;
      if (window.playSoundCorrect) playSoundCorrect();
    } else {
      _score = Math.max(0, _score - 20);
      if (window.playSoundWrong) playSoundWrong();
    }

    const scorePill = document.getElementById('score-pill');
    if (scorePill) scorePill.textContent = _score + ' P';
    const taskText = document.getElementById('task-text');
    if (taskText) taskText.textContent = correct
      ? '✓ Richtig! ' + packet.label + ' korrekt geroutet'
      : '✗ Falsch! Prüfe die Routing-Tabelle.';

    if (_routed >= PACKETS.length) setTimeout(_showQuiz, 800);
  }

  function _onQuizAnswer(boxEl) {
    if (_quizAnswered) return;
    _quizAnswered = true;
    const correct = boxEl.getAttribute('data-correct') === 'true';
    const ids = ['a', 'b', 'c', 'd'];
    ids.forEach(id => {
      const b = document.getElementById('r5-quiz-' + id);
      if (!b) return;
      if (b._opt && b._opt.correct) b.setAttribute('material', 'color:#1a4020;roughness:0.5');
      else if (b === boxEl && !correct) b.setAttribute('material', 'color:#401010;roughness:0.5');
    });
    if (correct) _score += 200;
    setTimeout(() => { if (_onComplete) _onComplete(_score); }, 1500);
  }

  return {
    init(onComplete) {
      _score = 0; _routed = 0; _quizAnswered = false; _selectedPaket = null; _onComplete = onComplete;
      PACKETS.forEach(p => {
        const el = document.getElementById(p.id);
        if (el) el.setAttribute('visible', true);
      });
      const term = document.getElementById('r5-quiz-terminal');
      if (term) term.setAttribute('visible', false);
      const ids = ['a', 'b', 'c', 'd'];
      ids.forEach(id => {
        const b = document.getElementById('r5-quiz-' + id);
        if (b) b.setAttribute('material', 'color:#1a2040;roughness:0.5');
      });
      const taskText = document.getElementById('task-text');
      if (taskText) taskText.textContent = 'Büro-Flügel: Leite Pakete zum richtigen Router-Ausgang (Routing-Tabelle beachten)';
      const scorePill = document.getElementById('score-pill');
      if (scorePill) scorePill.textContent = '0 P';
    },

    teardown() {
      PACKETS.forEach(p => {
        const el = document.getElementById(p.id);
        if (el) el.setAttribute('visible', false);
      });
      const term = document.getElementById('r5-quiz-terminal');
      if (term) term.setAttribute('visible', false);
      _selectedPaket = null;
      _onComplete = null;
      const badge = document.getElementById('selected-badge');
      if (badge) badge.classList.remove('visible');
    },

    getScore() { return _score; },

    handlePickup(target) {
      if (_quizAnswered) return false;
      if (target.classList.contains('paket-r5') && !_selectedPaket) {
        _selectedPaket = target;
        const badge = document.getElementById('selected-badge');
        if (badge) {
          badge.classList.add('visible');
          badge.textContent = '📦 ' + (target.getAttribute('data-dest') || '');
        }
        target.setAttribute('material', 'color:#ffffff');
        return true;
      }
      if (target.classList.contains('router-exit') && _selectedPaket) {
        const exitId = target.id;
        const paketId = _selectedPaket.id;
        _selectedPaket.setAttribute('material', 'color:#c8a060;roughness:0.9');
        _selectedPaket = null;
        const badge = document.getElementById('selected-badge');
        if (badge) badge.classList.remove('visible');
        _onDrop(paketId, exitId);
        return true;
      }
      if (target.classList.contains('quiz-option-r5') && _routed >= PACKETS.length) {
        _onQuizAnswer(target);
        return true;
      }
      return false;
    },

    _routeForTest(paketId, exitId) { _onDrop(paketId, exitId); },
    _answerQuizForTest(correct) {
      const ids = ['a', 'b', 'c', 'd'];
      for (const id of ids) {
        const b = document.getElementById('r5-quiz-' + id);
        if (b && b.getAttribute('data-correct') === (correct ? 'true' : 'false')) { _onQuizAnswer(b); return; }
      }
    },
  };
})();
