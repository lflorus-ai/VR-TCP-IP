const P2S6 = (() => {
  let _onComplete = null;
  let _timerInterval = null;
  let _seconds = 0;
  let _totalScore = 0;
  let _taskScores = [0, 0, 0];

  const PROTOCOLS = [
    { id: 'http',     label: 'HTTP',     layer: 'app' },
    { id: 'ftp',      label: 'FTP',      layer: 'app' },
    { id: 'smtp',     label: 'SMTP',     layer: 'app' },
    { id: 'dns',      label: 'DNS',      layer: 'app' },
    { id: 'tcp',      label: 'TCP',      layer: 'transport' },
    { id: 'udp',      label: 'UDP',      layer: 'transport' },
    { id: 'ip',       label: 'IP',       layer: 'internet' },
    { id: 'ethernet', label: 'Ethernet', layer: 'netaccess' },
  ];

  const SCENARIOS = [
    { id: 'sc1', label: 'Videoanruf (Zoom/Teams)',        answer: 'udp' },
    { id: 'sc2', label: 'Login-Formular absenden',        answer: 'tcp' },
    { id: 'sc3', label: 'DNS-Abfrage eines Domainnamens', answer: 'udp' },
    { id: 'sc4', label: 'Datei-Download per FTP',         answer: 'tcp' },
    { id: 'sc5', label: 'Live-Sportstream im Browser',    answer: 'udp' },
    { id: 'sc6', label: 'Online-Banking Überweisung',      answer: 'tcp' },
  ];

  const ROUTING_DISPLAY = [
    { dest: '192.168.1.0/24', iface: 'eth0' },
    { dest: '10.0.0.0/24',    iface: 'eth1' },
    { dest: '172.16.0.0/16',  iface: 'eth2' },
  ];

  const PACKETS = [
    { ip: '192.168.1.55', answer: 'eth0' },
    { ip: '10.0.0.112',   answer: 'eth1' },
    { ip: '172.16.3.8',   answer: 'eth2' },
  ];

  const MAX_SCORE = PROTOCOLS.length * 10 + SCENARIOS.length * 10 + PACKETS.length * 10; // 170

  let _protoAssignments = {};
  let _selectedProto = null;
  let _scenarioAnswers = {};
  let _routingAnswers = {};

  function _fmt(s) {
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  function _startTimer() {
    _seconds = 0;
    const el = document.getElementById('s6-timer');
    if (el) el.textContent = _fmt(0);
    _timerInterval = setInterval(function() {
      _seconds++;
      var t = document.getElementById('s6-timer');
      if (t) t.textContent = _fmt(_seconds);
    }, 1000);
  }

  function _stopTimer() {
    clearInterval(_timerInterval);
    _timerInterval = null;
  }

  function _showStep(n) {
    document.querySelectorAll('.s6-step').forEach(function(el) { el.classList.add('hidden'); });
    var step = document.getElementById('s6-step-' + n);
    if (step) step.classList.remove('hidden');
  }

  function _buildTask1() {
    var container = document.getElementById('s6-step-1');
    if (!container) return;
    _protoAssignments = {};
    _selectedProto = null;

    var chipsEl = container.querySelector('.s6-proto-chips');
    chipsEl.innerHTML = '';
    PROTOCOLS.forEach(function(p) {
      var chip = document.createElement('div');
      chip.className = 's6-proto-chip';
      chip.dataset.id = p.id;
      chip.textContent = p.label;
      chip.addEventListener('click', function() {
        if (chip.classList.contains('correct') || chip.classList.contains('wrong')) return;
        _selectedProto = p.id;
        container.querySelectorAll('.s6-proto-chip').forEach(function(c) {
          c.classList.toggle('selected', c.dataset.id === p.id);
        });
      });
      chipsEl.appendChild(chip);
    });

    var layerZones = container.querySelectorAll('.s6-layer-zone');
    layerZones.forEach(function(zone) {
      zone.querySelector('.s6-layer-items').innerHTML = '';
      if (zone._s6h) zone.removeEventListener('click', zone._s6h);
      zone._s6h = function() {
        if (!_selectedProto) return;
        _protoAssignments[_selectedProto] = zone.dataset.layer;

        var chip = container.querySelector('.s6-proto-chip[data-id="' + _selectedProto + '"]');
        if (chip) { chip.classList.remove('selected'); chip.classList.add('assigned'); }

        layerZones.forEach(function(z) {
          var items = z.querySelector('.s6-layer-items');
          items.innerHTML = '';
          PROTOCOLS.filter(function(p) { return _protoAssignments[p.id] === z.dataset.layer; }).forEach(function(p) {
            var tag = document.createElement('span');
            tag.className = 's6-layer-tag';
            tag.textContent = p.label;
            items.appendChild(tag);
          });
        });

        _selectedProto = null;
        var checkBtn = container.querySelector('.s6-check-btn');
        if (checkBtn) checkBtn.disabled = Object.keys(_protoAssignments).length < PROTOCOLS.length;
      };
      zone.addEventListener('click', zone._s6h);
    });

    var checkBtn = container.querySelector('.s6-check-btn');
    checkBtn.disabled = true;
    checkBtn.classList.remove('hidden');
    container.querySelector('.s6-next-btn').classList.add('hidden');

    if (checkBtn._s6h) checkBtn.removeEventListener('click', checkBtn._s6h);
    checkBtn._s6h = function() {
      var score = 0;
      PROTOCOLS.forEach(function(p) {
        var correct = _protoAssignments[p.id] === p.layer;
        var chip = container.querySelector('.s6-proto-chip[data-id="' + p.id + '"]');
        if (chip) { chip.classList.remove('assigned', 'selected'); chip.classList.add(correct ? 'correct' : 'wrong'); }
        score += correct ? 10 : -5;
      });
      _taskScores[0] = Math.max(0, score);
      _totalScore += _taskScores[0];
      checkBtn.disabled = true;
      container.querySelector('.s6-next-btn').classList.remove('hidden');
    };
    checkBtn.addEventListener('click', checkBtn._s6h);
  }

  function _buildTask2() {
    var container = document.getElementById('s6-step-2');
    if (!container) return;
    _scenarioAnswers = {};

    var list = container.querySelector('.s6-scenario-list');
    list.innerHTML = '';
    SCENARIOS.forEach(function(sc) {
      var row = document.createElement('div');
      row.className = 's6-scenario-row';
      row.dataset.sc = sc.id;
      row.innerHTML =
        '<span class="s6-scenario-label">' + sc.label + '</span>' +
        '<div class="s6-scenario-btns">' +
          '<button class="s6-tcp-btn">TCP</button>' +
          '<button class="s6-udp-btn">UDP</button>' +
        '</div>';
      var tcpBtn = row.querySelector('.s6-tcp-btn');
      var udpBtn = row.querySelector('.s6-udp-btn');
      tcpBtn.addEventListener('click', function() {
        _scenarioAnswers[sc.id] = 'tcp';
        tcpBtn.classList.add('active'); udpBtn.classList.remove('active');
        var cb = container.querySelector('.s6-check-btn');
        if (cb) cb.disabled = Object.keys(_scenarioAnswers).length < SCENARIOS.length;
      });
      udpBtn.addEventListener('click', function() {
        _scenarioAnswers[sc.id] = 'udp';
        udpBtn.classList.add('active'); tcpBtn.classList.remove('active');
        var cb = container.querySelector('.s6-check-btn');
        if (cb) cb.disabled = Object.keys(_scenarioAnswers).length < SCENARIOS.length;
      });
      list.appendChild(row);
    });

    var checkBtn = container.querySelector('.s6-check-btn');
    checkBtn.disabled = true;
    checkBtn.classList.remove('hidden');
    container.querySelector('.s6-next-btn').classList.add('hidden');

    if (checkBtn._s6h) checkBtn.removeEventListener('click', checkBtn._s6h);
    checkBtn._s6h = function() {
      var score = 0;
      SCENARIOS.forEach(function(sc) {
        var correct = _scenarioAnswers[sc.id] === sc.answer;
        var row = list.querySelector('[data-sc="' + sc.id + '"]');
        if (row) row.classList.add(correct ? 'correct' : 'wrong');
        score += correct ? 10 : -5;
      });
      _taskScores[1] = Math.max(0, score);
      _totalScore += _taskScores[1];
      checkBtn.disabled = true;
      container.querySelector('.s6-next-btn').classList.remove('hidden');
    };
    checkBtn.addEventListener('click', checkBtn._s6h);
  }

  function _buildTask3() {
    var container = document.getElementById('s6-step-3');
    if (!container) return;
    _routingAnswers = {};

    var list = container.querySelector('.s6-routing-list');
    list.innerHTML = '';
    PACKETS.forEach(function(pkt, i) {
      var row = document.createElement('div');
      row.className = 's6-routing-row';
      row.innerHTML =
        '<span class="s6-routing-dest">Paket &rarr; <code>' + pkt.ip + '</code></span>' +
        '<div class="s6-routing-btns">' +
          ROUTING_DISPLAY.map(function(r) { return '<button class="s6-iface-btn">' + r.iface + '</button>'; }).join('') +
        '</div>';
      row.querySelectorAll('.s6-iface-btn').forEach(function(btn, j) {
        btn.addEventListener('click', function() {
          _routingAnswers[i] = ROUTING_DISPLAY[j].iface;
          row.querySelectorAll('.s6-iface-btn').forEach(function(b, k) { b.classList.toggle('active', k === j); });
          var cb = container.querySelector('.s6-check-btn');
          if (cb) cb.disabled = Object.keys(_routingAnswers).length < PACKETS.length;
        });
      });
      list.appendChild(row);
    });

    var checkBtn = container.querySelector('.s6-check-btn');
    checkBtn.disabled = true;
    checkBtn.classList.remove('hidden');
    container.querySelector('.s6-next-btn').classList.add('hidden');

    if (checkBtn._s6h) checkBtn.removeEventListener('click', checkBtn._s6h);
    checkBtn._s6h = function() {
      var score = 0;
      PACKETS.forEach(function(pkt, i) {
        var correct = _routingAnswers[i] === pkt.answer;
        var rows = list.querySelectorAll('.s6-routing-row');
        if (rows[i]) rows[i].classList.add(correct ? 'correct' : 'wrong');
        score += correct ? 10 : -5;
      });
      _taskScores[2] = Math.max(0, score);
      _totalScore += _taskScores[2];
      checkBtn.disabled = true;
      container.querySelector('.s6-next-btn').classList.remove('hidden');
    };
    checkBtn.addEventListener('click', checkBtn._s6h);
  }

  function _showResults() {
    _stopTimer();
    var pct = Math.round((_totalScore / MAX_SCORE) * 100);

    document.getElementById('s6-result-t1').textContent = _taskScores[0] + ' Pkt';
    document.getElementById('s6-result-t2').textContent = _taskScores[1] + ' Pkt';
    document.getElementById('s6-result-t3').textContent = _taskScores[2] + ' Pkt';
    document.getElementById('s6-result-total').textContent = _totalScore + ' / ' + MAX_SCORE + ' Pkt';
    document.getElementById('s6-result-pct').textContent = pct + ' %';
    document.getElementById('s6-result-time').textContent = _fmt(_seconds);

    var msgEl = document.getElementById('s6-result-msg');
    if (msgEl) {
      msgEl.textContent = pct >= 70
        ? '✓ Bestanden! Du beherrschst die TCP/IP-Grundkonzepte sicher.'
        : '○ Noch Übungsbedarf. Wiederhole die Lernszenarien für ein besseres Ergebnis.';
      msgEl.style.color = pct >= 70 ? '#60ff90' : '#ff9955';
    }

    _showStep(4);

    var finishBtn = document.querySelector('#s6-step-4 .s6-finish-btn');
    if (finishBtn._s6h) finishBtn.removeEventListener('click', finishBtn._s6h);
    finishBtn._s6h = function() {
      document.getElementById('p2-s6-overlay').classList.add('hidden');
      if (_onComplete) _onComplete(_totalScore);
    };
    finishBtn.addEventListener('click', finishBtn._s6h);
  }

  return {
    init: function(onComplete) {
      _onComplete = onComplete;
      _totalScore = 0;
      _taskScores = [0, 0, 0];
      document.exitPointerLock && document.exitPointerLock();

      document.getElementById('p2-s6-overlay').classList.remove('hidden');

      _buildTask1();
      _buildTask2();
      _buildTask3();
      _showStep(0);

      var startBtn = document.getElementById('s6-start-btn');
      if (startBtn._s6h) startBtn.removeEventListener('click', startBtn._s6h);
      startBtn._s6h = function() { _startTimer(); _showStep(1); };
      startBtn.addEventListener('click', startBtn._s6h);

      function _wireNext(stepId, fn) {
        var btn = document.querySelector('#' + stepId + ' .s6-next-btn');
        if (!btn) return;
        if (btn._s6h) btn.removeEventListener('click', btn._s6h);
        btn._s6h = fn;
        btn.addEventListener('click', btn._s6h);
      }
      _wireNext('s6-step-1', function() { _showStep(2); });
      _wireNext('s6-step-2', function() { _showStep(3); });
      _wireNext('s6-step-3', function() { _showResults(); });
    },

    teardown: function() {
      _stopTimer();
      _onComplete = null;
    },

    getScore: function() { return _totalScore; },
  };
})();
const L6 = P2S6;
