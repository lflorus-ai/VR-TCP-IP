/* ============================================================================
 * scenario-manager.js — Zentrale Verwaltungsinstanz für die Lern-Szenarien.
 *
 * Kapselt an EINER Stelle:
 *   - den aktiven Durchlauf-Modus (geführt / frei),
 *   - den Fortschritt (welche Szenarien sind abgeschlossen),
 *   - die Freischaltungslogik (canEnter) — Reihenfolge im geführten Modus,
 *     freie Wahl im freien Modus.
 *
 * Hinweis zur Architektur: Dies ist eine A-Frame/Vanilla-JS-Anwendung (kein
 * Unity, kein Build-Tool, kein Framework). Die in der Aufgabenstellung genannten
 * OOP-Begriffe sind hier so umgesetzt:
 *   - "GameMode-Enum"          → eingefrorene JS-Konstante `Mode`
 *   - "Basisklasse / Interface"→ `BaseScenario`-Helfer + einheitlicher Vertrag
 *   - "ScenarioManager"        → dieses IIFE-Singleton
 *
 * WICHTIG: Diese Datei wird in index.html VOR allen Szenario-Modulen und VOR
 * game.js geladen, damit `Mode`, `BaseScenario` und `ScenarioManager` als
 * Globals zur Verfügung stehen.
 * ========================================================================== */

// ── GameMode-Enum ───────────────────────────────────────────────────────────
const Mode = Object.freeze({ GUIDED: 'guided', FREE: 'free' });

/*
 * Einheitlicher Szenario-Vertrag (das "Interface", dem alle Module folgen):
 *
 *   { id, init(onComplete), teardown(), getScore(), handlePickup(el) }
 *
 * `BaseScenario(spec)` liefert No-op-Defaults für alle Vertragsmethoden, sodass
 * ein Modul nur überschreiben muss, was es tatsächlich braucht. Bestehende
 * IIFE-Module bleiben kompatibel — sie erfüllen den Vertrag bereits direkt.
 */
function BaseScenario(spec) {
  return Object.assign({
    id: null,
    init() {},
    teardown() {},
    getScore() { return 0; },
    handlePickup() { return false; },
  }, spec || {});
}

// ── ScenarioManager (Singleton) ──────────────────────────────────────────────
const ScenarioManager = (() => {
  let _mode = Mode.GUIDED;                          // Default = bisheriges Verhalten
  const _order = ['s1', 's2', 's3', 's4', 's5'];    // feste Reihenfolge (geführt)
  const _done  = { s1: false, s2: false, s3: false, s4: false, s5: false };
  const _registry = {};                             // id -> { id, enter, module }

  return {
    Mode,

    // ── Modus ────────────────────────────────────────────────────────────
    setMode(m) { _mode = (m === Mode.FREE) ? Mode.FREE : Mode.GUIDED; },
    getMode()  { return _mode; },
    isFree()   { return _mode === Mode.FREE; },
    isGuided() { return _mode === Mode.GUIDED; },

    // ── Szenario-Registry (einheitlicher Vertrag) ─────────────────────────
    // def = { enter: Function, module: <Szenario-Modul> }
    register(id, def) { _registry[id] = Object.assign({ id }, def || {}); return _registry[id]; },
    get(id)           { return _registry[id] || null; },
    ids()             { return _order.slice(); },

    // ── Fortschritt / Freischaltung (die EINE Stelle für Sperrlogik) ──────
    // Im freien Modus ist jedes noch nicht erledigte Szenario sofort spielbar.
    // Im geführten Modus muss der direkte Vorgänger abgeschlossen sein.
    canEnter(id) {
      if (_done[id]) return false;                  // bereits abgeschlossen
      if (_mode === Mode.FREE) return true;         // frei: keine Reihenfolge
      const i = _order.indexOf(id);
      return i <= 0 || _done[_order[i - 1]];        // geführt: Vorgänger nötig
    },
    isDone(id)   { return !!_done[id]; },
    markDone(id) { if (id in _done) _done[id] = true; },
    allDone()    { return _order.every(k => _done[k]); },
    reset()      { _order.forEach(k => { _done[k] = false; }); },
  };
})();
