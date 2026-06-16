const P2 = (() => {
  let _score = 0;
  let _quizAnswered = false;
  let _onComplete = null;

  const QUIZ = {
    question: 'Welche zwei Protokolle arbeiten auf der Transportschicht?',
    options: [
      { text: 'HTTP und DNS',  correct: false },
      { text: 'TCP und UDP',   correct: true  },
      { text: 'IP und ICMP',   correct: false },
      { text: 'FTP und SMTP',  correct: false },
    ],
  };

  function _setupQuiz() {
    const q = document.getElementById('s2-quiz-question');
    if (q) q.setAttribute('value', QUIZ.question);
    const ids = ['a', 'b', 'c', 'd'];
    QUIZ.options.forEach((opt, i) => {
      const box = document.getElementById('s2-quiz-' + ids[i]);
      if (box) { box.setAttribute('data-correct', opt.correct ? 'true' : 'false'); box._opt = opt; }
      const txt = document.getElementById('s2-quiz-' + ids[i] + '-text');
      if (txt) txt.setAttribute('value', ['A','B','C','D'][i] + ': ' + opt.text);
    });
  }

  function _onQuizAnswer(boxEl) {
    if (_quizAnswered) return;
    _quizAnswered = true;
    const correct = boxEl.getAttribute('data-correct') === 'true';
    const ids = ['a', 'b', 'c', 'd'];
    ids.forEach(id => {
      const b = document.getElementById('s2-quiz-' + id);
      if (!b) return;
      if (b._opt && b._opt.correct) b.setAttribute('material', 'color:#1a4020;roughness:0.5');
      else if (b === boxEl && !correct) b.setAttribute('material', 'color:#401010;roughness:0.5');
    });
    if (correct) _score += 200;
    const t = document.getElementById('task-text');
    if (t) t.textContent = correct
      ? '✓ Richtig! Nordflügel freigeschaltet — geh durch die Tür!'
      : '✗ Fast! TCP und UDP sind auf der Transportschicht. Nordflügel freigeschaltet!';
    setTimeout(() => { if (_onComplete) _onComplete(_score); }, 1500);
  }

  return {
    init(onComplete) {
      _score = 0;
      _quizAnswered = false;
      _onComplete = onComplete;
      _setupQuiz();
      const t = document.getElementById('task-text');
      if (t) t.textContent = 'S2 — Beantworte die Frage an der Tafel rechts vom Eingang [E]';
      const scorePill = document.getElementById('score-pill');
      if (scorePill) scorePill.textContent = _score + ' P';
    },

    teardown() { _onComplete = null; },

    getScore() { return _score; },

    handlePickup(target) {
      if (target.classList.contains('quiz-option-s2')) {
        _onQuizAnswer(target);
        return true;
      }
      return false;
    },

    _answerQuizForTest(correct) {
      const ids = ['a', 'b', 'c', 'd'];
      for (const id of ids) {
        const b = document.getElementById('s2-quiz-' + id);
        if (b && b.getAttribute('data-correct') === (correct ? 'true' : 'false')) { _onQuizAnswer(b); return; }
      }
    },
  };
})();
