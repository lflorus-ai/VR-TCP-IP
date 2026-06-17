const P2S5 = (() => {
  let _onComplete = null;
  let _score = 0;
  let _processed = 0;
  const TOTAL = 5;

  // Netzpräfix → korrekter Ausgang
  const ROUTING_TABLE = {
    '10.0.0':    'r5-exit-a',
    '192.168.1': 'r5-exit-b',
    '172.16.5':  'r5-exit-c',
  };

  function _correctExit(dest) {
    const prefix = dest.split('.').slice(0, 3).join('.');
    return ROUTING_TABLE[prefix] || null;
  }

  return {
    init(onComplete) {
      _onComplete = onComplete;
      _score = 0;
      _processed = 0;
    },

    teardown() {
      _onComplete = null;
    },

    getScore() { return _score; },

    handlePickup() { return false; },

    _routeForTest(paketId, exitId) {
      const el = document.getElementById(paketId);
      if (!el) return;
      const dest = el.dataset.dest;
      if (_correctExit(dest) === exitId) {
        _score += 100;
      } else {
        _score -= 20;
      }
      _processed++;
      if (_processed >= TOTAL && _onComplete) {
        _onComplete(_score);
      }
    },
  };
})();
