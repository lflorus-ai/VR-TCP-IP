const P2S4 = (() => {
  let _score = 0;
  let _matched = new Set();
  let _quizAnswered = false;
  let _onComplete = null;
  let _selectedTcpip = null;

  const TCPIP_LAYERS = [
    { id: 'anwendung',  name: 'Anwendung',  num: 4, color: '#50e0a0', osiGroup: 'osi-upper'    },
    { id: 'transport',  name: 'Transport',  num: 3, color: '#64a0ff', osiGroup: 'osi-transport' },
    { id: 'internet',   name: 'Internet',   num: 2, color: '#f5c518', osiGroup: 'osi-netzwerk'  },
    { id: 'netzzugang', name: 'Netzzugang', num: 1, color: '#ff7850', osiGroup: 'osi-lower'     },
  ];

  const OSI_GROUPS = [
    { id: 'osi-upper',     label: 'Schichten 5–7', sub: 'Sitzung · Darstellung · Anwendung', tcpip: 'anwendung'  },
    { id: 'osi-transport', label: 'Schicht 4',     sub: 'Transport',                         tcpip: 'transport'  },
    { id: 'osi-netzwerk',  label: 'Schicht 3',     sub: 'Netzwerk',                          tcpip: 'internet'   },
    { id: 'osi-lower',     label: 'Schichten 1–2', sub: 'Physisch · Sicherung',              tcpip: 'netzzugang' },
  ];

  const INFO_CARDS = [
    {
      icon: '🏷️',
      title: 'Was ist eine IP-Adresse?',
      body: 'Eine IP-Adresse ist die eindeutige Kennung eines Geräts im Netz — wie eine Hausnummer. IPv4-Adressen bestehen aus vier Zahlen (0–255), z.B. <code>192.168.1.10</code>.',
    },
    {
      icon: '🌐',
      title: 'Internet-Schicht & Routing',
      body: 'Die Internet-Schicht im TCP/IP-Modell übernimmt die logische Adressierung per IP und bestimmt den Weg der Datenpakete durch Netzwerke — das nennt sich <strong>Routing</strong>.',
    },
    {
      icon: '🗺️',
      title: 'TCP/IP trifft OSI',
      body: 'Das OSI-Modell hat 7 Schichten, TCP/IP nur 4. Die Internet-Schicht entspricht <strong>OSI-Schicht 3 (Netzwerk)</strong> — beide beschäftigen sich mit IP-Adressen und Routing.',
    },
  ];

  const QUIZ = {
    question: 'Welcher OSI-Schicht entspricht die Internet-Schicht im TCP/IP-Modell?',
    options: [
      { text: 'OSI-Schicht 2 (Sicherungsschicht)', correct: false },
      { text: 'OSI-Schicht 3 (Netzwerkschicht)',   correct: true  },
      { text: 'OSI-Schicht 4 (Transportschicht)',  correct: false },
      { text: 'OSI-Schicht 7 (Anwendungsschicht)', correct: false },
    ],
    feedbackCorrect: '✓ Richtig! Die Internet-Schicht (TCP/IP) entspricht OSI-Schicht 3 — beide regeln logische Adressierung per IP und das Routing der Datenpakete.',
    feedbackWrong:   '✗ Nicht ganz. Die Internet-Schicht entspricht OSI-Schicht 3 (Netzwerkschicht) — zuständig für IP-Adressen und das Routing zwischen Netzwerken.',
  };

  function init(onComplete) {
    _score = 0;
    _matched = new Set();
    _quizAnswered = false;
    _onComplete = onComplete;
    _selectedTcpip = null;

    _renderInfoCards();
    _bindButtons();

    document.getElementById('p2-s4-overlay').classList.remove('hidden');
    document.getElementById('p2s4-info-phase').classList.remove('hidden');
    document.getElementById('p2s4-map-phase').classList.add('hidden');
    document.getElementById('p2s4-quiz').classList.add('hidden');
    document.getElementById('p2s4-feedback').classList.add('hidden');
    document.getElementById('p2s4-map-btn').classList.add('hidden');
    document.getElementById('p2s4-quiz-btn').classList.add('hidden');
    document.getElementById('p2s4-next-btn').classList.add('hidden');
    document.exitPointerLock();
  }

  function teardown() {
    document.getElementById('p2-s4-overlay').classList.add('hidden');
  }

  function getScore() { return _score; }

  function _renderInfoCards() {
    const grid = document.getElementById('p2s4-info-cards');
    grid.innerHTML = '';
    INFO_CARDS.forEach(card => {
      const el = document.createElement('div');
      el.className = 'p2s4-info-card';
      el.innerHTML = `
        <div class="p2s4-info-icon">${card.icon}</div>
        <div class="p2s4-info-title">${card.title}</div>
        <div class="p2s4-info-body hidden">${card.body}</div>`;
      el.addEventListener('click', () => {
        const wasOpen = el.classList.contains('open');
        document.querySelectorAll('#p2s4-info-cards .p2s4-info-card').forEach(c => {
          c.classList.remove('open');
          c.querySelector('.p2s4-info-body').classList.add('hidden');
        });
        if (!wasOpen) {
          el.classList.add('open', 'viewed');
          el.querySelector('.p2s4-info-body').classList.remove('hidden');
          const viewed = document.querySelectorAll('#p2s4-info-cards .p2s4-info-card.viewed').length;
          if (viewed === INFO_CARDS.length) {
            document.getElementById('p2s4-map-btn').classList.remove('hidden');
          }
        }
      });
      grid.appendChild(el);
    });
  }

  function _renderMapping() {
    const tcpipCol = document.getElementById('p2s4-tcpip-col');
    const osiCol   = document.getElementById('p2s4-osi-col');
    const svg      = document.getElementById('p2s4-lines-svg');
    tcpipCol.innerHTML = '';
    osiCol.innerHTML   = '';
    svg.innerHTML      = '';

    TCPIP_LAYERS.forEach(layer => {
      const el = document.createElement('div');
      el.className = 'p2s4-layer-row';
      el.dataset.id = layer.id;
      el.style.cssText = `--layer-color:${layer.color}`;
      el.innerHTML = `<span class="p2s4-row-num">S${layer.num}</span><span class="p2s4-row-name">${layer.name}</span>`;
      el.addEventListener('click', () => _onTcpipClick(layer.id));
      tcpipCol.appendChild(el);
    });

    OSI_GROUPS.forEach(group => {
      const el = document.createElement('div');
      el.className = 'p2s4-osi-row';
      el.dataset.id = group.id;
      el.innerHTML = `<span class="p2s4-osi-label">${group.label}</span><span class="p2s4-osi-sub">${group.sub}</span>`;
      el.addEventListener('click', () => _onOsiClick(group.id));
      osiCol.appendChild(el);
    });
  }

  function _onTcpipClick(id) {
    if (_matched.has(id)) return;
    _selectedTcpip = id;
    document.querySelectorAll('#p2s4-tcpip-col .p2s4-layer-row').forEach(el => {
      el.classList.toggle('selected', el.dataset.id === id);
    });
  }

  function _onOsiClick(osiGroupId) {
    if (!_selectedTcpip) return;
    const layer    = TCPIP_LAYERS.find(l => l.id === _selectedTcpip);
    const osiGroup = OSI_GROUPS.find(g => g.id === osiGroupId);
    if (!layer || !osiGroup || _matched.has(_selectedTcpip)) return;

    if (osiGroup.tcpip === _selectedTcpip) {
      _matched.add(_selectedTcpip);
      _score += 15;

      const tcpipEl = document.querySelector(`#p2s4-tcpip-col [data-id="${_selectedTcpip}"]`);
      const osiEl   = document.querySelector(`#p2s4-osi-col [data-id="${osiGroupId}"]`);
      if (tcpipEl) tcpipEl.classList.add('matched');
      if (osiEl)   osiEl.classList.add('matched');
      _drawLine(tcpipEl, osiEl, layer.color);

      _selectedTcpip = null;
      document.querySelectorAll('#p2s4-tcpip-col .p2s4-layer-row').forEach(el => el.classList.remove('selected'));

      if (_matched.size === TCPIP_LAYERS.length) {
        document.getElementById('p2s4-quiz-btn').classList.remove('hidden');
        document.getElementById('p2s4-map-hint').textContent = '✓ Alle Schichten zugeordnet!';
      }
    } else {
      const osiEl = document.querySelector(`#p2s4-osi-col [data-id="${osiGroupId}"]`);
      if (osiEl) {
        osiEl.classList.add('shake');
        osiEl.addEventListener('animationend', () => osiEl.classList.remove('shake'), { once: true });
      }
    }
  }

  function _drawLine(tcpipEl, osiEl, color) {
    const svg     = document.getElementById('p2s4-lines-svg');
    const svgRect = svg.getBoundingClientRect();
    const t       = tcpipEl.getBoundingClientRect();
    const o       = osiEl.getBoundingClientRect();

    const x1 = t.right  - svgRect.left;
    const y1 = t.top    + t.height / 2 - svgRect.top;
    const x2 = o.left   - svgRect.left;
    const y2 = o.top    + o.height / 2 - svgRect.top;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', '2.5');
    line.setAttribute('stroke-linecap', 'round');
    line.setAttribute('opacity', '0.8');
    svg.appendChild(line);
  }

  function _showMapping() {
    document.getElementById('p2s4-info-phase').classList.add('hidden');
    document.getElementById('p2s4-map-phase').classList.remove('hidden');
    document.getElementById('p2s4-map-hint').textContent = 'TCP/IP-Schicht auswählen → OSI-Gruppe klicken';
    _renderMapping();
  }

  function _showQuiz() {
    document.getElementById('p2s4-map-phase').classList.add('hidden');

    const quiz = document.getElementById('p2s4-quiz');
    quiz.classList.remove('hidden');
    document.getElementById('p2s4-question').textContent = QUIZ.question;

    const opts     = document.getElementById('p2s4-options');
    opts.innerHTML = '';
    const shuffled = [...QUIZ.options].sort(() => Math.random() - 0.5);
    shuffled.forEach(opt => {
      const btn = document.createElement('button');
      btn.className   = 'p2s4-option';
      btn.textContent = opt.text;
      btn._opt        = opt;
      btn.addEventListener('click', () => _onOptionClick(btn, opt), { once: true });
      opts.appendChild(btn);
    });
  }

  function _onOptionClick(btn, opt) {
    if (_quizAnswered) return;
    _quizAnswered = true;
    document.querySelectorAll('#p2s4-options .p2s4-option').forEach(b => b.classList.add('disabled'));

    const feedback = document.getElementById('p2s4-feedback');
    if (opt.correct) {
      _score += 20;
      btn.classList.add('correct');
      feedback.className   = 'p2s4-feedback correct';
      feedback.textContent = QUIZ.feedbackCorrect;
    } else {
      btn.classList.add('wrong');
      document.querySelectorAll('#p2s4-options .p2s4-option').forEach(b => {
        if (b._opt && b._opt.correct) b.classList.add('correct');
      });
      feedback.className   = 'p2s4-feedback wrong';
      feedback.textContent = QUIZ.feedbackWrong;
    }
    feedback.classList.remove('hidden');
    document.getElementById('p2s4-next-btn').classList.remove('hidden');
  }

  function _bindButtons() {
    ['p2s4-map-btn', 'p2s4-quiz-btn', 'p2s4-next-btn'].forEach(id => {
      const el    = document.getElementById(id);
      const fresh = el.cloneNode(true);
      el.replaceWith(fresh);
    });

    document.getElementById('p2s4-map-btn').addEventListener('click',  _showMapping, { once: true });
    document.getElementById('p2s4-quiz-btn').addEventListener('click', _showQuiz,    { once: true });
    document.getElementById('p2s4-next-btn').addEventListener('click', () => {
      teardown();
      if (_onComplete) _onComplete(_score);
    }, { once: true });
  }

  function _matchForTest(tcpipId, osiGroupId) {
    _selectedTcpip = tcpipId;
    _onOsiClick(osiGroupId);
  }

  return { init, teardown, getScore, _matchForTest };
})();
