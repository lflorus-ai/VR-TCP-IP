const P2S2 = (() => {
  let _score = 0;
  let _placed = new Set();
  let _quizAnswered = false;
  let _onComplete = null;

  const PROTOCOLS = [
    { id: 'http',     label: 'HTTP',     layer: 'anwendung'  },
    { id: 'ftp',      label: 'FTP',      layer: 'anwendung'  },
    { id: 'tcp',      label: 'TCP',      layer: 'transport'  },
    { id: 'udp',      label: 'UDP',      layer: 'transport'  },
    { id: 'ip',       label: 'IP',       layer: 'internet'   },
    { id: 'arp',      label: 'ARP',      layer: 'internet'   },
    { id: 'ethernet', label: 'Ethernet', layer: 'netzzugang' },
  ];

  const LAYERS = [
    { id: 'anwendung',  name: 'Anwendung',  num: 4, color: '#50e0a0', stroke: 'rgba(80,224,160,0.4)'  },
    { id: 'transport',  name: 'Transport',  num: 3, color: '#64a0ff', stroke: 'rgba(100,160,255,0.4)' },
    { id: 'internet',   name: 'Internet',   num: 2, color: '#f5c518', stroke: 'rgba(245,197,24,0.4)'  },
    { id: 'netzzugang', name: 'Netzzugang', num: 1, color: '#ff7850', stroke: 'rgba(255,120,80,0.4)'  },
  ];

  const QUIZ = {
    question: 'Was ist der Hauptunterschied zwischen TCP und UDP auf der Transportschicht?',
    options: [
      { text: 'TCP ist verbindungslos und schneller, UDP garantiert die Reihenfolge', correct: false },
      { text: 'TCP garantiert die Zustellung und Reihenfolge, UDP ist schneller aber unzuverlässig', correct: true },
      { text: 'TCP arbeitet auf der Internetschicht, UDP auf der Anwendungsschicht', correct: false },
      { text: 'Beide Protokolle garantieren die Zustellung, unterscheiden sich nur in der Geschwindigkeit', correct: false },
    ],
    feedbackCorrect: '✓ Richtig! TCP ist verbindungsorientiert und garantiert die Reihenfolge der Pakete. UDP ist schneller, verzichtet aber auf die Zustellungsgarantie.',
    feedbackWrong: '✗ Nicht ganz. TCP garantiert die Zustellung und Reihenfolge der Pakete — UDP verzichtet darauf zugunsten von Geschwindigkeit.',
  };

  function init(onComplete) {
    _score = 0;
    _placed = new Set();
    _quizAnswered = false;
    _onComplete = onComplete;

    _renderBank();
    _renderDropZones();
    _bindButtons();

    document.getElementById('p2-s2-overlay').classList.remove('hidden');
    document.getElementById('p2s2-dnd').classList.remove('hidden');
    document.getElementById('p2s2-intro-text').classList.remove('hidden');
    document.getElementById('p2s2-quiz-btn').classList.add('hidden');
    document.getElementById('p2s2-quiz').classList.add('hidden');
    document.getElementById('p2s2-feedback').classList.add('hidden');
    document.getElementById('p2s2-next-btn').classList.add('hidden');
    document.exitPointerLock();
  }

  function teardown() {
    document.getElementById('p2-s2-overlay').classList.add('hidden');
  }

  function getScore() { return _score; }

  function _renderBank() {
    const bank = document.getElementById('p2s2-card-bank');
    bank.innerHTML = '';
    PROTOCOLS.forEach(proto => {
      const card = document.createElement('div');
      card.className = 'p2s2-proto-card';
      card.draggable = true;
      card.dataset.id = proto.id;
      card.textContent = proto.label;
      card.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', proto.id);
        card.classList.add('dragging');
      });
      card.addEventListener('dragend', () => card.classList.remove('dragging'));
      bank.appendChild(card);
    });
  }

  function _renderDropZones() {
    const col = document.getElementById('p2s2-drop-col');
    col.innerHTML = '';
    LAYERS.forEach(layer => {
      const zone = document.createElement('div');
      zone.className = 'p2s2-drop-zone';
      zone.dataset.layer = layer.id;
      zone.style.cssText = `--zone-color:${layer.color};--zone-stroke:${layer.stroke}`;
      zone.innerHTML = `
        <div class="p2s2-zone-header">
          <span class="p2s2-zone-num">Schicht ${layer.num}</span>
          <span class="p2s2-zone-name" style="color:${layer.color}">${layer.name}</span>
        </div>
        <div class="p2s2-chips"></div>`;
      zone.addEventListener('dragover', e => {
        e.preventDefault();
        zone.classList.add('dragover');
      });
      zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
      zone.addEventListener('drop', e => {
        e.preventDefault();
        zone.classList.remove('dragover');
        const protocolId = e.dataTransfer.getData('text/plain');
        _onDrop(protocolId, layer.id, zone);
      });
      col.appendChild(zone);
    });
  }

  function _onDrop(protocolId, layerId, zone) {
    if (_placed.has(protocolId)) return;
    const proto = PROTOCOLS.find(p => p.id === protocolId);
    if (!proto) return;

    if (proto.layer === layerId) {
      _placed.add(protocolId);
      const card = document.querySelector(`#p2s2-card-bank [data-id="${protocolId}"]`);
      if (card) card.remove();
      const chip = document.createElement('span');
      chip.className = 'p2s2-placed-chip';
      chip.textContent = proto.label;
      zone.querySelector('.p2s2-chips').appendChild(chip);
      if (_placed.size === PROTOCOLS.length) {
        _score = 50;
        document.getElementById('p2s2-quiz-btn').classList.remove('hidden');
      }
    } else {
      zone.classList.add('shake');
      zone.addEventListener('animationend', () => zone.classList.remove('shake'), { once: true });
    }
  }

  function _dropForTest(protocolId, layerId) {
    const zone = document.querySelector(`[data-layer="${layerId}"]`);
    if (zone) _onDrop(protocolId, layerId, zone);
  }

  function _bindButtons() {
    document.getElementById('p2s2-quiz-btn').addEventListener('click', _showQuiz, { once: true });
    document.getElementById('p2s2-next-btn').addEventListener('click', () => {
      teardown();
      if (_onComplete) _onComplete(_score);
    }, { once: true });
  }

  function _showQuiz() {
    document.getElementById('p2s2-dnd').classList.add('hidden');
    document.getElementById('p2s2-quiz-btn').classList.add('hidden');
    document.getElementById('p2s2-intro-text').classList.add('hidden');

    const quiz = document.getElementById('p2s2-quiz');
    quiz.classList.remove('hidden');
    document.getElementById('p2s2-question').textContent = QUIZ.question;

    const opts = document.getElementById('p2s2-options');
    opts.innerHTML = '';
    const shuffled = [...QUIZ.options].sort(() => Math.random() - 0.5);
    shuffled.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'p2s2-option';
      btn.textContent = opt.text;
      btn.addEventListener('click', () => _onOptionClick(btn, opt), { once: true });
      opts.appendChild(btn);
    });
  }

  function _onOptionClick(btn, opt) {
    if (_quizAnswered) return;
    _quizAnswered = true;
    document.querySelectorAll('#p2s2-options .p2s2-option').forEach(b => b.classList.add('disabled'));

    const feedback = document.getElementById('p2s2-feedback');
    if (opt.correct) {
      _score += 30;
      btn.classList.add('correct');
      feedback.className = 'p2s2-feedback correct';
      feedback.textContent = QUIZ.feedbackCorrect;
    } else {
      btn.classList.add('wrong');
      document.querySelectorAll('#p2s2-options .p2s2-option').forEach(b => {
        if (QUIZ.options.find(o => o.correct && o.text === b.textContent)) b.classList.add('correct');
      });
      feedback.className = 'p2s2-feedback wrong';
      feedback.textContent = QUIZ.feedbackWrong;
    }
    feedback.classList.remove('hidden');
    document.getElementById('p2s2-next-btn').classList.remove('hidden');
  }

  return { init, teardown, getScore, _dropForTest };
})();
