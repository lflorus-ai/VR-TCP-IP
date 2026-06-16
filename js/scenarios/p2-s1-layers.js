const P2S1 = (() => {
  let _score = 0;
  let _cardsViewed = new Set();
  let _quizAnswered = false;
  let _onComplete = null;

  const LAYERS = [
    {
      id: 'anwendung', name: 'Anwendung', num: 4, icon: '📱',
      color: '#50e0a0', stroke: 'rgba(80,224,160,0.5)',
      protocols: 'HTTP · HTTPS · DNS · FTP · SMTP',
      desc: 'Schnittstelle zwischen Anwendungen und Netzwerk. Hier kommunizieren Programme direkt miteinander — z.B. dein Browser mit einem Webserver.',
    },
    {
      id: 'transport', name: 'Transport', num: 3, icon: '🔗',
      color: '#64a0ff', stroke: 'rgba(100,160,255,0.5)',
      protocols: 'TCP · UDP',
      desc: 'Steuert den zuverlässigen Datentransport zwischen zwei Endgeräten. TCP garantiert die Zustellung, UDP ist schneller aber ohne Garantie.',
    },
    {
      id: 'internet', name: 'Internet', num: 2, icon: '🌐',
      color: '#f5c518', stroke: 'rgba(245,197,24,0.5)',
      protocols: 'IP · ICMP · ARP',
      desc: 'Logische Adressierung mit IP-Adressen. Bestimmt den Weg der Datenpakete durch das Netzwerk — das nennt sich Routing.',
    },
    {
      id: 'netzzugang', name: 'Netzzugang', num: 1, icon: '📡',
      color: '#ff7850', stroke: 'rgba(255,120,80,0.5)',
      protocols: 'Ethernet · WLAN · MAC',
      desc: 'Physische Übertragung der Datenbits über das Kabel oder die Luft. Regelt den direkten Zugang zum Übertragungsmedium.',
    },
  ];

  const QUIZ_OPTIONS = [
    { text: 'Anwendungsschicht — Schicht 4', correct: false },
    { text: 'Transportschicht — Schicht 3', correct: false },
    { text: 'Internetschicht — Schicht 2', correct: true },
    { text: 'Netzzugangsschicht — Schicht 1', correct: false },
  ];

  function init(onComplete) {
    _score = 0;
    _cardsViewed = new Set();
    _quizAnswered = false;
    _onComplete = onComplete;

    _renderCards();
    _bindButtons();
    document.getElementById('p2-s1-overlay').classList.remove('hidden');
    document.exitPointerLock();
  }

  function teardown() {
    document.getElementById('p2-s1-overlay').classList.add('hidden');
  }

  function getScore() { return _score; }

  function _renderCards() {
    const grid = document.getElementById('p2s1-cards');
    grid.innerHTML = '';
    grid.classList.remove('hidden');

    LAYERS.forEach(layer => {
      const card = document.createElement('div');
      card.className = 'p2s1-card';
      card.dataset.id = layer.id;
      card.style.cssText = `--card-color:${layer.color};--card-stroke:${layer.stroke}`;
      card.innerHTML = `
        <div class="p2s1-card-badge">Schicht ${layer.num}</div>
        <div class="p2s1-card-icon">${layer.icon}</div>
        <div class="p2s1-card-name" style="color:${layer.color}">${layer.name}</div>
        <div class="p2s1-card-detail">
          <div class="p2s1-card-desc">${layer.desc}</div>
          <div class="p2s1-card-protocols">${layer.protocols}</div>
        </div>`;
      card.addEventListener('click', () => _onCardClick(card, layer));
      grid.appendChild(card);
    });
  }

  function _onCardClick(card, layer) {
    const wasOpen = card.classList.contains('open');
    document.querySelectorAll('#p2s1-cards .p2s1-card').forEach(c => c.classList.remove('open'));
    if (!wasOpen) {
      card.classList.add('open', 'viewed');
      _cardsViewed.add(layer.id);
    }
    _checkAllViewed();
  }

  function _checkAllViewed() {
    if (_cardsViewed.size === LAYERS.length) {
      document.getElementById('p2s1-quiz-btn').classList.remove('hidden');
    }
  }

  function _showQuiz() {
    document.getElementById('p2s1-cards').classList.add('hidden');
    document.getElementById('p2s1-quiz-btn').classList.add('hidden');
    document.getElementById('p2s1-intro-text').classList.add('hidden');

    const quiz = document.getElementById('p2s1-quiz');
    quiz.classList.remove('hidden');

    const opts = document.getElementById('p2s1-options');
    opts.innerHTML = '';
    const shuffled = [...QUIZ_OPTIONS].sort(() => Math.random() - 0.5);
    shuffled.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'p2s1-option';
      btn.textContent = opt.text;
      btn.addEventListener('click', () => _onOptionClick(btn, opt));
      opts.appendChild(btn);
    });
  }

  function _onOptionClick(btn, opt) {
    if (_quizAnswered) return;
    _quizAnswered = true;

    document.querySelectorAll('.p2s1-option').forEach(b => b.classList.add('disabled'));

    const feedback = document.getElementById('p2s1-feedback');

    if (opt.correct) {
      _score = 50;
      btn.classList.add('correct');
      feedback.className = 'p2s1-feedback correct';
      feedback.innerHTML = '✓ Richtig! Die <strong>Internetschicht (Schicht 2)</strong> ist für IP-Adressen und Routing zuständig — sie entspricht OSI-Layer 3.';
    } else {
      _score = 0;
      btn.classList.add('wrong');
      document.querySelectorAll('.p2s1-option').forEach(b => {
        if (QUIZ_OPTIONS.find(o => o.correct && o.text === b.textContent)) b.classList.add('correct');
      });
      feedback.className = 'p2s1-feedback wrong';
      feedback.innerHTML = '✗ Nicht ganz. Richtig wäre <strong>Internetschicht (Schicht 2)</strong> — zuständig für IP-Adressen und das Routing der Pakete.';
    }

    feedback.classList.remove('hidden');
    document.getElementById('p2s1-next-btn').classList.remove('hidden');
  }

  function _bindButtons() {
    document.getElementById('p2s1-quiz-btn').addEventListener('click', _showQuiz, { once: true });
    document.getElementById('p2s1-next-btn').addEventListener('click', () => {
      teardown();
      if (_onComplete) _onComplete(_score);
    }, { once: true });
  }

  return { init, teardown, getScore };
})();
