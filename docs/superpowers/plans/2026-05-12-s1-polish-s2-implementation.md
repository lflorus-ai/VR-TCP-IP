# S1 polieren + S2 implementieren — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Verbessert Lern-Szenario 1 (Lieferschein-Strikethrough, Max-Feedback, Qualitaetsbewertung) und implementiert Lern-Szenario 2 (Paketverlust via Buerocomputer + physische Neulieferung) in `index.html`.

**Architecture:** Die gesamte App lebt in einer einzigen `index.html`. Der Spielzustand wird durch eine neue `gameState`-Variable (`'INTRO'|'S1_ACTIVE'|'S1_COMPLETE'|'S2_BRIEFING'|'S2_ACTIVE'|'S2_COMPLETE'`) gesteuert. S2-Pakete spawnen dynamisch in Regal B. Der Buerocomputer-Screen wird ueber A-Frame `a-text`-Elemente (mit IDs) per JS aktualisiert. DOM-Manipulation erfolgt ausschliesslich ueber `createElement`/`textContent` (kein `innerHTML` mit variablen Daten).

**Tech Stack:** A-Frame 1.7.1, Vanilla JS, HTML/CSS — kein Build-Tool.

---

## Dateiuebersicht

Nur `index.html` wird geaendert. Alle Aenderungen sind inline.

| Bereich | Was aendert sich |
|---|---|
| CSS (Zeilen 7-97) | Neue Klassen: `#lieferschein-list`, `.ls-row`, `.ls-done`, `.ls-active`, `.ls-pending` |
| HTML HUD (Zeile 101-106) | `id="hud-tag"` hinzufuegen, `#lieferschein-list` div einfuegen |
| HTML Overlays (Zeile 141-156) | `#co-quality` in complete-overlay; neues `#s2-complete-overlay` nach complete-overlay |
| A-Frame Scene (Zeile 767-785) | `id="office-computer-entity"`, `id="computer-screen"`, `id="computer-line1/2"`, Office-Glow-Entity |
| JS - Komponenten (Zeile 159-176) | Neue `computer-proximity`-Komponente |
| JS - Spiellogik (Zeile 800-1280) | `gameState`, `maxFeedback`, `initS2`, `renderComputerScreen`, `spawnS2Packages`, `showS2CompleteOverlay`, Aenderungen an `updateLieferschein`, `interactWithPalette`, `showCompleteOverlay` |

---

## Task 1: HTML-Geruest — IDs, Lieferschein-Liste, S2-Overlay

**Files:**
- Modify: `index.html:101-106` (HUD)
- Modify: `index.html:141-156` (complete-overlay)
- Modify: `index.html:767-785` (Buerocomputer-Entity)

- [ ] **Schritt 1: HUD-Tag ID und Lieferschein-Div hinzufuegen**

  Finde (Zeile 101-106):
  ```html
    <div id="hud">
      <div class="hud-tag">&#9632; Tutorial &middot; Lern-Szenario 1</div>
      <div class="task" id="task-text">...</div>
      <div id="binary-display" ...></div>
      <div class="progress-row" id="progress-pips"></div>
    </div>
  ```
  Ersetze durch:
  ```html
    <div id="hud">
      <div class="hud-tag" id="hud-tag">&#9632; Lern-Szenario 1</div>
      <div class="task" id="task-text">Klicke ins Spiel, dann Fadenkreuz auf ein Paket richten und E druecken.</div>
      <div id="binary-display" style="display:none;font-size:10px;color:#88aacc;font-family:monospace;margin-top:5px;letter-spacing:0.4px;"></div>
      <div class="progress-row" id="progress-pips"></div>
      <div id="lieferschein-list"></div>
    </div>
  ```

- [ ] **Schritt 2: `#co-quality` in complete-overlay einfuegen**

  Finde (Zeile 146-149):
  ```html
      <div class="overlay-stats">
        <span><span class="stat-label">Punkte</span><span id="co-score">—</span></span>
        <span><span class="stat-label">Zeit</span><span id="co-time">—</span></span>
      </div>
  ```
  Ersetze durch:
  ```html
      <div class="overlay-stats">
        <span><span class="stat-label">Punkte</span><span id="co-score">—</span></span>
        <span><span class="stat-label">Zeit</span><span id="co-time">—</span></span>
      </div>
      <div id="co-quality" style="font-size:20px;font-weight:700;margin:4px 0 12px;"></div>
  ```

- [ ] **Schritt 3: S2-Complete-Overlay nach complete-overlay einfuegen**

  Finde das schliessende `</div>` nach `#complete-overlay` und `<script>` (Zeile 156-158):
  ```html
  </div>

  <script>
  ```
  Ersetze durch:
  ```html
  </div>

  <!-- Lern-Szenario 2: Abschluss -->
  <div id="s2-complete-overlay" class="hidden">
    <div class="overlay-box">
      <div class="overlay-tag">Lern-Szenario 2 &middot; Abgeschlossen</div>
      <div class="overlay-avatar">&#128225;</div>
      <div class="overlay-title">Neuuebertragung erfolgreich!</div>
      <div class="overlay-stats">
        <span><span class="stat-label">Gesamtpunkte</span><span id="s2-score">—</span></span>
        <span><span class="stat-label">Neugesendet</span><span id="s2-count">—</span></span>
      </div>
      <div class="overlay-body">
        Genau so funktioniert <strong>TCP</strong>: Fehlende Pakete werden vom Empfaenger erkannt und vom Sender erneut uebertragen &mdash; das nennt man <strong>Retransmission</strong>. Ohne diesen Mechanismus waere verlaessliche Kommunikation im Internet nicht moeglich.
      </div>
      <button id="s2-close-btn" class="overlay-btn">Abschliessen</button>
    </div>
  </div>

  <script>
  ```

- [ ] **Schritt 4: Buerocomputer-Entity mit IDs versehen**

  Finde (Zeile 767):
  ```html
      <a-entity position="-18 0 -6">
  ```
  Ersetze durch:
  ```html
      <a-entity id="office-computer-entity" position="-18 0 -6" computer-proximity>
  ```

  Finde (Zeile 775-777):
  ```html
        <a-plane material="color:#001428;emissive:#002244;emissiveIntensity:0.8;shader:flat" width="0.65" height="0.40" position="0 1.34 0.028"></a-plane>
        <a-text value="SZENARIO 2" color="#00ff88" scale="0.1 0.1 0.1" position="0 1.365 0.029" align="center" material="shader:flat;emissive:#00ff88;emissiveIntensity:0.4"></a-text>
        <a-text value="coming soon..." color="#336655" scale="0.065 0.065 0.065" position="0 1.315 0.029" align="center" material="shader:flat"></a-text>
  ```
  Ersetze durch:
  ```html
        <a-plane id="computer-screen" material="color:#001428;emissive:#002244;emissiveIntensity:0.8;shader:flat" width="0.65" height="0.40" position="0 1.34 0.028"></a-plane>
        <a-text id="computer-line1" value="SZENARIO 2" color="#00ff88" scale="0.1 0.1 0.1" position="0 1.365 0.029" align="center" material="shader:flat;emissive:#00ff88;emissiveIntensity:0.4"></a-text>
        <a-text id="computer-line2" value="coming soon..." color="#336655" scale="0.065 0.065 0.065" position="0 1.315 0.029" align="center" material="shader:flat"></a-text>
  ```

- [ ] **Schritt 5: Office-Glow-Entity zur A-Frame-Scene hinzufuegen**

  Finde direkt vor dem schliessenden `</a-scene>` Tag (Zeile 798):
  ```html
    </a-scene>
  ```
  Ersetze durch:
  ```html
    <!-- S2: Hinweisball ueber Bueroeingang -->
    <a-entity id="office-glow" position="-12 4.2 -6.5" visible="false">
      <a-sphere material="color:#00ff88;emissive:#00ff88;emissiveIntensity:1.5;shader:flat;opacity:0.7;transparent:true"
                radius="0.18"
                animation="property:position;from:0 0 0;to:0 0.4 0;dur:700;dir:alternate;loop:true;easing:easeInOutSine">
      </a-sphere>
      <a-text value="BUERO" color="#00ff88" scale="0.5 0.5 0.5" position="0 0.6 0" align="center"
              material="shader:flat;emissive:#00ff88;emissiveIntensity:0.8"></a-text>
    </a-entity>

  </a-scene>
  ```

- [ ] **Schritt 6: Browser-Test**

  Oeffne `index.html`. Pruefe: Intro-Overlay erscheint, Buerocomputer zeigt noch "SZENARIO 2 / coming soon..." (JS-Update folgt), keine JS-Fehler in der Konsole.

---

## Task 2: CSS — Lieferschein-Liste

**Files:**
- Modify: `index.html` — Ende des `style`-Blocks (vor `</style>`)

- [ ] **Schritt 1: Styles einfuegen**

  Finde das Ende des CSS-Blocks:
  ```css
    .stat-label { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #64a0ff; }
  </style>
  ```
  Ersetze durch:
  ```css
    .stat-label { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #64a0ff; }

    #lieferschein-list { margin-top: 10px; border-top: 1px solid rgba(100,160,255,0.15); padding-top: 8px; }
    .ls-row { display: flex; justify-content: space-between; align-items: center; font-size: 11px; padding: 2px 0; gap: 8px; }
    .ls-row.done { color: #50e0a0; text-decoration: line-through; opacity: 0.65; }
    .ls-row.active { color: #fff; font-weight: 600; }
    .ls-row.pending { color: rgba(200,216,240,0.45); }
    .ls-mark { font-size: 10px; flex-shrink: 0; }
  </style>
  ```

- [ ] **Schritt 2: Browser-Test**

  Seite neuladen — keine visuellen Aenderungen erwartet (Klassen noch nicht benutzt).

---

## Task 3: gameState-Machine einfuehren

**Files:**
- Modify: `index.html` — JS-Spiellogik (Zeile 849-851, 870-874, 1092-1098)

- [ ] **Schritt 1: `gameActive` durch `gameState` ersetzen**

  Finde (Zeile 849-851):
  ```js
    let selectedPaket = null;
    let score = 0;
    let gameActive = false;
  ```
  Ersetze durch:
  ```js
    let selectedPaket = null;
    let score = 0;
    let gameState = 'INTRO';
  ```

- [ ] **Schritt 2: Intro-Button-Handler aktualisieren**

  Finde (Zeile 870-874):
  ```js
    document.getElementById('intro-start-btn').addEventListener('click', () => {
      document.getElementById('intro-overlay').classList.add('hidden');
      gameActive = true;
      showNPCBriefing();
    });
  ```
  Ersetze durch:
  ```js
    document.getElementById('intro-start-btn').addEventListener('click', () => {
      document.getElementById('intro-overlay').classList.add('hidden');
      gameState = 'S1_ACTIVE';
      showNPCBriefing();
    });
  ```

- [ ] **Schritt 3: Keydown-Handler aktualisieren**

  Finde (Zeile 1092-1098):
  ```js
    document.addEventListener('keydown', (e) => {
      if (!gameActive) return;
      if (e.key !== 'e' && e.key !== 'E') return;
      if (!hoveredEl) return;
      if (hoveredEl.classList.contains('paket')) interactWithPaket(hoveredEl);
      else if (hoveredEl.classList.contains('palette-zone')) interactWithPalette(hoveredEl);
    });
  ```
  Ersetze durch:
  ```js
    document.addEventListener('keydown', (e) => {
      if (gameState !== 'S1_ACTIVE' && gameState !== 'S2_ACTIVE') return;
      if (e.key !== 'e' && e.key !== 'E') return;
      if (!hoveredEl) return;
      if (hoveredEl.classList.contains('paket')) interactWithPaket(hoveredEl);
      else if (hoveredEl.classList.contains('palette-zone')) interactWithPalette(hoveredEl);
    });
  ```

- [ ] **Schritt 4: Testen**

  Konsole nach Spielstart: `window.gameState` zeigt `'S1_ACTIVE'`. E-Taste auf Paketen funktioniert.

- [ ] **Schritt 5: Commit**
  ```bash
  git add index.html
  git commit -m "refactor: replace gameActive flag with gameState machine"
  ```

---

## Task 4: Lieferschein-HUD mit Strikethrough

**Files:**
- Modify: `index.html` — Funktion `updateLieferschein()` (Zeile 1109-1115)

- [ ] **Schritt 1: `updateLieferschein()` erweitern**

  Finde (Zeile 1109-1115):
  ```js
    function updateLieferschein() {
      const rows = lieferschein.map(e =>
        e.done ? '  Erledigt          ' : '      ' + e.id + '  ' + e.ip
      ).join('\n');
      const th = document.getElementById('ls-text-hand');
      if (th) th.setAttribute('value', 'MusterFirma GmbH\n14.01.2026\n\nID      IP\n' + rows);
    }
  ```
  Ersetze durch:
  ```js
    function updateLieferschein() {
      // 3D Clipboard (a-text, kein Strikethrough moeglich)
      const rows = lieferschein.map(e =>
        e.done ? 'v ' + e.id + ' erledigt' : '  ' + e.id + '  ' + e.ip
      ).join('\n');
      const th = document.getElementById('ls-text-hand');
      if (th) th.setAttribute('value', 'MusterFirma GmbH\n14.01.2026\n\nID      IP\n' + rows);

      // HTML-HUD mit Strikethrough (DOM-Methoden, kein innerHTML mit Nutzerdaten)
      renderLieferscheinList(lieferschein, 'lieferschein-list');
    }

    function renderLieferscheinList(entries, containerId) {
      const listEl = document.getElementById(containerId);
      if (!listEl) return;
      while (listEl.firstChild) listEl.removeChild(listEl.firstChild);
      const nextOpen = entries.findIndex(x => !x.done);
      entries.forEach((e, i) => {
        const row = document.createElement('div');
        row.className = 'ls-row ' + (e.done ? 'done' : i === nextOpen ? 'active' : 'pending');
        const label = document.createElement('span');
        label.textContent = e.id + '  ' + e.ip;
        const mark = document.createElement('span');
        mark.className = 'ls-mark';
        mark.textContent = e.done ? 'v' : i === nextOpen ? '<<' : '-';
        row.appendChild(label);
        row.appendChild(mark);
        listEl.appendChild(row);
      });
    }
  ```

- [ ] **Schritt 2: Testen**

  Paket korrekt liefern: Eintrag im HUD-Panel erscheint durchgestrichen und gruen. Naechstes Paket ist fett/weiss mit `<<`.

- [ ] **Schritt 3: Commit**
  ```bash
  git add index.html
  git commit -m "feat: add strikethrough delivery list to HUD"
  ```

---

## Task 5: Max-Feedback bei korrekter Lieferung

**Files:**
- Modify: `index.html` — JS vor `const paletteDeliveries` (Zeile 1001)

- [ ] **Schritt 1: `maxFeedback`-Array und `showMaxFeedback()` hinzufuegen**

  Finde (Zeile 1001):
  ```js
    const paletteDeliveries = { 'palette-1': 0, 'palette-2': 0, 'palette-3': 0 };
  ```
  Fuege davor ein:
  ```js
    const maxFeedbackMessages = [
      'Richtig! Die ersten Oktette verraten das Zielnetz — wie eine Postleitzahl.',
      'Gut! Das Netzwerk ergibt sich aus den fuehrenden Oktetten der IP-Adresse.',
      'Korrekt. Netz-ID und Host-Teil getrennt durch die Subnetzmaske.',
      'Perfekt erkannt! Die Subnetzmaske zeigt, welche Bits das Netz definieren.',
    ];
    let maxFeedbackIndex = 0;

    function showMaxFeedback(ip) {
      const msg = maxFeedbackMessages[maxFeedbackIndex % maxFeedbackMessages.length];
      maxFeedbackIndex++;
      const badge = document.getElementById('selected-badge');
      const task  = document.getElementById('task-text');
      badge.textContent = 'Max — Lagerlogistik';
      badge.classList.add('visible');
      task.style.color = '#50e0a0';
      task.textContent  = msg;
      setTimeout(() => {
        badge.classList.remove('visible');
        task.style.color = '#e8edf5';
        const offen = lieferschein.find(e => !e.done);
        if (offen) task.textContent = 'Naechstes Paket: ' + offen.id + ' (' + offen.ip + ') — richtige Palette waehlen.';
      }, 4000);
    }

    const paletteDeliveries = { 'palette-1': 0, 'palette-2': 0, 'palette-3': 0 };
  ```

- [ ] **Schritt 2: `showMaxFeedback()` in `interactWithPalette()` aufrufen**

  Finde im Korrekt-Block von `interactWithPalette()` (Zeile ca. 1064-1066):
  ```js
        playSoundCorrect();
        showFeedback('Richtig! Paket ' + paketId + ' korrekt zugestellt. +100', true);
        triggerFlash(true);
  ```
  Ersetze durch:
  ```js
        playSoundCorrect();
        triggerFlash(true);
        showMaxFeedback(paketIp);
  ```

- [ ] **Schritt 3: Testen**

  Paket korrekt liefern: Max-Badge erscheint mit einem Lehr-Satz. Nach 4 Sek. verschwindet das Badge und der naechste Auftrag erscheint.

- [ ] **Schritt 4: Commit**
  ```bash
  git add index.html
  git commit -m "feat: add Max teaching feedback on correct delivery"
  ```

---

## Task 6: S1-Abschluss — Qualitative Bewertung

**Files:**
- Modify: `index.html` — Funktion `showCompleteOverlay()` (Zeile 877-885)

- [ ] **Schritt 1: `showCompleteOverlay()` erweitern**

  Finde (Zeile 877-885):
  ```js
    function showCompleteOverlay() {
      playSoundComplete();
      document.exitPointerLock();
      const m = String(Math.floor(timerSeconds/60)).padStart(2,'0');
      const s = String(timerSeconds%60).padStart(2,'0');
      document.getElementById('co-score').textContent = score;
      document.getElementById('co-time').textContent  = m + ':' + s;
      document.getElementById('complete-overlay').classList.remove('hidden');
    }
  ```
  Ersetze durch:
  ```js
    function showCompleteOverlay() {
      playSoundComplete();
      document.exitPointerLock();
      gameState = 'S1_COMPLETE';
      const m = String(Math.floor(timerSeconds/60)).padStart(2,'0');
      const s = String(timerSeconds%60).padStart(2,'0');
      document.getElementById('co-score').textContent = score;
      document.getElementById('co-time').textContent  = m + ':' + s;

      const maxPossible = lieferschein.length * 100;
      const pct = score / maxPossible;
      const qualEl = document.getElementById('co-quality');
      if (pct >= 1.0) {
        qualEl.style.color = '#ffd700';
        qualEl.textContent = 'Perfekt — Alle IP-Netzwerke auf Anhieb erkannt!';
      } else if (pct >= 0.7) {
        qualEl.style.color = '#50e0a0';
        qualEl.textContent = 'Sehr gut — Fast fehlerfrei. Weiter so!';
      } else if (pct >= 0.4) {
        qualEl.style.color = '#64a0ff';
        qualEl.textContent = 'Gut — IP-Grundlagen sitzen, weiter ueben.';
      } else {
        qualEl.style.color = '#aaa';
        qualEl.textContent = 'Weiter ueben — Schau dir die Netzklassen nochmal an.';
      }

      document.getElementById('complete-overlay').classList.remove('hidden');
    }
  ```

- [ ] **Schritt 2: Testen**

  S1 ohne Fehler abschliessen: "Perfekt" in Gold. Nochmal mit mind. einem Fehler: andere Kategorie.

- [ ] **Schritt 3: Commit**
  ```bash
  git add index.html
  git commit -m "feat: add qualitative score rating to S1 complete screen"
  ```

---

## Task 7: S1 -> S2 Uebergang

**Files:**
- Modify: `index.html` — complete-btn handler (Zeile 886-892)

- [ ] **Schritt 1: complete-btn handler + `showS2Transition()` ersetzen**

  Finde (Zeile 886-892):
  ```js
    document.getElementById('complete-btn').addEventListener('click', () => {
      document.getElementById('complete-overlay').classList.add('hidden');
      document.getElementById('task-text').textContent = 'Szenario 2 folgt — geh zum Buero und schau auf den Computer.';
      document.getElementById('task-text').style.color = '#64a0ff';
      const canvas = document.querySelector('a-scene canvas');
      if (canvas) canvas.requestPointerLock();
    });
  ```
  Ersetze durch:
  ```js
    document.getElementById('complete-btn').addEventListener('click', () => {
      document.getElementById('complete-overlay').classList.add('hidden');
      showS2Transition();
      const canvas = document.querySelector('a-scene canvas');
      if (canvas) canvas.requestPointerLock();
    });

    function showS2Transition() {
      gameState = 'S2_BRIEFING';

      const hudTag = document.getElementById('hud-tag');
      if (hudTag) hudTag.textContent = 'Lern-Szenario 2 — Paketverlust';

      const badge = document.getElementById('selected-badge');
      const task  = document.getElementById('task-text');
      badge.textContent = 'Max — Lagerlogistik';
      badge.classList.add('visible');
      task.style.color = '#ffcc40';
      task.textContent  = 'Warte! Der Empfaenger meldet ein Problem — geh ins Buero und schau auf den Computer!';

      setTimeout(() => {
        badge.classList.remove('visible');
        task.style.color = '#e8edf5';
        task.textContent  = 'Geh ins Buero (links) und tritt an den Computer heran.';
      }, 7000);

      // Computer-Screen rot blinken
      const screen = document.getElementById('computer-screen');
      if (screen) {
        screen.setAttribute('material', 'color:#200000;emissive:#cc0000;emissiveIntensity:0.9;shader:flat');
        screen.setAttribute('animation__blink',
          'property:material.emissiveIntensity;from:0.9;to:0.2;dur:600;dir:alternate;loop:true;easing:easeInOutSine');
      }

      // Office-Glow einblenden
      const glow = document.getElementById('office-glow');
      if (glow) glow.setAttribute('visible', 'true');

      // Lieferschein-Liste leeren (S2 hat eigene Pakete)
      const listEl = document.getElementById('lieferschein-list');
      if (listEl) while (listEl.firstChild) listEl.removeChild(listEl.firstChild);
    }
  ```

- [ ] **Schritt 2: Testen**

  S1 abschliessen -> "Weiter zu Szenario 2" klicken:
  - HUD-Tag zeigt "Lern-Szenario 2 — Paketverlust"
  - Max-Badge mit Warnmeldung
  - Buerocomputer-Screen blinkt rot (in 3D-Szene sichtbar)
  - Gruener Glow-Ball ueber Bueroeingang

- [ ] **Schritt 3: Commit**
  ```bash
  git add index.html
  git commit -m "feat: add S1-to-S2 transition with Max guidance and computer pulse"
  ```

---

## Task 8: `computer-proximity` A-Frame Komponente

**Files:**
- Modify: `index.html` — nach dem schliessenden `});` von `proximity-dialog` (Zeile 176)

- [ ] **Schritt 1: Neue Komponente einfuegen**

  Finde (Zeile 176-178):
  ```js
      }
    });

    AFRAME.registerComponent('collision-walls', {
  ```
  Fuege zwischen `});` und `AFRAME.registerComponent('collision-walls'` ein:
  ```js
    AFRAME.registerComponent('computer-proximity', {
      init() {
        this._cp = new AFRAME.THREE.Vector3();
        this._np = new AFRAME.THREE.Vector3();
        this.triggered = false;
      },
      tick() {
        if (this.triggered) return;
        if (typeof gameState === 'undefined' || gameState !== 'S2_BRIEFING') return;
        const cam = this.el.sceneEl.camera;
        if (!cam) return;
        cam.getWorldPosition(this._cp);
        this.el.object3D.getWorldPosition(this._np);
        if (this._cp.distanceTo(this._np) < 3.5) {
          this.triggered = true;
          startS2();
        }
      }
    });
  ```

- [ ] **Schritt 2: Testen**

  S2-Uebergang ausloesen und ins Buero gehen. Konsole zeigt `startS2 is not defined` — erwartet (wird in Task 9 implementiert). Kein anderer Fehler.

---

## Task 9: S2-Init — Paketverlust-Logik und Computer-Screen

**Files:**
- Modify: `index.html` — JS nach `showS2Transition()`, vor dem `a-scene`-loaded-Listener

- [ ] **Schritt 1: S2-Variablen und Funktionen einfuegen**

  Fuege direkt nach `showS2Transition()` ein:
  ```js
    let s2LostPackets = [];
    let s2Score = 0;

    function initS2() {
      const delivered = lieferschein.filter(p => p.done);
      const lostCount = Math.min(2, delivered.length);
      const shuffled = delivered.slice().sort(() => Math.random() - 0.5);
      s2LostPackets = shuffled.slice(0, lostCount).map(p => ({
        id: p.id, ip: p.ip, network: p.network, done: false
      }));
    }

    function renderComputerScreen() {
      const line1El = document.getElementById('computer-line1');
      const line2El = document.getElementById('computer-line2');
      const screen  = document.getElementById('computer-screen');

      if (screen) {
        screen.removeAttribute('animation__blink');
        screen.setAttribute('material', 'color:#001428;emissive:#002244;emissiveIntensity:0.8;shader:flat');
      }
      if (line2El) line2El.setAttribute('visible', 'false');

      if (line1El) {
        const lostIds = s2LostPackets.map(p => p.id);
        const lines = ['FEHLERMELDUNG EMPFAENGER', '─────────────────'];
        lieferschein.forEach(p => {
          if (lostIds.includes(p.id)) {
            lines.push('!!! ' + p.id + ' VERLOREN');
          } else {
            lines.push('OK  ' + p.id + '  ' + p.ip);
          }
        });
        lines.push('─────────────────');
        lines.push('Pakete in Regal B.');
        lines.push('[E = Schliessen]');
        line1El.setAttribute('value', lines.join('\n'));
        line1El.setAttribute('color', '#00ff88');
        line1El.setAttribute('scale', '0.045 0.045 0.045');
        line1El.setAttribute('position', '0 1.43 0.029');
        line1El.setAttribute('wrap-count', '22');
      }
    }

    function startS2() {
      initS2();
      renderComputerScreen();
      gameState = 'S2_ACTIVE';

      const glow = document.getElementById('office-glow');
      if (glow) glow.setAttribute('visible', 'false');

      renderLieferscheinList(s2LostPackets, 'lieferschein-list');

      spawnS2Packages();

      const task = document.getElementById('task-text');
      task.style.color = '#ffcc40';
      task.textContent = s2LostPackets.length + ' Paket(e) verloren! Hole sie aus Regal B (oben) und liefere erneut.';
    }
  ```

- [ ] **Schritt 2: Testen**

  S2-Uebergang und ins Buero gehen. Erwartung:
  - Computer-Screen zeigt dynamische Fehlerliste mit den verlorenen Paketen
  - `gameState` ist `'S2_ACTIVE'`
  - HUD-Lieferschein zeigt die verlorenen Pakete
  - Konsole: `spawnS2Packages is not defined` erwartet (folgt Task 10)

- [ ] **Schritt 3: Commit**
  ```bash
  git add index.html
  git commit -m "feat: implement S2 init and computer screen rendering"
  ```

---

## Task 10: S2-Pakete in Regal B spawnen

**Files:**
- Modify: `index.html` — JS nach `startS2()`

- [ ] **Schritt 1: `spawnS2Packages()` einfuegen**

  Fuege direkt nach `startS2()` ein:
  ```js
    const s2SlotPositions = [
      [7.5, 3.62, -7.2],
      [8.8, 3.62, -9.8],
    ];

    function spawnS2Packages() {
      const scene = document.querySelector('a-scene');
      s2LostPackets.forEach((entry, i) => {
        const [x, y, z] = s2SlotPositions[i] || [8.0, 3.62, -8.5];

        const el = document.createElement('a-entity');
        el.setAttribute('class', 'interactable paket s2-paket');
        el.setAttribute('id', 's2-paket-' + entry.id);
        el.setAttribute('data-ip', entry.ip);
        el.setAttribute('data-id', entry.id);
        el.setAttribute('data-s2', 'true');
        el.setAttribute('position', x + ' ' + y + ' ' + z);
        el.setAttribute('geometry', 'primitive:box;width:0.58;height:0.48;depth:0.48');
        el.setAttribute('material', 'color:#c8a060;roughness:0.9;emissive:#ffaa00;emissiveIntensity:0.4');
        el.setAttribute('shadow', 'cast:true;receive:true');

        const labelWrapper = document.createElement('a-entity');
        labelWrapper.setAttribute('look-at', '[camera]');
        labelWrapper.setAttribute('position', '0 0.30 0');

        const bg = document.createElement('a-plane');
        bg.setAttribute('material', 'color:#0a1828;opacity:0.9;shader:flat;side:double');
        bg.setAttribute('width', '0.58');
        bg.setAttribute('height', '0.14');

        const txt = document.createElement('a-text');
        txt.setAttribute('value', entry.ip);
        txt.setAttribute('color', '#ffcc40');
        txt.setAttribute('scale', '0.65 0.65 0.65');
        txt.setAttribute('align', 'center');
        txt.setAttribute('position', '0 0 0.002');
        txt.setAttribute('material', 'shader:flat');

        labelWrapper.appendChild(bg);
        labelWrapper.appendChild(txt);
        el.appendChild(labelWrapper);

        const tape = document.createElement('a-box');
        tape.setAttribute('material', 'color:#ff8800;roughness:0.8');
        tape.setAttribute('position', '0 0.245 0');
        tape.setAttribute('width', '0.62');
        tape.setAttribute('height', '0.03');
        tape.setAttribute('depth', '0.1');
        el.appendChild(tape);

        scene.appendChild(el);

        el.addEventListener('mouseenter', () => {
          hoveredEl = el;
          if (el !== selectedPaket) {
            el.setAttribute('material', 'emissive', '#8b6a20');
            el.setAttribute('material', 'emissiveIntensity', '0.35');
          }
        });
        el.addEventListener('mouseleave', () => {
          if (hoveredEl === el) hoveredEl = null;
          if (el !== selectedPaket) {
            el.setAttribute('material', 'emissive', '#ffaa00');
            el.setAttribute('material', 'emissiveIntensity', '0.4');
          }
        });
      });
    }
  ```

- [ ] **Schritt 2: Testen**

  S2 starten und zu Regal B (rechts, oben) gehen. 1-2 neue Pakete mit orangem Klebeband und gelber IP muessen sichtbar sein. E-Taste waehlt sie aus (Badge erscheint).

- [ ] **Schritt 3: Commit**
  ```bash
  git add index.html
  git commit -m "feat: spawn S2 retransmission packages in shelf B"
  ```

---

## Task 11: S2-Lieferung und Abschluss

**Files:**
- Modify: `index.html` — `interactWithPalette()`, neue Funktionen `updateS2Lieferschein()` und `showS2CompleteOverlay()`

- [ ] **Schritt 1: `interactWithPalette()` Korrekt-Block fuer S2 erweitern**

  Finde im Korrekt-Block von `interactWithPalette()` (ab Zeile ca. 1049):
  ```js
        const e = lieferschein.find(x => x.id===paketId && !x.done);
        if (e) e.done = true;
        const pos = selectedPaket.getAttribute('position');
        selectedPaket.setAttribute('animation__up',
          'property:position;to:'+pos.x+' '+(pos.y+1.3)+' '+pos.z+';dur:380;easing:easeInQuad');
        const pEl = selectedPaket;
        setTimeout(() => pEl.setAttribute('visible', false), 400);
        score += 100;
        selectedPaket.setAttribute('material','emissive','#000000');
        selectedPaket = null;
        document.getElementById('selected-badge').classList.remove('visible');
        document.getElementById('binary-display').style.display = 'none';
        document.getElementById('score-pill').textContent = '★ ' + score + ' Punkte';
        updateLieferschein(); updatePips();
        spawnDeliveredBox(palId, paketIp);
        checkPaletteComplete(palId);
        playSoundCorrect();
        triggerFlash(true);
        showMaxFeedback(paketIp);
        if (lieferschein.every(x=>x.done)) {
          stopTimer();
          setTimeout(showCompleteOverlay, 1600);
        }
  ```
  Ersetze durch:
  ```js
        const isS2 = selectedPaket.getAttribute('data-s2') === 'true';

        if (!isS2) {
          const e = lieferschein.find(x => x.id===paketId && !x.done);
          if (e) e.done = true;
          score += 100;
        } else {
          const s2e = s2LostPackets.find(x => x.id===paketId && !x.done);
          if (s2e) s2e.done = true;
          s2Score += 50;
        }

        const pos = selectedPaket.getAttribute('position');
        selectedPaket.setAttribute('animation__up',
          'property:position;to:'+pos.x+' '+(pos.y+1.3)+' '+pos.z+';dur:380;easing:easeInQuad');
        const pEl = selectedPaket;
        setTimeout(() => pEl.setAttribute('visible', false), 400);
        selectedPaket.setAttribute('material','emissive','#000000');
        selectedPaket = null;
        document.getElementById('selected-badge').classList.remove('visible');
        document.getElementById('binary-display').style.display = 'none';
        document.getElementById('score-pill').textContent = '★ ' + (score + s2Score) + ' Punkte';

        spawnDeliveredBox(palId, paketIp);
        playSoundCorrect();
        triggerFlash(true);
        showMaxFeedback(paketIp);

        if (!isS2) {
          updateLieferschein(); updatePips();
          checkPaletteComplete(palId);
          if (lieferschein.every(x=>x.done)) {
            stopTimer();
            setTimeout(showCompleteOverlay, 1600);
          }
        } else {
          updateS2Lieferschein();
          if (s2LostPackets.every(x=>x.done)) {
            setTimeout(showS2CompleteOverlay, 1600);
          }
        }
  ```

- [ ] **Schritt 2: Falsch-Block fuer S2-Score anpassen**

  Finde im Falsch-Block von `interactWithPalette()`:
  ```js
        score = Math.max(0, score-20);
        document.getElementById('score-pill').textContent = '★ ' + score + ' Punkte';
  ```
  Ersetze durch:
  ```js
        if (selectedPaket && selectedPaket.getAttribute('data-s2') === 'true') {
          s2Score = Math.max(0, s2Score - 10);
        } else {
          score = Math.max(0, score - 20);
        }
        document.getElementById('score-pill').textContent = '★ ' + (score + s2Score) + ' Punkte';
  ```

- [ ] **Schritt 3: `updateS2Lieferschein()` einfuegen**

  Fuege direkt nach `updateLieferschein()` ein:
  ```js
    function updateS2Lieferschein() {
      renderLieferscheinList(s2LostPackets, 'lieferschein-list');
    }
  ```

- [ ] **Schritt 4: `showS2CompleteOverlay()` und s2-close-btn handler einfuegen**

  Fuege direkt nach `showCompleteOverlay()` ein:
  ```js
    function showS2CompleteOverlay() {
      playSoundComplete();
      document.exitPointerLock();
      gameState = 'S2_COMPLETE';
      document.getElementById('s2-score').textContent = score + s2Score;
      document.getElementById('s2-count').textContent = s2LostPackets.length + ' / ' + s2LostPackets.length;
      document.getElementById('s2-complete-overlay').classList.remove('hidden');
    }

    document.getElementById('s2-close-btn').addEventListener('click', () => {
      document.getElementById('s2-complete-overlay').classList.add('hidden');
      const task = document.getElementById('task-text');
      task.style.color = '#64a0ff';
      task.textContent = 'Beide Szenarien abgeschlossen! Du hast TCP/IP-Grundlagen erlebt.';
    });
  ```

- [ ] **Schritt 5: Vollstaendigen Spielfluss testen**

  1. Spiel starten, alle 5 S1-Pakete liefern (inkl. min. 1 Fehler testen)
  2. S1-Abschluss zeigt Score, Zeit, Qualitaetsbewertung
  3. "Weiter zu Szenario 2": Max-Meldung, Computer blinkt rot, Glow ueber Buero
  4. Ins Buero gehen: Computer zeigt Fehlerliste, gameState = S2_ACTIVE
  5. Regal B oben: 1-2 neue Pakete mit orangem Band sichtbar
  6. Paket aufnehmen und korrekt liefern: S2-Lieferschein hakt ab
  7. Alle S2-Pakete geliefert: S2-Abschluss-Overlay mit TCP-Erklaerung
  8. Falsches Palette bei S2: -10 Punkte, kein Abschluss

- [ ] **Schritt 6: Commit**
  ```bash
  git add index.html
  git commit -m "feat: implement S2 delivery, completion overlay and full game flow"
  ```

---

## Verifikation (End-to-End)

Oeffne `index.html` direkt im Browser (kein Server noetig — alles in einer Datei):

| Test | Erwartetes Ergebnis |
|---|---|
| S1: Paket richtig liefern | HUD-Eintrag durchgestrichen + gruen, Max-Satz erscheint |
| S1: Paket falsch liefern | -20 Punkte, roter Flash |
| S1 abschliessen (100%) | Qualitaet: "Perfekt" in Gold |
| S1 abschliessen (mit Fehlern) | Qualitaet: passende Kategorie |
| "Weiter zu S2" | Max-Badge + Computer blinkt rot + Glow ueber Buero |
| Zum Computer gehen | Fehlermeldung mit verlorenen Paketen, S2 startet |
| S2-Paket in Regal B | Oranges Klebeband, gelbe IP-Schrift |
| S2-Paket richtig liefern | Eintrag in S2-Lieferschein abgehakt |
| S2-Paket falsch liefern | -10 Punkte, roter Flash |
| Alle S2-Pakete geliefert | S2-Abschluss mit TCP-Erklaerung |
