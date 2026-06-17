const P2S6 = (() => {
  let _onAllDone = null;
  const _done = { s1: false, s2: false, s3: false, s4: false, s5: false };

  return {
    start(onAllDone) {
      _onAllDone = onAllDone;
      Object.keys(_done).forEach(k => { _done[k] = false; });
    },
    markDone(zone) {
      _done[zone] = true;
      if (Object.values(_done).every(Boolean)) {
        if (_onAllDone) _onAllDone();
      }
    },
    isDone(zone) { return !!_done[zone]; },
  };
})();
const L6 = P2S6;
