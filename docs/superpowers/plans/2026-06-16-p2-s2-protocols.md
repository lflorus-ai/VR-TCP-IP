# P2 S2 — Protokoll-Zuordnung (Drag & Drop) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Drag-&-Drop-Szenario, in dem 7 Protokollkarten per HTML5-DnD auf 4 TCP/IP-Schicht-Zonen gezogen werden, gefolgt von einer Quiz-Frage zu TCP vs. UDP (max. 80 Punkte).

**Architecture:** IIFE-Modul `P2S2` nach dem Muster von `p2-s1-layers.js`; Overlay `#p2-s2-overlay` in `index.html`; `game.js` schaltet P2S2 zwischen P2S1 und dem bisherigen `S1_ACTIVE`-Pfad.

**Tech Stack:** Vanilla JS, HTML5 DnD API (`draggable`, `dragstart`/`dragover`/`drop`), Playwright E2E-Tests.

---

## Dateiübersicht

| Datei | Aktion | Zweck |
|---|---|---|
| `tests/ui.spec.js` | Modify | Neue Testgruppe `P2 S2` anhängen |
| `css/style.css` | Modify | Overlay registrieren + `.p2s2-*` Klassen |
| `index.html` | Modify | `#p2-s2-overlay` einfügen + Script-Tag |
| `js/scenarios/p2-s2-protocols.js` | Create | Vollständiges IIFE-Modul |
| `js/game.js` | Modify | P2S2 in P2S1-Callback einklinken |

---

## Task 1: Failing Tests schreiben

**Files:**
- Modify: `tests/ui.spec.js` (am Ende anhängen)

- [ ] **Schritt 1: Testgruppe `P2 S2` ans Ende von `tests/ui.spec.js` anhängen**

```js
test.describe('P2 S2: Protokoll-Zuordnung', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // P2S2 direkt initialisieren (überspringt Tutorial + P2S1)
    await page.evaluate(() => P2S2.init(() => {}));
  });

  test('Overlay ist nach init() sichtbar', async ({ page }) => {
    await expect(page.locator('#p2-s2-overlay')).not.toHaveClass(/hidden/);
  });

  test('7 Protokollkarten mit draggable-Attribut vorhanden', async ({ page }) => {
    const cards = page.locator('#p2s2-card-bank [draggable="true"]');
    await expect(cards).toHaveCount(7);
  });

  test('4 Drop-Zonen mit data-layer-Attribut vorhanden', async ({ page }) => {
    const zones = page.locator('#p2s2-drop-col [data-layer]');
    await expect(zones).toHaveCount(4);
  });

  test('Korrekte Drop: Karte verschwindet aus der Bank', async ({ page }) => {
    await page.evaluate(() => P2S2._dropForTest('http', 'anwendung'));
    await expect(page.locator('#p2s2-card-bank [data-id="http"]')).toHaveCount(0);
  });

  test('Korrekte Drop: Chip erscheint in der Zielzone', async ({ page }) => {
    await page.evaluate(() => P2S2._dropForTest('http', 'anwendung'));
    const chip = page.locator('[data-layer="anwendung"] .p2s2-placed-chip');
    await expect(chip).toHaveCount(1);
    await expect(chip).toHaveText('HTTP');
  });

  test('Falscher Drop: Karte bleibt in der Bank', async ({ page }) => {
    await page.evaluate(() => P2S2._dropForTest('http', 'transport')); // HTTP gehört zu Anwendung
    await expect(page.locator('#p2s2-card-bank [data-id="http"]')).toHaveCount(1);
  });

  test('Quiz-Button erscheint nach korrekter Platzierung aller 7 Karten', async ({ page }) => {
    await expect(page.locator('#p2s2-quiz-btn')).toHaveClass(/hidden/);
    await page.evaluate(() => {
      P2S2._dropForTest('http',     'anwendung');
      P2S2._dropForTest('ftp',      'anwendung');
      P2S2._dropForTest('tcp',      'transport');
      P2S2._dropForTest('udp',      'transport');
      P2S2._dropForTest('ip',       'internet');
      P2S2._dropForTest('arp',      'internet');
      P2S2._dropForTest('ethernet', 'netzzugang');
    });
    await expect(page.locator('#p2s2-quiz-btn')).not.toHaveClass(/hidden/);
  });

  test('Quiz zeigt Frage und 4 Antwortoptionen nach Quiz-Button-Klick', async ({ page }) => {
    await page.evaluate(() => {
      P2S2._dropForTest('http', 'anwendung'); P2S2._dropForTest('ftp', 'anwendung');
      P2S2._dropForTest('tcp', 'transport');  P2S2._dropForTest('udp', 'transport');
      P2S2._dropForTest('ip', 'internet');    P2S2._dropForTest('arp', 'internet');
      P2S2._dropForTest('ethernet', 'netzzugang');
    });
    await page.locator('#p2s2-quiz-btn').click();
    await expect(page.locator('#p2s2-quiz')).not.toHaveClass(/hidden/);
    await expect(page.locator('#p2s2-options .p2s1-option')).toHaveCount(4);
  });

  test('Korrekte Quiz-Antwort: Feedback sichtbar + next-btn erscheint', async ({ page }) => {
    await page.evaluate(() => {
      P2S2._dropForTest('http', 'anwendung'); P2S2._dropForTest('ftp', 'anwendung');
      P2S2._dropForTest('tcp', 'transport');  P2S2._dropForTest('udp', 'transport');
      P2S2._dropForTest('ip', 'internet');    P2S2._dropForTest('arp', 'internet');
      P2S2._dropForTest('ethernet', 'netzzugang');
    });
    await page.locator('#p2s2-quiz-btn').click();
    // Korrekte Antwort enthält "TCP garantiert"
    await page.locator('#p2s2-options .p2s1-option', { hasText: 'TCP garantiert' }).click();
    await expect(page.locator('#p2s2-feedback')).not.toHaveClass(/hidden/);
    await expect(page.locator('#p2s2-next-btn')).not.toHaveClass(/hidden/);
  });

  test('next-btn versteckt das Overlay', async ({ page }) => {
    await page.evaluate(() => {
      P2S2._dropForTest('http', 'anwendung'); P2S2._dropForTest('ftp', 'anwendung');
      P2S2._dropForTest('tcp', 'transport');  P2S2._dropForTest('udp', 'transport');
      P2S2._dropForTest('ip', 'internet');    P2S2._dropForTest('arp', 'internet');
      P2S2._dropForTest('ethernet', 'netzzugang');
    });
    await page.locator('#p2s2-quiz-btn').click();
    await page.locator('#p2s2-options .p2s1-option', { hasText: 'TCP garantiert' }).click();
    await page.locator('#p2s2-next-btn').click();
    await expect(page.locator('#p2-s2-overlay')).toHaveClass(/hidden/);
  });
});
```

- [ ] **Schritt 2: Tests ausführen und bestätigen, dass sie fehlschlagen**

```bash
cd /Users/lucaflorus/Documents/GitHub/VR-TCP-IP && npm test -- --grep "P2 S2"
```

Erwartetes Ergebnis: Fehler mit `ReferenceError: P2S2 is not defined` oder `locator ... not found`. Alle 9 Tests scheitern.

- [ ] **Schritt 3: Commit der failing Tests**

```bash
git add tests/ui.spec.js
git commit -m "test: füge fehlschlagende P2-S2-Tests für Drag&Drop-Protokoll-Zuordnung hinzu"
```

---

## Task 2: CSS — Overlay registrieren + `.p2s2-*` Klassen

**Files:**
- Modify: `css/style.css`

- [ ] **Schritt 1: `#p2-s2-overlay` zur `display: flex`-Regel hinzufügen (~Zeile 67)**

Die aktuelle Regel endet mit `#p2-s1-overlay {`. Ersetze:

```css
#s3-complete-overlay, #final-overlay, #p2-s1-overlay {
```

durch:

```css
#s3-complete-overlay, #final-overlay, #p2-s1-overlay, #p2-s2-overlay {
```

- [ ] **Schritt 2: `#p2-s2-overlay.hidden` zur `display: none`-Regel hinzufügen (~Zeile 78)**

Ersetze:

```css
#final-overlay.hidden, #p2-s1-overlay.hidden { display: none; }
```

durch:

```css
#final-overlay.hidden, #p2-s1-overlay.hidden, #p2-s2-overlay.hidden { display: none; }
```

- [ ] **Schritt 3: Neue `.p2s2-*` Klassen ans Ende von `css/style.css` anhängen**

```css
/* ── P2 S2 — Protokoll-Zuordnung: Drag & Drop ───────────────────────────── */
.p2s2-dnd-layout { display: flex; gap: 14px; margin: 0 0 16px; min-height: 280px; }
.p2s2-card-bank  { display: flex; flex-direction: column; gap: 7px; width: 100px; flex-shrink: 0; }
.p2s2-drop-col   { display: flex; flex-direction: column; gap: 8px; flex: 1; }

.p2s2-proto-card { background: rgba(20,32,55,0.8); border: 1px solid rgba(100,160,255,0.2); border-radius: 8px; padding: 8px 10px; font-size: 12px; font-weight: 700; color: #c8d8f0; cursor: grab; text-align: center; user-select: none; transition: border-color 0.15s, opacity 0.15s; }
.p2s2-proto-card:hover { border-color: rgba(100,160,255,0.5); color: #fff; }
.p2s2-proto-card.dragging { opacity: 0.35; cursor: grabbing; }

.p2s2-drop-zone { border: 1.5px dashed var(--zone-stroke, rgba(100,160,255,0.3)); border-radius: 10px; padding: 8px 10px; flex: 1; transition: border-color 0.15s, background 0.15s; }
.p2s2-drop-zone.dragover { border-color: var(--zone-color); background: rgba(255,255,255,0.04); }
.p2s2-zone-header { display: flex; gap: 6px; align-items: baseline; margin-bottom: 5px; }
.p2s2-zone-num { font-size: 9px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: rgba(180,200,240,0.45); }
.p2s2-zone-name { font-size: 12px; font-weight: 700; }
.p2s2-chips { display: flex; flex-wrap: wrap; gap: 4px; min-height: 18px; }
.p2s2-placed-chip { font-size: 10.5px; font-weight: 700; padding: 2px 8px; border-radius: 4px; background: rgba(80,224,160,0.1); border: 1px solid rgba(80,224,160,0.3); color: #80eec0; }

@keyframes p2s2-shake {
  0%, 100% { transform: translateX(0); }
  25%       { transform: translateX(-5px); }
  75%       { transform: translateX(5px); }
}
.p2s2-drop-zone.shake { animation: p2s2-shake 0.3s ease; border-color: rgba(255,80,80,0.5); }
```

- [ ] **Schritt 4: Commit**

```bash
git add css/style.css
git commit -m "style: registriere #p2-s2-overlay und füge .p2s2-* DnD-Klassen hinzu"
```

---

## Task 3: HTML — Overlay-Markup + Script-Tag

**Files:**
- Modify: `index.html`

- [ ] **Schritt 1: `#p2-s2-overlay` nach `#p2-s1-overlay` einfügen**

Suche den Block:
```html
  <!-- Gesamtauswertung -->
  <div id="final-overlay" class="hidden">
```

Füge direkt davor ein:

```html
  <!-- P2 S2 — Protokoll-Zuordnung: Drag & Drop -->
  <div id="p2-s2-overlay" class="hidden">
    <div class="overlay-box">
      <div class="overlay-tag">Lern-Szenario 2 &middot; Protokoll-Zuordnung</div>
      <div class="overlay-title">Protokolle auf die Schichten verteilen</div>
      <p class="overlay-body" id="p2s2-intro-text">Ziehe jedes Protokoll-K&auml;rtchen auf die richtige TCP/IP-Schicht.</p>
      <div id="p2s2-dnd" class="p2s2-dnd-layout">
        <div id="p2s2-card-bank" class="p2s2-card-bank"></div>
        <div id="p2s2-drop-col" class="p2s2-drop-col"></div>
      </div>
      <button id="p2s2-quiz-btn" class="overlay-btn hidden">Zum Quiz &rarr;</button>
      <div id="p2s2-quiz" class="hidden">
        <div id="p2s2-question" class="p2s1-question"></div>
        <div id="p2s2-options" class="p2s1-options"></div>
        <div id="p2s2-feedback" class="p2s1-feedback hidden"></div>
      </div>
      <button id="p2s2-next-btn" class="overlay-btn hidden" style="margin-top:12px">Weiter zur Lagerhalle &rarr;</button>
    </div>
  </div>

```

- [ ] **Schritt 2: Script-Tag für `p2-s2-protocols.js` vor `game.js` einfügen**

Suche:
```html
  <script src="js/scenarios/p2-s1-layers.js?v=1"></script>
```

Füge danach ein:
```html
  <script src="js/scenarios/p2-s2-protocols.js?v=1"></script>
```

- [ ] **Schritt 3: Commit**

```bash
git add index.html
git commit -m "feat: füge #p2-s2-overlay HTML-Struktur und Script-Tag hinzu"
```

---

## Task 4: JS-Modul `js/scenarios/p2-s2-protocols.js` erstellen

**Files:**
- Create: `js/scenarios/p2-s2-protocols.js`

- [ ] **Schritt 1: Datei erstellen**

```js
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
      btn.className = 'p2s1-option';
      btn.textContent = opt.text;
      btn.addEventListener('click', () => _onOptionClick(btn, opt));
      opts.appendChild(btn);
    });
  }

  function _onOptionClick(btn, opt) {
    if (_quizAnswered) return;
    _quizAnswered = true;
    document.querySelectorAll('#p2s2-options .p2s1-option').forEach(b => b.classList.add('disabled'));

    const feedback = document.getElementById('p2s2-feedback');
    if (opt.correct) {
      _score += 30;
      btn.classList.add('correct');
      feedback.className = 'p2s1-feedback correct';
      feedback.textContent = QUIZ.feedbackCorrect;
    } else {
      btn.classList.add('wrong');
      document.querySelectorAll('#p2s2-options .p2s1-option').forEach(b => {
        if (QUIZ.options.find(o => o.correct && o.text === b.textContent)) b.classList.add('correct');
      });
      feedback.className = 'p2s1-feedback wrong';
      feedback.textContent = QUIZ.feedbackWrong;
    }
    feedback.classList.remove('hidden');
    document.getElementById('p2s2-next-btn').classList.remove('hidden');
  }

  return { init, teardown, getScore, _dropForTest };
})();
```

- [ ] **Schritt 2: Commit**

```bash
git add js/scenarios/p2-s2-protocols.js
git commit -m "feat: implementiere P2S2 Drag&Drop-Modul für Protokoll-Zuordnung"
```

---

## Task 5: `game.js` — P2S2 in P2S1-Callback einklinken

**Files:**
- Modify: `js/game.js:342-352`

- [ ] **Schritt 1: P2S1-Callback anpassen**

Ersetze den gesamten Block (Zeilen ~341–353):

```js
  // P2 S1 starten
  gameState = 'P2_S1_ACTIVE';
  P2S1.init(() => {
    // P2 S1 abgeschlossen → weiter zur Lagerhalle (alt S1)
    gameState = 'S1_ACTIVE';
    document.getElementById('hud-tag').textContent = '■ Lern-Szenario 1';
    document.getElementById('lieferschein-list').style.display = '';
    document.getElementById('progress-pips').style.display  = '';
    const canvas = document.querySelector('a-scene canvas');
    if (canvas) canvas.requestPointerLock();
    showNPCBriefing();
    updateLieferschein();
  });
```

durch:

```js
  // P2 S1 starten
  gameState = 'P2_S1_ACTIVE';
  P2S1.init(() => {
    // P2 S1 abgeschlossen → P2 S2 (Protokoll-Zuordnung)
    gameState = 'P2_S2_ACTIVE';
    document.getElementById('hud-tag').textContent = '■ P2 · S2 — Protokolle';
    P2S2.init(() => {
      // P2 S2 abgeschlossen → weiter zur Lagerhalle (alt S1)
      gameState = 'S1_ACTIVE';
      document.getElementById('hud-tag').textContent = '■ Lern-Szenario 1';
      document.getElementById('lieferschein-list').style.display = '';
      document.getElementById('progress-pips').style.display  = '';
      const canvas = document.querySelector('a-scene canvas');
      if (canvas) canvas.requestPointerLock();
      showNPCBriefing();
      updateLieferschein();
    });
  });
```

- [ ] **Schritt 2: Commit**

```bash
git add js/game.js
git commit -m "feat: schalte P2S2 zwischen P2S1 und S1_ACTIVE in game.js"
```

---

## Task 6: Alle Tests grün — verifizieren

**Files:** Keine Änderungen

- [ ] **Schritt 1: Gesamte Testsuite ausführen**

```bash
cd /Users/lucaflorus/Documents/GitHub/VR-TCP-IP && npm test
```

Erwartetes Ergebnis: Alle Tests grün, inkl. der neuen `P2 S2`-Gruppe (9 Tests).

- [ ] **Schritt 2: Falls Tests fehlschlagen — gezielt debuggen**

```bash
npm test -- --grep "P2 S2" --reporter=list
```

Häufige Fehlerquellen:
- `ReferenceError: P2S2 is not defined` → Script-Tag fehlt oder steht nach `game.js`
- `locator not found` → Element-ID falsch geschrieben oder Overlay noch `hidden`
- `expect(cards).toHaveCount(7)` schlägt fehl → `_renderBank()` wurde nicht aufgerufen (prüfe `init()`-Aufruf in `beforeEach`)

- [ ] **Schritt 3: Abschluss-Commit wenn alle Tests grün**

```bash
git add -A
git commit -m "feat: P2 S2 Prototyp — Drag&Drop Protokoll-Zuordnung vollständig implementiert"
```
