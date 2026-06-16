const P2S3 = (() => {
  let _score = 0;
  let _assigned = new Set();
  let _quizAnswered = false;
  let _onComplete = null;
  let _selected = null;

  const SCENARIOS = [
    { id: 'file-dl',    icon: '📥', label: 'Datei-Download',     sub: 'FTP-Übertragung',           protocol: 'tcp' },
    { id: 'email',      icon: '✉️',  label: 'E-Mail senden',      sub: 'SMTP-Übertragung',           protocol: 'tcp' },
    { id: 'livestream', icon: '📹', label: 'Live-Streaming',      sub: 'Latenz wichtiger als Vollständigkeit', protocol: 'udp' },
    { id: 'gaming',     icon: '🎮', label: 'Online-Multiplayer',  sub: 'Echtzeit-Positionsdaten',   protocol: 'udp' },
    { id: 'web',        icon: '🌐', label: 'Webseite laden',      sub: 'HTTP-Request',              protocol: 'tcp' },
  ];

  const QUIZ = {
    question: 'Ein Videoanruf sendet kontinuierlich Audio-Daten. Ein verlorenes Paket erzeugt nur ein kurzes Knacken — Neuübertragung würde nur verzögern. Welches Protokoll passt besser?',
    options: [
      { text: 'TCP — stellt Pakete zuverlässig und in Reihenfolge zu', correct: false },
      { text: 'UDP — schnell, ohne Neuübertragung veralteter Daten', correct: true },
      { text: 'IP — zuständig für Adressierung und Routing', correct: false },
      { text: 'Ethernet — überträgt auf der Netzzugangsschicht', correct: false },
    ],
    feedbackCorrect: '✓ Richtig! UDP ist ideal für Echtzeit-Audio: Verlorene Pakete werden übersprungen — eine Verzögerung durch Neuübertragung wäre schlimmer als ein kurzes Knacken.',
    feedbackWrong: '✗ Nicht ganz. UDP passt hier besser: Bei Echtzeit-Audio ist Geschwindigkeit wichtiger als Vollständigkeit. TCP-Neuübertragungen erzeugen hörbare Verzögerungen.',
  };

  function init(onComplete) {
    _score = 0;
    _assigned = new Set();
    _quizAnswered = false;
    _onComplete = onComplete;
    _selected = null;

    _renderCards();
    _clearChips();
    _bindButtons();

    document.getElementById('p2-s3-overlay').classList.remove('hidden');
    document.getElementById('p2s3-main').classList.remove('hidden');
    document.getElementById('p2s3-intro-text').classList.remove('hidden');
    document.getElementById('p2s3-quiz-btn').classList.add('hidden');
    document.getElementById('p2s3-quiz').classList.add('hidden');
    document.getElementById('p2s3-feedback').classList.add('hidden');
    document.getElementById('p2s3-next-btn').classList.add('hidden');
    document.exitPointerLock();
  }

  function teardown() {
    document.getElementById('p2-s3-overlay').classList.add('hidden');
  }

  function getScore() { return _score; }

  function _renderCards() {
    const bank = document.getElementById('p2s3-card-bank');
    bank.innerHTML = '';
    SCENARIOS.forEach(s => {
      const card = document.createElement('div');
      card.className = 'p2s3-scenario-card';
      card.dataset.id = s.id;
      card.innerHTML = `<div class="p2s3-card-icon">${s.icon}</div><div class="p2s3-card-label">${s.label}</div><div class="p2s3-card-sub">${s.sub}</div>`;
      card.addEventListener('click', () => _onCardClick(s.id));
      bank.appendChild(card);
    });
  }

  function _clearChips() {
    document.getElementById('p2s3-chips-tcp').innerHTML = '';
    document.getElementById('p2s3-chips-udp').innerHTML = '';
  }

  function _onCardClick(id) {
    if (_assigned.has(id)) return;
    _selected = id;
    document.querySelectorAll('#p2s3-card-bank .p2s3-scenario-card').forEach(c => {
      c.classList.toggle('selected', c.dataset.id === id);
    });
  }

  function _onBeltClick(protocol) {
    if (!_selected) return;
    const scenario = SCENARIOS.find(s => s.id === _selected);
    if (!scenario || _assigned.has(_selected)) return;

    if (scenario.protocol === protocol) {
      _assigned.add(_selected);
      _score += 20;
      const card = document.querySelector(`#p2s3-card-bank [data-id="${_selected}"]`);
      if (card) card.classList.add('placed');
      const chip = document.createElement('span');
      chip.className = `p2s3-belt-chip ${protocol}`;
      chip.textContent = scenario.label;
      document.getElementById(`p2s3-chips-${protocol}`).appendChild(chip);
      _selected = null;
      document.querySelectorAll('#p2s3-card-bank .p2s3-scenario-card').forEach(c => c.classList.remove('selected'));
      if (_assigned.size === SCENARIOS.length) {
        document.getElementById('p2s3-quiz-btn').classList.remove('hidden');
      }
    } else {
      const belt = document.getElementById(`p2s3-belt-${protocol}`);
      belt.classList.add('shake');
      belt.addEventListener('animationend', () => belt.classList.remove('shake'), { once: true });
    }
  }

  function _bindButtons() {
    ['tcp', 'udp'].forEach(protocol => {
      const belt = document.getElementById(`p2s3-belt-${protocol}`);
      if (belt._p2s3Handler) belt.removeEventListener('click', belt._p2s3Handler);
      belt._p2s3Handler = () => _onBeltClick(protocol);
      belt.addEventListener('click', belt._p2s3Handler);
    });

    const quizBtn = document.getElementById('p2s3-quiz-btn');
    const freshQuiz = quizBtn.cloneNode(true);
    quizBtn.replaceWith(freshQuiz);
    freshQuiz.addEventListener('click', _showQuiz, { once: true });

    const nextBtn = document.getElementById('p2s3-next-btn');
    const freshNext = nextBtn.cloneNode(true);
    nextBtn.replaceWith(freshNext);
    freshNext.addEventListener('click', () => {
      teardown();
      if (_onComplete) _onComplete(_score);
    }, { once: true });
  }

  function _showQuiz() {
    document.getElementById('p2s3-main').classList.add('hidden');
    document.getElementById('p2s3-intro-text').classList.add('hidden');

    const quiz = document.getElementById('p2s3-quiz');
    quiz.classList.remove('hidden');
    document.getElementById('p2s3-question').textContent = QUIZ.question;

    const opts = document.getElementById('p2s3-options');
    opts.innerHTML = '';
    const shuffled = [...QUIZ.options].sort(() => Math.random() - 0.5);
    shuffled.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'p2s3-option';
      btn.textContent = opt.text;
      btn._opt = opt;
      btn.addEventListener('click', () => _onOptionClick(btn, opt), { once: true });
      opts.appendChild(btn);
    });
  }

  function _onOptionClick(btn, opt) {
    if (_quizAnswered) return;
    _quizAnswered = true;
    document.querySelectorAll('#p2s3-options .p2s3-option').forEach(b => b.classList.add('disabled'));

    const feedback = document.getElementById('p2s3-feedback');
    if (opt.correct) {
      _score += 30;
      btn.classList.add('correct');
      feedback.className = 'p2s3-feedback correct';
      feedback.textContent = QUIZ.feedbackCorrect;
    } else {
      btn.classList.add('wrong');
      document.querySelectorAll('#p2s3-options .p2s3-option').forEach(b => {
        if (b._opt && b._opt.correct) b.classList.add('correct');
      });
      feedback.className = 'p2s3-feedback wrong';
      feedback.textContent = QUIZ.feedbackWrong;
    }
    feedback.classList.remove('hidden');
    document.getElementById('p2s3-next-btn').classList.remove('hidden');
  }

  function _assignForTest(scenarioId, protocol) {
    _selected = scenarioId;
    _onBeltClick(protocol);
  }

  return { init, teardown, getScore, _assignForTest };
})();
