const P6 = (() => {
  let _score = 0;
  let _currentQ = 0;
  let _answeredCount = 0;
  let _onComplete = null;
  const TOTAL = 5;

  const QUESTIONS = [
    {
      q: 'Aus wie vielen Schichten besteht das TCP/IP-Modell?',
      opts: ['2', '4', '7', '12'],
      correct: 1,
    },
    {
      q: 'Auf welcher TCP/IP-Schicht arbeitet ein Router?',
      opts: ['Anwendungsschicht', 'Transportschicht', 'Internet-Schicht', 'Netzzugang'],
      correct: 2,
    },
    {
      q: 'Welches Protokoll garantiert die vollständige Zustellung von Datenpaketen?',
      opts: ['UDP', 'IP', 'TCP', 'DNS'],
      correct: 2,
    },
    {
      q: 'Die Internet-Schicht (TCP/IP) entspricht welcher OSI-Schicht?',
      opts: ['OSI Layer 2', 'OSI Layer 3', 'OSI Layer 4', 'OSI Layer 7'],
      correct: 1,
    },
    {
      q: 'Welches Protokoll löst Domainnamen in IP-Adressen auf?',
      opts: ['HTTP', 'SMTP', 'FTP', 'DNS'],
      correct: 3,
    },
  ];

  function _showQuestion(qIndex) {
    const q = QUESTIONS[qIndex];
    if (!q) return;
    const term = document.getElementById('p6-quiz-terminal');
    if (term) term.setAttribute('visible', true);
    const qEl = document.getElementById('p6-quiz-question');
    if (qEl) qEl.setAttribute('value', 'Frage ' + (qIndex + 1) + '/' + TOTAL + ':\n' + q.q);
    const ids = ['a', 'b', 'c', 'd'];
    ids.forEach((id, i) => {
      const box = document.getElementById('p6-quiz-' + id);
      if (box) {
        box.setAttribute('data-correct', i === q.correct ? 'true' : 'false');
        box.setAttribute('material', 'color:#1a2040;roughness:0.5');
        box._p6opt = { text: q.opts[i], correct: i === q.correct };
      }
      const txt = document.getElementById('p6-quiz-' + id + '-text');
      if (txt) txt.setAttribute('value', ['A','B','C','D'][i] + ': ' + q.opts[i]);
    });
  }

  function _onQuizAnswer(boxEl) {
    if (_answeredCount > _currentQ) return;
    _answeredCount++;
    const correct = boxEl.getAttribute('data-correct') === 'true';
    if (correct) _score += 100;

    const ids = ['a', 'b', 'c', 'd'];
    ids.forEach(id => {
      const b = document.getElementById('p6-quiz-' + id);
      if (!b) return;
      if (b.getAttribute('data-correct') === 'true') b.setAttribute('material', 'color:#1a4020;roughness:0.5');
      else if (b === boxEl && !correct) b.setAttribute('material', 'color:#401010;roughness:0.5');
    });

    const scorePill = document.getElementById('score-pill');
    if (scorePill) scorePill.textContent = _score + ' P';
    const taskText = document.getElementById('task-text');

    if (_currentQ + 1 < TOTAL) {
      if (taskText) taskText.textContent = (correct ? '✓ Richtig!' : '✗ Falsch!') + ' Nächste Frage…';
      setTimeout(() => {
        _currentQ++;
        _showQuestion(_currentQ);
      }, 2000);
    } else {
      if (taskText) taskText.textContent = 'Bewertung abgeschlossen! ' + _score + ' P';
      setTimeout(() => { if (_onComplete) _onComplete(_score); }, 2000);
    }
  }

  return {
    init(onComplete) {
      _score = 0; _currentQ = 0; _answeredCount = 0; _onComplete = onComplete;
      _showQuestion(0);
      const taskText = document.getElementById('task-text');
      if (taskText) taskText.textContent = 'Abschlussbewertung: 5 Fragen — beantworte alle ohne Hinweise';
      const scorePill = document.getElementById('score-pill');
      if (scorePill) scorePill.textContent = '0 P';
    },

    teardown() {
      const term = document.getElementById('p6-quiz-terminal');
      if (term) term.setAttribute('visible', false);
      _onComplete = null;
    },

    getScore() { return _score; },

    handlePickup(target) {
      if (target.classList.contains('quiz-option-p6')) {
        _onQuizAnswer(target);
        return true;
      }
      return false;
    },

    _answerForTest(qIndex, isCorrect) {
      _currentQ = qIndex;
      _answeredCount = qIndex;
      const q = QUESTIONS[qIndex];
      if (!q) return;
      _showQuestion(qIndex);
      const ids = ['a', 'b', 'c', 'd'];
      const targetIdx = isCorrect ? q.correct : (q.correct + 1) % 4;
      const b = document.getElementById('p6-quiz-' + ids[targetIdx]);
      if (b) _onQuizAnswer(b);
    },
  };
})();
