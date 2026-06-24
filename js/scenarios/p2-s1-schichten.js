const P1 = (() => {
  let _score = 0;
  let _quizAnswered = false;
  let _onComplete = null;
  let _assessMode = false;
  let _quizRound = 0;

  const QUIZ = {
    question: 'Welche Schicht liegt unmittelbar UNTER der Transportschicht?',
    options: [
      { text: 'Anwendungsschicht', correct: false },
      { text: 'Internet-Schicht',  correct: true  },
      { text: 'Netzzugang',        correct: false },
      { text: 'Sicherungsschicht', correct: false },
    ],
  };

  const QUIZ_POOL = [
    {
      question: 'Welche Schicht liegt unmittelbar UNTER der Transportschicht?',
      options: [
        { text: 'Anwendungsschicht', correct: false },
        { text: 'Internet-Schicht',  correct: true  },
        { text: 'Netzzugang',        correct: false },
        { text: 'Sicherungsschicht', correct: false },
      ],
    },
    {
      question: 'Welches Protokoll gehört zur Anwendungsschicht?',
      options: [
        { text: 'IP',   correct: false },
        { text: 'TCP',  correct: false },
        { text: 'HTTP', correct: true  },
        { text: 'ARP',  correct: false },
      ],
    },
    {
      question: 'Was ist die Hauptaufgabe der Internet-Schicht?',
      options: [
        { text: 'Datei-Transfer',          correct: false },
        { text: 'Adressierung & Routing',  correct: true  },
        { text: 'Bit-Übertragung',         correct: false },
        { text: 'Verbindungsaufbau',       correct: false },
      ],
    },
  ];

  function _setupQuiz(q) {
    const quiz = q || QUIZ;
    const el = document.getElementById('s1-quiz-question');
    if (el) el.setAttribute('value', quiz.question);
    const ids = ['a', 'b', 'c', 'd'];
    quiz.options.forEach((opt, i) => {
      const box = document.getElementById('s1-quiz-' + ids[i]);
      if (box) {
        box.setAttribute('data-correct', opt.correct ? 'true' : 'false');
        box._opt = opt;
        box.setAttribute('material', 'color:#1a2a3a;roughness:0.5');
      }
      const txt = document.getElementById('s1-quiz-' + ids[i] + '-text');
      if (txt) txt.setAttribute('value', ['A','B','C','D'][i] + ': ' + opt.text);
    });
  }

  function _resetQuizColors() {
    ['a','b','c','d'].forEach(id => {
      const b = document.getElementById('s1-quiz-' + id);
      if (b) b.setAttribute('material', 'color:#1a2a3a;roughness:0.5');
    });
  }

  function _onQuizAnswer(boxEl) {
    if (_quizAnswered) return;
    _quizAnswered = true;
    const correct = boxEl.getAttribute('data-correct') === 'true';
    const ids = ['a', 'b', 'c', 'd'];
    ids.forEach(id => {
      const b = document.getElementById('s1-quiz-' + id);
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
          ? '✓ Richtig! Assessment S1 abgeschlossen!'
          : '✗ Fast! Assessment S1 abgeschlossen.';
        setTimeout(() => { if (_onComplete) _onComplete(_score); }, 1500);
      }
    } else {
      const t = document.getElementById('task-text');
      if (t) t.textContent = correct
        ? '✓ Richtig! Geh zur Protokoll-Tafel (rechts vom Eingang) für S2.'
        : '✗ Fast! Die Internet-Schicht liegt unter der Transportschicht. Weiter zu S2!';
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
      if (t) t.textContent = 'S1 — Beantworte die Frage an der Tafel links vom Eingang [E]';
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
      if (t) t.textContent = 'Assessment S1 — 3 Fragen. Beantworte die Tafel (E). Frage 1 / 3';
    },

    teardown() { _onComplete = null; },

    // Setzt die Tafel auf den neutralen Ausgangszustand zurück (kein hinterlegtes
    // Quiz, keine markierte Antwort). Vor dem Assessment aufgerufen, damit nicht
    // die alte Lern-Frage inkl. grün markierter Lösung sichtbar bleibt.
    reset() {
      _quizAnswered = false;
      _assessMode = false;
      _quizRound = 0;
      const q = document.getElementById('s1-quiz-question');
      if (q) q.setAttribute('value', 'Lies zuerst die Info-Tafel [ E ]');
      ['a', 'b', 'c', 'd'].forEach((id, i) => {
        const box = document.getElementById('s1-quiz-' + id);
        if (box) {
          box.setAttribute('data-correct', 'false');
          box._opt = null;
          box.setAttribute('material', 'color:#1a2040;roughness:0.5');
        }
        const txt = document.getElementById('s1-quiz-' + id + '-text');
        if (txt) txt.setAttribute('value', ['A', 'B', 'C', 'D'][i] + ': ...');
      });
    },

    getScore() { return _score; },

    handlePickup(target) {
      if (target.classList.contains('quiz-option-s1')) {
        _onQuizAnswer(target);
        return true;
      }
      return false;
    },

    _answerQuizForTest(correct) {
      const ids = ['a', 'b', 'c', 'd'];
      for (const id of ids) {
        const b = document.getElementById('s1-quiz-' + id);
        if (b && b.getAttribute('data-correct') === (correct ? 'true' : 'false')) { _onQuizAnswer(b); return; }
      }
    },
  };
})();

// Alias für game.js / Tests (L1 → P1)
const L1 = P1;
