# P2 S2 — Transportzone: Protokolle den Schichten zuordnen

**Datum:** 2026-06-16  
**Status:** Approved  
**Lernziel:** LZ5 — Typische Protokolle den jeweiligen TCP/IP-Schichten zuordnen

---

## Übersicht

Szenario P2 S2 ist das zweite neue Lern-Szenario im P2-Curriculum. Es folgt direkt auf P2 S1 (Schichten-Karten) und tritt vor dem bisherigen `S1_ACTIVE`-Lernpfad (IP-Sortierung). Der Lernende ordnet 7 Protokollkarten per Drag & Drop den vier TCP/IP-Schichten zu, und beantwortet danach eine Quiz-Frage zu TCP vs. UDP.

---

## Ablauf (State-Flow)

```
P2_S1_ACTIVE → [P2S1.init onComplete] → P2_S2_ACTIVE
P2_S2_ACTIVE → [P2S2.init onComplete] → S1_ACTIVE (bisheriger Lernpfad)
```

`game.js` ändert in der `P2S1.init`-Callback nur die neue `gameState`-Zuweisung: statt sofort in `S1_ACTIVE` zu gehen, wird `P2S2.init()` aufgerufen.

---

## Modul: `js/scenarios/p2-s2-protocols.js`

Muster identisch zu `p2-s1-layers.js`: IIFE, exportiert `{ init(onComplete), teardown(), getScore() }`.

### Protokoll-Daten (7 Karten)

| Protokoll | Schicht | Farbe (aus S1) |
|---|---|---|
| HTTP | Anwendung (4) | `#50e0a0` (grün) |
| FTP | Anwendung (4) | `#50e0a0` |
| TCP | Transport (3) | `#64a0ff` (blau) |
| UDP | Transport (3) | `#64a0ff` |
| IP | Internet (2) | `#f5c518` (gelb) |
| ARP | Internet (2) | `#f5c518` |
| Ethernet | Netzzugang (1) | `#ff7850` (orange) |

### Phase 1 — Drag & Drop

**Layout:** Zweispaltig innerhalb von `.overlay-box`
- **Linke Spalte (`.p2s2-card-bank`):** 7 Protokollkarten (`.p2s2-proto-card`), `draggable="true"`, vertikal gestapelt
- **Rechte Spalte (`.p2s2-drop-col`):** 4 Drop-Zonen (`.p2s2-drop-zone`), farbcodiert wie S1

**Drag-Interaktion:**
- `dragstart`: Speichert `protocolId` im `dataTransfer`
- `dragover`: Verhindert Default (erlaubt Drop)
- `drop`: Prüft ob `protocolId` zur `layerId` der Zone passt
  - Korrekt: Karte rastet in Zone ein (`.placed`), Protokoll-Label bleibt sichtbar; Karte aus Bank entfernen
  - Falsch: Kurzes rotes Flash auf der Zone (`.p2s2-drop-zone.shake`), Karte bleibt in Bank
- Sobald alle 7 korrekt platziert: "Zum Quiz →"-Button erscheint

**Score Drag-Phase:** Kein Punktabzug bei Fehlversuchen. 50 Punkte nach vollständiger Platzierung aller 7 Karten (unabhängig von der Anzahl Fehlversuche).

**Re-Drag:** Einmal korrekt platzierte Karten sind nicht mehr verschiebbar (kein Re-Drag zurück in die Bank).

### Phase 2 — Quiz

Eine Multiple-Choice-Frage (identisches Markup/Klassen-Muster wie `p2s1-quiz`):

> **Frage:** Was ist der Hauptunterschied zwischen TCP und UDP auf der Transportschicht?

| Option | Korrekt |
|---|---|
| TCP ist verbindungslos und schneller, UDP garantiert die Reihenfolge | ✗ |
| TCP garantiert die Zustellung und Reihenfolge, UDP ist schneller aber unzuverlässig | ✓ |
| TCP arbeitet auf der Internetschicht, UDP auf der Anwendungsschicht | ✗ |
| Beide Protokolle garantieren die Zustellung, unterscheiden sich nur in der Geschwindigkeit | ✗ |

- Korrekte Antwort: +30 Punkte
- Falsche Antwort: 0 Punkte (richtige Antwort wird markiert + Feedback-Text)
- **Gesamt-Maximum:** 80 Punkte

---

## HTML (`index.html`)

Neues Overlay `#p2-s2-overlay` nach `#p2-s1-overlay` einfügen:

```html
<div id="p2-s2-overlay" class="hidden">
  <div class="overlay-box">
    <div class="overlay-tag">Lern-Szenario 2 · Protokoll-Zuordnung</div>
    <div class="overlay-title">Protokolle auf die Schichten verteilen</div>
    <p class="overlay-body" id="p2s2-intro-text">
      Ziehe jedes Protokoll auf die richtige TCP/IP-Schicht.
    </p>
    <!-- Phase 1: Drag & Drop -->
    <div id="p2s2-dnd" class="p2s2-dnd-layout">
      <div id="p2s2-card-bank" class="p2s2-card-bank"></div>
      <div id="p2s2-drop-col" class="p2s2-drop-col"></div>
    </div>
    <button id="p2s2-quiz-btn" class="overlay-btn hidden">Zum Quiz →</button>
    <!-- Phase 2: Quiz -->
    <div id="p2s2-quiz" class="hidden">
      <div id="p2s2-question" class="p2s1-question"></div><!-- Text per JS: "Was ist der Hauptunterschied zwischen TCP und UDP..." -->
      <div id="p2s2-options" class="p2s1-options"></div>
      <div id="p2s2-feedback" class="p2s1-feedback hidden"></div>
    </div>
    <button id="p2s2-next-btn" class="overlay-btn hidden">Weiter zur Lagerhalle →</button>
  </div>
</div>
```

`<script src="js/scenarios/p2-s2-protocols.js?v=1"></script>` vor `game.js` einfügen.

---

## CSS (`css/style.css`)

### Overlay registrieren (zwei Stellen)

**Stelle 1 (~Zeile 67):** `#p2-s2-overlay` zur `position: fixed; display: flex`-Regel hinzufügen  
**Stelle 2 (~Zeile 78):** `#p2-s2-overlay.hidden` zur `display: none`-Regel hinzufügen

### Neue Klassen (Namespace `.p2s2-*`)

```css
/* Layout */
.p2s2-dnd-layout { display: flex; gap: 14px; margin: 0 0 16px; }
.p2s2-card-bank  { display: flex; flex-direction: column; gap: 7px; width: 130px; flex-shrink: 0; }
.p2s2-drop-col   { display: flex; flex-direction: column; gap: 8px; flex: 1; }

/* Protokollkarten (Drag-Quellen) */
.p2s2-proto-card { ... draggable styling, cursor: grab, dark bg, border ... }
.p2s2-proto-card.dragging { opacity: 0.4; }

/* Drop-Zonen */
.p2s2-drop-zone  { ... border-radius, min-height, border dashed, farblich ... }
.p2s2-drop-zone.dragover { ... highlight ... }
.p2s2-drop-zone.shake { animation: p2s2-shake 0.3s; }
.p2s2-drop-zone .p2s2-placed-chip { ... kleine eingecheckte Karte ... }

/* Quiz: bestehende .p2s1-* Klassen werden wiederverwendet */
```

---

## `game.js` Änderung (minimal)

In der `P2S1.init()`-Callback (aktuell ~Zeile 342) statt direkt `S1_ACTIVE` zu setzen:

```js
P2S1.init(() => {
  gameState = 'P2_S2_ACTIVE';
  document.getElementById('hud-tag').textContent = '■ P2 · S2 — Protokolle';
  P2S2.init((s2score) => {
    gameState = 'S1_ACTIVE';
    // ... restlicher bisheriger Code (hud-tag, lieferschein, pointerLock, showNPCBriefing)
  });
});
```

---

## Tests (`tests/ui.spec.js`)

Neue Testgruppe `P2 S2`:
1. Overlay erscheint nach Abschluss von S1 (mock `P2S1.init` onComplete)
2. Protokollkarte `HTTP` ist `draggable`
3. Drop auf falsche Zone: Karte bleibt in der Bank
4. Drop auf korrekte Zone: Karte rastet ein
5. Quiz-Button erscheint wenn alle 7 korrekt platziert
6. Korrekte Quiz-Antwort: Feedback "Richtig" + `p2s2-next-btn` sichtbar
7. `p2s2-next-btn` versteckt das Overlay

---

## Nicht im Scope

- Mobilgeräte-Touch-Drag (nur Desktop-HTML5-DnD)
- Hint-System / Lösungsanzeige auf Anfrage
- Animiertes "Förderband" (kommt in S3)
- Persistenz des Scores außerhalb der Session
