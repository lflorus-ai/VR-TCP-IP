const P2 = (() => {
  let _score = 0;
  let _quizAnswered = false;
  let _onComplete = null;
  let _assessMode = false;
  let _quizRound = 0;

  const QUIZ = {
    question: 'Welche zwei Protokolle arbeiten auf der Transportschicht?',
    options: [
      { text: 'HTTP und DNS',  correct: false },
      { text: 'TCP und UDP',   correct: true  },
      { text: 'IP und ICMP',   correct: false },
      { text: 'FTP und SMTP',  correct: false },
    ],
  };

  const QUIZ_POOL = [
    {
      question: 'Welche zwei Protokolle arbeiten auf der Transportschicht?',
      options: [
        { text: 'HTTP und DNS',  correct: false },
        { text: 'TCP und UDP',   correct: true  },
        { text: 'IP und ICMP',   correct: false },
        { text: 'FTP und SMTP',  correct: false },
      ],
    },
    {
      question: 'Was ist ein Merkmal von TCP?',
      options: [
        { text: 'verbindungslos',         correct: false },
        { text: 'verbindungsorientiert',  correct: true  },
        { text: 'keine Fehlerkorrektur',  correct: false },
        { text: 'maximale Geschwindigkeit', correct: false },
      ],
    },
    {
      question: 'Welches Protokoll überträgt Daten schnell, ohne Zustellgarantie?',
      options: [
        { text: 'TCP',  correct: false },
        { text: 'HTTP', correct: false },
        { text: 'UDP',  correct: true  },
        { text: 'FTP',  correct: false },
      ],
    },
  ];

  function _setupQuiz(q) {
    const quiz = q || QUIZ;
    const el = document.getElementById('s2-quiz-question');
    if (el) el.setAttribute('value', quiz.question);
    const ids = ['a', 'b', 'c', 'd'];
    quiz.options.forEach((opt, i) => {
      const box = document.getElementById('s2-quiz-' + ids[i]);
      if (box) {
        box.setAttribute('data-correct', opt.correct ? 'true' : 'false');
        box._opt = opt;
        box.setAttribute('material', 'color:#1a2a3a;roughness:0.5');
      }
      const txt = document.getElementById('s2-quiz-' + ids[i] + '-text');
      if (txt) txt.setAttribute('value', ['A','B','C','D'][i] + ': ' + opt.text);
    });
  }

  function _resetQuizColors() {
    ['a','b','c','d'].forEach(id => {
      const b = document.getElementById('s2-quiz-' + id);
      if (b) b.setAttribute('material', 'color:#1a2a3a;roughness:0.5');
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

    if (_assessMode) {
      _quizRound++;
      const t = document.getElementById('task-text');
      if (_quizRound < QUIZ_POOL.length) {
        if (t) t.textContent = (correct ? '✓ Richtig! ' : '✗ Fast! ') + 'Frage ' + (_quizRound + 1) + ' / ' + QUIZ_POOL.length;
        setTimeout(() => {
          _resetQuizColors();
          _quizAnswered = false;
          _setupQuiz(QUIZ_POOL[_quizRound]);
        }, 1500);
      } else {
        if (t) t.textContent = correct
          ? '✓ Richtig! Assessment S2 abgeschlossen!'
          : '✗ Fast! Assessment S2 abgeschlossen.';
        setTimeout(() => { if (_onComplete) _onComplete(_score); }, 1500);
      }
    } else {
      const t = document.getElementById('task-text');
      if (t) t.textContent = correct
        ? '✓ Richtig! Nordflügel freigeschaltet — geh durch die Tür!'
        : '✗ Fast! TCP und UDP sind auf der Transportschicht. Nordflügel freigeschaltet!';
      setTimeout(() => { if (_onComplete) _onComplete(_score); }, 1500);
    }
  }

  return {
    init(onComplete) {
      _score = 0;
      _quizAnswered = false;
      _assessMode = false;
      _quizRound = 0;
      _onComplete = onComplete;
      _setupQuiz(QUIZ);
      const t = document.getElementById('task-text');
      if (t) t.textContent = 'S2 — Beantworte die Frage an der Tafel rechts vom Eingang [E]';
      const scorePill = document.getElementById('score-pill');
      if (scorePill) scorePill.textContent = _score + ' P';
    },

    initAssessment(onComplete) {
      _score = 0;
      _quizAnswered = false;
      _assessMode = true;
      _quizRound = 0;
      _onComplete = onComplete;
      _setupQuiz(QUIZ_POOL[0]);
      const t = document.getElementById('task-text');
      if (t) t.textContent = 'Assessment S2 — 3 Fragen. Beantworte die Tafel (E). Frage 1 / 3';
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

// Alias für game.js / Tests (L2 → P2)
const L2 = P2;
