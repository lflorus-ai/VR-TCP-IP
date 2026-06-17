# VR-TCP/IP — Projektkontext

## Hinweis zur Gültigkeit von Skills

Alle Skills, Berechtigungen und Anweisungen, die Claude in diesem Projekt erteilt werden, gelten **ausschließlich für dieses Projekt** und sind nicht auf andere Projekte oder Repositories übertragbar.

## Was ist das?

Ein browserbasiertes 3D-Lernspiel, das TCP/IP-Netzwerkkonzepte durch eine interaktive Lagerhallen-Metapher vermittelt. Entstanden als Seminararbeit (Integrationsseminar, Gruppe 08, DHBW Stuttgart WWI2023G).

Die Anwendung befindet sich in einer **aktiven Weiterentwicklungsphase**: Der ursprüngliche Lernpfad (IP-Adresssortierung) wird durch ein vollständiges 6-Szenarien-Curriculum (P2, Konzept: Nadine) ersetzt bzw. erweitert, das das gesamte TCP/IP-Schichtenmodell abdeckt.

## Quick Start / Kommandos

```bash
npm run serve      # Dev-Server auf http://localhost:8080 starten
npm test           # Playwright-Tests headless ausführen
npm run test:ui    # Playwright-Tests mit UI-Modus (interaktiv)
```

Tests liegen in `tests/ui.spec.js` (Playwright). Der `webServer` in `playwright.config.js` startet automatisch `serve` vor den Tests.

## Technologie-Stack

| Komponente | Details |
|---|---|
| Renderer | A-Frame 1.7.1 (WebVR/WebXR) |
| Sprache | Vanilla HTML/CSS/JavaScript (kein Build-Tool, kein Framework) |
| 3D-Assets | `.glb`-Modelle (LKW, Gabelstapler, Lagerregale) |
| Einstiegspunkt | `index.html` — HTML-Struktur |
| Spiellogik | `js/game.js` — State-Machine + gesamte Game-Logik |
| Komponenten | `js/components.js` — A-Frame-Custom-Komponenten |
| Styles | `css/style.css` — alle CSS-Definitionen |
| Szenario-Module | `js/scenarios/` — je ein Modul pro P2-Szenario |

## Lernpfad-Struktur (Zielzustand P2)

Das neue Curriculum (6 Szenarien, Gesamtdauer ~22 Min) deckt alle 5 Lernziele ab:

| ID | Typ | Titel | Dauer | Lernziele | Status |
|---|---|---|---|---|---|
| **S0** | Steuer | Die Logistikhalle | 1–2 Min | Orientierung + Aktivierung | ✅ fertig — SVG-Hallenplan + 5 Lernziele im `#tutorial-start-overlay` |
| **P2 S1** | Lern | Vier Bereiche, vier Schichten: Das TCP/IP-Modell | 5 Min | LZ1: Architektur TCP/IP-Modell | ✅ fertig — Tafel-Klick in Halle → Overlay-Quiz (`js/scenarios/p2-s1-schichten.js`), State: `ZONE_S1` |
| **P2 S2** | Lern | Transportzone: Protokolle der Transportschicht | 5 Min | LZ5: Protokolle den Schichten zuordnen | ✅ fertig — Tafel-Klick in Halle → Overlay-Quiz (`js/scenarios/p2-s2-protokolle.js`), State: `ZONE_S2` |
| **P2 S3** | Lern | Transport-Flügel: TCP/UDP in der Lagerhalle | 5 Min | LZ5: TCP vs. UDP unterscheiden | ✅ fertig — 3D-Raum, Pakete schweben vor Spieler, auf TCP/UDP-Band ablegen (`js/scenarios/p2-s3-transport.js`), State: `ZONE_S3` |
| **P2 S4** | Lern | Anwendungs-Flügel: HTTP/DNS/FTP/SMTP-Briefkästen | 5 Min | LZ3+LZ4: IP-Adressen + OSI-Mapping | ✅ fertig — 3D-Raum, Pakete in Protokoll-Briefkasten tragen + Quiz-Terminal (`js/scenarios/p2-s4-anwendung.js`), State: `ZONE_S4` |
| **P2 S5** | Lern | Paket auf Reise: Routing durch Router | 6 Min | LZ2+LZ3: Routing + Paketverlauf | **in Arbeit** — 3D-Raum im Büro-Flügel (x<-12.5), State: `ZONE_S5` (`js/scenarios/p2-s5-routing.js`) |

**Lernziele (LZ):**
- LZ1: Grundlegende Architektur des TCP/IP-Modells verstehen
- LZ2: Weg eines Datenpakets durch ein Netzwerk nachvollziehen
- LZ3: Rolle von Routern und IP-Adressen bei der Weiterleitung
- LZ4: Internet-Schicht (TCP/IP) ↔ OSI-Netzwerkschicht (Layer 3) zuordnen
- LZ5: Typische Protokolle den jeweiligen TCP/IP-Schichten zuordnen

## Bestehende Spielmechanik (S0–S3 alt, bleibt als Basis)

Der aktuell implementierte Lernpfad deckt IP-Adresssortierung ab und bleibt im Code erhalten, bis P2 vollständig implementiert ist:

1. Spieler startet in einem Lagerhaus mit Regal A (links) und Regal B (rechts)
2. Pakete tragen IP-Adressen (`192.168.1.x`, `10.0.0.x`, `172.16.5.x`)
3. `E`-Taste: Paket aus dem Regal aufnehmen → Palette anvisieren → erneut `E`
4. Jede Palette entspricht einem Zielnetz (LKW 1/2/3)
5. Richtig → +100 Punkte, Falsch → −20 Punkte + Feedback
6. Timer läuft ab erstem Paket-Pick; Abschluss-Overlay nach Zustellung aller Pakete

## Neue Interaktionsmuster (P2)

| Szenario | Interaktionstyp | Technischer Ansatz |
|---|---|---|
| P2 S0 Update | Hallenplan-Klick + Lernziele-Overlay | Overlay erweitern, SVG-Karte |
| P2 S1 | Tafel anschauen + E → Schichten-Quiz | Overlay-Panel, `s1-info-board`-Klasse, `enterZoneS1()` |
| P2 S2 | Tafel anschauen + E → Protokoll-Quiz | Overlay-Panel, `s2-info-board`-Klasse, `enterZoneS2()` |
| P2 S3 | Paket aufnehmen (E) → schwebt vor Spieler → auf TCP/UDP-Band ablegen (E) | `class="interactable paket-l3"` / `belt-zone`; RAF-Loop für Floating; 3D-Raum Transport-Flügel (x≥0, z<-16.5) |
| P2 S4 | Paket in Protokoll-Briefkasten tragen (E) + Quiz-Terminal | `class="interactable paket-l4"` / `inbox-zone`; 3D-Raum Anwendungs-Flügel (x<0, z<-16.5) |
| P2 S5 | Router-Routing-Entscheidung | 3D-Raum im Büro-Flügel (x<-12.5); State: `ZONE_S5` |

## State Machine (aktueller Zustand)

```
INTRO
  → TUTORIAL          (S0: Steuerung — bestehend)
  → S1_ACTIVE         (Basis-State zwischen Szenarien)
  → ZONE_S1           (Tafel-Quiz: TCP/IP-Schichten — p2-s1-schichten.js)
                       Trigger: E an s1-info-board, _zoneDone.s1 === false
  → ZONE_S2           (Tafel-Quiz: Protokolle — p2-s2-protokolle.js)
                       Trigger: E an s2-info-board, _zoneDone.s2 === false, _zoneDone.s1 === true
  → ZONE_S3           (Transport-Flügel: TCP/UDP — p2-s3-transport.js)
                       Trigger: pos.z < -16.5 && pos.x >= 0, _zoneDone.s2 === true
  → ZONE_S4           (Anwendungs-Flügel: HTTP/DNS/FTP/SMTP — p2-s4-anwendung.js)
                       Trigger: pos.z < -16.5 && pos.x < 0, _zoneDone.s3 === true
  → ZONE_S5           (Büro-Flügel: Routing-Tabellen — p2-s5-routing.js)
                       Trigger: pos.x < -12.5 && pos.z > -12, _zoneDone.s4 === true
  → FINAL             (Gesamtauswertung — direkt nach S5-Abschluss via showFinalSummary())
```

Jede Zone ist durch `_zoneDone.sN` gegen mehrfaches Betreten gesichert. Gates (`_gates`-Objekt in `game.js`) sperren die physischen Türen, bis die Vorgänger-Zone abgeschlossen ist.

## Gates (Türen-Schranken)

```js
const _gates = {
  s3door:  { box: { xmin: 4.5,  xmax: 7.5,   zmin:-16.2, zmax:-15.7 }, entityId: 'gate-s3' },
  s4door:  { box: { xmin:-7.5,  xmax:-4.5,   zmin:-16.2, zmax:-15.7 }, entityId: 'gate-s4' },
  routing: { box: { xmin:-12.2, xmax:-11.85, zmin:-8,    zmax:-5    }, entityId: 'gate-routing' },
};
```

`openGate(name)` entfernt den Kollisionsblock und blendet das Gate-Entity aus.

## Dateistruktur (aktuell)

```
index.html                              # HTML-Struktur + A-Frame-Scene
css/style.css                           # Alle UI-Styles (HUD, Overlays, Banner,
                                        #   .conveyor-belt, .routing-table, .line-connector)
js/game.js                              # State-Machine + Zone-Detection-Interval + Gates
js/components.js                        # A-Frame-Custom-Komponenten
js/scenarios/
  p2-s1-schichten.js                    # Tafel-Quiz: TCP/IP-Schichten (ZONE_S1)
  p2-s2-protokolle.js                   # Tafel-Quiz: Protokolle (ZONE_S2)
  p2-s3-transport.js                    # Transport-Flügel: TCP/UDP-Förderband (ZONE_S3)
  p2-s4-anwendung.js                    # Anwendungs-Flügel: Protokoll-Briefkästen (ZONE_S4)
  p2-s5-routing.js                      # Routing-Tabellen + Forwarding (ZONE_S5, in Arbeit)
tests/ui.spec.js                        # Playwright E2E-Tests
playwright.config.js                    # Test-Konfiguration (baseURL: localhost:8080)
audio/                                  # Audio-Assets (derzeit leer)
lct_3000_07-_low_poly_model.glb         # LKW-3D-Modell
warehouse_forklift_gameready.glb        # Gabelstapler
```

## A-Frame-Komponenten (custom)

| Komponente | Datei | Funktion |
|---|---|---|
| `collision-walls` | js/components.js | AABB/OBB-Kollisionserkennung für Wände/Regale |
| `auto-collider` | js/components.js | Berechnet OBB aus GLTF-Bounding-Box automatisch |
| `jump-controls` | js/components.js | Sprung-Physik (Leertaste, feste Gravitationskonstante) |
| `proximity-dialog` | js/components.js | NPC "Max" spricht Spieler an, wenn nah genug |
| `kiosk-interaction` | js/components.js | Proximity + E-Toggle für Info-Kioske in 3D-Räumen |
| `package-follow` | js/components.js | A-Frame-Komponente für Paket-Follow-Mechanik (smooth lerp); wird in P2S3 per RAF-Loop ersetzt |

## Szenario-Modul-API

Alle Module in `js/scenarios/` folgen diesem IIFE-Pattern:

```js
const P2SN = (() => {
  // interner State
  return {
    init(onComplete) { ... },   // startet Szenario, ruft onComplete(score) am Ende
    teardown() { ... },         // räumt auf (bei Exit aus der Zone)
    getScore() { return _score; },
    _dropForTest(id, targetId) { ... }, // Test-Helper: simuliert E-Drop
  };
})();
const LN = P2SN; // Alias für game.js / Tests
```

Script-Tag **vor** `game.js` einfügen, mit Cache-Busting-Suffix:
```html
<script src="js/scenarios/p2-s3-transport.js?v=1"></script>
```

## Test-Helper-Signaturen (aktuell)

| Modul | Alias | Helper | Signatur |
|---|---|---|---|
| P2S1 | — | kein Helper | Karten direkt per Playwright klicken |
| P2S2 | — | kein Helper | Karten direkt per Playwright klicken |
| P2S3 | `L3` | `_dropForTest` | `L3._dropForTest(paketId, beltId)` — z.B. `('l3-paket-1', 'tcp')` |
| P2S4 | `L4` | `_dropForTest` | `L4._dropForTest(paketId, inboxId)` — z.B. `('l4-paket-1', 'http')` |

**Bekannter Bug:** `p2-s4-anwendung.js` exportiert kein `const L4 = P2S4;` alias → 3 L4-Tests schlagen fehl mit `ReferenceError: L4 is not defined`.

## Schlüssel-Datenstrukturen (bestehend)

```js
// Auftragsliste (shuffled beim Start)
const lieferschein = [
  { id:'24513', ip:'192.168.1.10', network:'192.168.1', done:false },
  ...
];

// Netz → Palette-ID
const netzwerkMap = {
  '192.168.1': 'palette-1',  // blau
  '10.0.0':    'palette-2',  // grün
  '172.16.5':  'palette-3',  // orange
};
```

## Wichtige IDs / DOM-Elemente

| ID | Bedeutung |
|---|---|
| `#task-text` | HUD-Aufgabentext (links oben) |
| `#score-pill` | Punktestand (rechts oben) |
| `#timer-pill` | Spielzeit |
| `#selected-badge` | Zeigt aktuell ausgewähltes Paket (Mitte unten) |
| `#binary-display` | IP in Binärdarstellung (Lernhilfe) |
| `#tutorial-start-overlay` / `#tutorial-complete-overlay` | Tutorial-Screens |
| `#complete-overlay` | S1-Abschluss-Screen |
| `#s2-briefing-overlay` | S2-Einführungs-Overlay (TCP-Brücke) |
| `#s2-complete-overlay` | S2-Abschluss-Screen |
| `#s3-briefing-overlay` / `#s3-complete-overlay` | S3-Assessment-Screens |
| `#final-overlay` | Gesamt-Abschluss mit Statistik |
| `#palette-1/2/3` | Interaktive Paletten-Zonen (S1 + S2) |
| `#step-banner` | Animiertes Tutorial-Schritt-Banner |
| `#hud-tag` | Szenario-Label im HUD |
| `#s0-map` | SVG-Grundriss der Lagerhalle (4 Zonen = 4 TCP/IP-Schichten) |
| `#dir-arrow` | Rotierender SVG-Pfeil (unten mittig, z-index:999) |
| `#bottom-instruction` | Instruktionstext (unter Pfeil, z-index:999) |
| `#waypoint-s1/s2/s3` | 3D-Wegpunkt-Pfeile über Szenario-Eingängen |
| `l3-paket-1` … `l3-paket-5` | TCP/UDP-Pakete im Transport-Flügel |
| `l3-belt-tcp` / `l3-belt-udp` | Förderbänder im Transport-Flügel |
| `l3-feedback-panel` | 3D-Feedback-Panel im Transport-Flügel |
| `l4-paket-1` … `l4-paket-6` | Protokoll-Pakete im Anwendungs-Flügel |
| `l4-quiz-terminal` | Quiz-Terminal das nach allen 6 Paketen erscheint |

## Bekannte Fallstricke / Gotchas

### Lieferschein-Update in S2 / S3-Retransmit (computer-proximity + E-Handler)

**Problem:** Der Lieferschein (`#lieferschein-list`) wird NICHT aktualisiert, wenn `startS2()` oder `confirmS3Retransmit()` zu früh ausgelöst werden — also bevor der Spieler wirklich am PC steht.

**Fix (seit v7):**
- E-Handler prüft `comp._hintVisible === true` als Proximity-Gate.
- `initS2()` hat Fallback: wenn `lieferschein.filter(p => p.done)` leer ist, wird auf alle Pakete zurückgegriffen.

**Wichtig:** `computer-proximity.tick()` setzt `_hintVisible` auf `true/false` je nach Abstand. Das E-Gate hängt davon ab.

### Kollisionswände: Zwei-Türen-Layout (Rückwand z=-16)

Die Rückwand bei z=-16 hat **zwei** Türöffnungen — Transport-Tür rechts (x=4.5..7.5) und Anwendungs-Tür links (x=-7.5..-4.5). Die Kollisionsboxen in `components.js` müssen exakt drei Segmente haben:

```js
{ xmin:-20,  xmax:-7.5, zmin:-16.2, zmax:-15.7 }, // links außen
{ xmin:-4.5, xmax:4.5,  zmin:-16.2, zmax:-15.7 }, // Mitte (kein Durchgang)
{ xmin:7.5,  xmax:20,   zmin:-16.2, zmax:-15.7 }, // rechts außen
```

Wenn nur ein Segment mit zentraler Lücke (altes Single-Door-Layout: x=-3..+3) gesetzt ist, können die Türen nicht passiert werden und die Mittelwand ist durchgehbar.

### Floating-Paket-Mechanik (P2S3): `_processed` vs. `_assigned`

In `p2-s3-transport.js` gibt es zwei Zähler:
- `_assigned` — nur korrekte Zuordnungen (für Score-Anzeige)
- `_processed` — alle abgelegten Pakete, richtig + falsch (für Abschluss-Trigger)

**Warum:** Falsch platzierte Pakete werden sofort ausgeblendet und können nicht erneut aufgenommen werden. Würde nur `_assigned` für den Abschluss geprüft, käme `onComplete` bei Fehlern nie. Der Check ist daher `if (_processed >= PACKETS.length)`.

### Floating-Paket: RAF-Loop statt A-Frame-Komponente

`_startCarrying(paketEl)` in P2S3 verwendet `requestAnimationFrame` direkt (kein `package-follow`-Komponente). Die Vorwärtsrichtung wird auf XZ projiziert (Y=0, renormalisiert), damit das Paket beim Hoch-/Runterschauen auf gleicher Höhe bleibt:

```js
_fwd.set(0, 0, -1).applyQuaternion(_camQ);
_fwd.y = 0;
if (_fwd.lengthSq() > 0.001) _fwd.normalize();
```

`_stopCarrying()` muss **immer** vor jedem `teardown()` aufgerufen werden.

### Paket-Labels: kein Protokoll-Hint

L3-Pakete zeigen in ihren `<a-text value="...">` Labels **nur** den Szenario-Namen (z.B. "E-Mail-Versand"), **nicht** den Protokoll-Hint ("TCP?"). Kein `&#10;TCP?` oder `&#10;UDP?` anhängen.

### Feedback-Dauer in P2S3

Das Feedback-Panel (`#l3-feedback-panel`) bleibt **8000 ms** sichtbar. Nicht auf den alten Wert (2500 ms) zurücksetzen.

### S2-Transition: Lieferschein-Zustand

- `showS2Transition()` leert den Lieferschein sofort
- Erst nach E-Druck am PC → `startS2()` füllt ihn mit den 2 verlorenen Paketen

### CSS-Spezifität bei gemischten Selektoren in Overlays

`.klasse span` (Spezifität 0,1,1) schlägt `.badge-klasse` (0,1,0). `:not()` verwenden: `.s0-lz-item span:not(.s0-lz-badge)`.

### SVG-Testbarkeit (Playwright)

Zone-Rects brauchen `data-zone="..."`. Selektor-Pattern: `rect[data-zone]`.

### Kein generisches `.hidden` im CSS (vor P2 S1)

Mit P2 S1 wurde `.hidden { display: none; }` als generische Regel ergänzt.

### Neue Overlays in `style.css` registrieren (zwei Stellen)

1. **Display-Selektor** (~Zeile 65): ID zur `position: fixed; display: flex`-Regel hinzufügen
2. **Hidden-Selektor** (~Zeile 75): ID zur `display: none`-Regel hinzufügen

### IIFE-Module: Listener-Akkumulation bei erneutem `init()`

Fix: `cloneNode(true)` + `replaceWith()` vor dem Neuregistrieren (nur für einfache Buttons ohne Kind-IDs). Für Container mit benannten Kinder-IDs Handler als Property speichern:
```js
if (el._handler) el.removeEventListener('click', el._handler);
el._handler = () => handler();
el.addEventListener('click', el._handler);
```

### Test-Helper `_dropForTest()` immer auf Overlay scoppen

```js
const overlay = document.getElementById('p2-sN-overlay');
const zone = overlay ? overlay.querySelector(`[data-layer="${layerId}"]`) : null;
```

### Neue Szenario-Module: Overlay-Pointer-Events

Overlay braucht `pointer-events: all`; `document.exitPointerLock()` im `init()` aufrufen.

### Szenario entfernen — Checkliste (8 Touchpoints)

Beim vollständigen Entfernen eines Szenarios müssen folgende Stellen bereinigt werden:
1. `js/scenarios/p2-sN.js` — Datei löschen
2. `index.html` — Overlay-`<div>`, 3D-Raum-Entities, Gate-Entity, Script-Tag
3. `js/game.js` — `_zoneDone.sN`, Gate in `_gates`, `enterZoneSN()`, E-Handler-Block, Zone-Detection, Zone-Exit, Nachfolge-Logik (was nach Abschluss passiert)
4. `css/style.css` — Overlay-ID aus Display- + Hidden-Selektoren (~Zeile 65/75), `.sN-*`-CSS-Block

## Raumgeometrie und Zone-Trigger

```
         NORD (z=-30)
    ┌────────────────────┐
    │  ZONE_S4  │ZONE_S3 │  z: -16.5..-30  (Nordflügel)
    │   x<0     │  x≥0   │
    ├───────────┴────────┤  z=-16 (zwei Türen: x=4.5..7.5 + x=-7.5..-4.5)
    │  Haupthalle        │
    │  ZONE_S5           │  Büro-Flügel: x<-12.5, z: -5..-10
    │  (Büro, x<-12.5)   │  (gate-routing: x=-12.2..-11.85, z=-8..-5)
    │                    │
    └────────────────────┘  z=0 (Eingang, Lücke x=-2..+2)
         SÜD (z=0)
```

Zone-Detection im `setInterval` (`game.js`):

```js
if (pos.z < -16.5) {
  if (['S1_ACTIVE','INTRO','TUTORIAL'].includes(gameState)) {
    if (pos.x >= 0) enterZoneS3();
    else            enterZoneS4();
  }
} else if (pos.x < -12.5 && pos.z > -12 && pos.z < 0) {
  if (['S1_ACTIVE','INTRO','TUTORIAL'].includes(gameState)) enterZoneS5();
}
```

## Navigationssystem (seit 2026-06-17)

Nach dem Tutorial folgt der Spieler zwei parallelen Führungssystemen:

1. **3D-Wegpunkt-Pfeile** (`#waypoint-s1/s2/s3`): Kegel über Szenario-Eingängen, per `setAttribute('visible', ...)` gesteuert.
2. **Screen-Space Richtungspfeil** (`#dir-arrow`): SVG-Pfeil, dreht sich per `setArrowTarget(x, z)` zum Ziel.
3. **Instruktionsbox** (`#bottom-instruction`): Textbox unten mittig, per `setInstruction(text)` gesteuert.

**Pfeilrotations-Logik** (Quaternion-Inversion, nicht Bearing-Differenz):
```js
const toTarget = new THREE.Vector3(dx, 0, dz).normalize();
const camQ = new THREE.Quaternion();
cam.object3D.getWorldQuaternion(camQ);
camQ.invert();
toTarget.applyQuaternion(camQ);
const rel = Math.atan2(toTarget.x, -toTarget.z) * 180 / Math.PI;
arrowEl.style.transform = `translateX(-50%) rotate(${rel}deg)`;
```

**Übergangs-Pattern:**
- Zone betreten: `setArrowTarget(null, null)` + `setInstruction('')`
- Zone abgeschlossen (in `onComplete`): `setArrowTarget(x, z)` + `setInstruction('...')`

**Gotcha:** HUD-Elemente über A-Frame-Canvas brauchen `z-index:999` als Inline-Style.

## Debugging

- `F2` im Browser: Kollisionsboxen als rote transparente Quader einblenden/ausblenden
- Alle alten Pakete haben `class="interactable paket"`, Paletten `class="interactable palette-zone"`
- L3-Pakete: `class="interactable paket-l3"`, L4-Pakete: `class="interactable paket-l4"`

## Offene Punkte / Roadmap

### Implementierungsreihenfolge (priorisiert)

1. ~~**S0 Update**~~ — ✅ fertig (SVG-Hallenplan + Lernziele, 2026-06-16)
2. ~~**P2 S1 (Tafel-Quiz)**~~ — ✅ fertig (`p2-s1-schichten.js`)
3. ~~**P2 S2 (Tafel-Quiz)**~~ — ✅ fertig (`p2-s2-protokolle.js`)
4. ~~**P2 S3 (Transport-Flügel)**~~ — ✅ fertig (`p2-s3-transport.js`); Floating-Paket, 8s Feedback, _processed-Zähler
5. ~~**P2 S4 (Anwendungs-Flügel)**~~ — ✅ fertig (`p2-s4-anwendung.js`); L4-Alias-Bug noch offen
6. **P2 S5 (Routing)** — `js/scenarios/p2-s5-routing.js`; Büro-Flügel (x<-12.5), State: `ZONE_S5`
7. ~~**P2 S6 (Assessment)**~~ — ❌ entfernt (2026-06-17)
8. **L4-Alias-Bug fixen** — `const L4 = P2S4;` am Ende von `p2-s4-anwendung.js` ergänzen → 3 Tests werden grün

### Offene Architekturentscheidungen

- **Bestehender Lernpfad (IP-Sortierung):** Soll S1–S3 (alt) erhalten bleiben oder komplett durch P2 ersetzt werden?

### Technische Basis

- `resetToS1()` in `js/game.js` setzt das Spiel von S3 in den Trainingsmodus zurück
- Deploy: `index.html` + `css/` + `js/` + `.glb`-Dateien (keine weiteren Abhängigkeiten außer A-Frame CDN)
- Szenarien-Referenzdokument: `Szenarien Nadine.pdf` (nicht im Repo, liegt lokal)
