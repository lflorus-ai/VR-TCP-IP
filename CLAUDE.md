# VR-TCP/IP — Projektkontext

## Hinweis zur Gültigkeit von Skills

Alle Skills, Berechtigungen und Anweisungen, die Claude in diesem Projekt erteilt werden, gelten **ausschließlich für dieses Projekt** und sind nicht auf andere Projekte oder Repositories übertragbar.

## Was ist das?

Ein browserbasiertes 3D-Lernspiel, das TCP/IP-Netzwerkkonzepte durch eine interaktive Lagerhallen-Metapher vermittelt. Entstanden als Seminararbeit (Integrationsseminar, Gruppe 08, DHBW Stuttgart WWI2023G).

Die Anwendung befindet sich in einer **aktiven Weiterentwicklungsphase**: Der ursprüngliche Lernpfad (IP-Adresssortierung) wird durch ein vollständiges 7-Szenarien-Curriculum (P2, Konzept: Nadine) ersetzt bzw. erweitert, das das gesamte TCP/IP-Schichtenmodell abdeckt.

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
| Szenario-Module | `js/scenarios/` — je ein Modul pro P2-Szenario (geplant) |

## Lernpfad-Struktur (Zielzustand P2)

Das neue Curriculum (7 Szenarien, Gesamtdauer ~32 Min) deckt alle 5 Lernziele ab:

| ID | Typ | Titel | Dauer | Lernziele | Status |
|---|---|---|---|---|---|
| **S0** | Steuer | Die Logistikhalle | 1–2 Min | Orientierung + Aktivierung | ✅ fertig — SVG-Hallenplan + 5 Lernziele im `#tutorial-start-overlay` |
| **P2 S1** | Lern | Vier Bereiche, vier Schichten: Das TCP/IP-Modell | 5 Min | LZ1: Architektur TCP/IP-Modell | ~~Overlay-Prototyp (`p2-s1-layers.js`) — ersetzt durch 3D-Räume~~ |
| **P2 S2** | Lern | Transportzone: Protokolle der Transportschicht | 5 Min | LZ5: Protokolle den Schichten zuordnen | ~~Overlay-Prototyp (`p2-s2-protocols.js`) — ersetzt durch 3D-Räume~~ |
| **P2 S3** | Lern | Transport-Flügel: TCP/UDP in der Lagerhalle (Layer 3) | 5 Min | LZ5: TCP vs. UDP unterscheiden | ✅ Prototyp — 3D-Raum, Pakete auf TCP/UDP-Band tragen (`js/scenarios/layer3-transport.js`), State: `ZONE_TRANSPORT` |
| **P2 S4** | Lern | Anwendungs-Flügel: HTTP/DNS/FTP/SMTP-Briefkästen (Layer 4) | 5 Min | LZ3+LZ4: IP-Adressen + OSI-Mapping | ✅ Prototyp — 3D-Raum, Pakete in Protokoll-Briefkasten tragen (`js/scenarios/layer4-anwendung.js`), State: `ZONE_ANWENDUNG` |
| **P2 S5** | Lern | Paket auf Reise: Routing durch Router | 6 Min | LZ2+LZ3: Routing + Paketverlauf | **fehlt** — 3D-Raum im Büro-Flügel (x<-12.5), State: `ZONE_ROUTING` (`js/scenarios/p2-s5-routing.js`) |
| **P2 S6** | Bewertung | Vollständige TCP/IP-Kommunikation | 10 Min | LZ1–LZ5 (alle) | **fehlt** — 3D-Raum im tiefen Nordflügel (z<-30), State: `ZONE_ASSESSMENT` (`js/scenarios/p2-s6-assessment.js`) |

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

Jedes neue Szenario bringt ein eigenes UI-Paradigma:

| Szenario | Interaktionstyp | Technischer Ansatz |
|---|---|---|
| P2 S0 Update | Hallenplan-Klick + Lernziele-Overlay | Overlay erweitern, SVG-Karte |
| P2 S1 | ~~Karten-Klick + Multiple Choice~~ | ~~Overlay-Panel, Event-Listener~~ — ersetzt durch 3D |
| P2 S2 | ~~Drag & Drop (Protokoll → Schicht)~~ | ~~HTML5 `draggable`, `dragover/drop`~~ — ersetzt durch 3D |
| P2 S3 | Paket auf TCP/UDP-Band tragen (E-Mechanik) | `class="interactable paket-l3"` / `belt-zone`; 3D-Raum Transport-Flügel |
| P2 S4 | Paket in Protokoll-Briefkasten tragen (E-Mechanik) | `class="interactable paket-l4"` / `inbox-zone`; 3D-Raum Anwendungs-Flügel |
| P2 S5 | Router-Routing-Entscheidung | 3D-Raum im Büro-Flügel (x<-12.5); `class="interactable routing-node"` / `router-zone`; State: `ZONE_ROUTING` |
| P2 S6 | Mehrstufig ohne Hinweise, Musterlösung | 3D-Raum im tiefen Nordflügel (z<-30); Sequenz-Orchestrierung; State: `ZONE_ASSESSMENT` |

## Geplante State Machine (Erweiterung)

```
INTRO
  → TUTORIAL          (S0: Steuerung — bestehend)
  → S1_ACTIVE         (IP-Sortierung — bestehend)
  → S2_BRIEFING / S2_ACTIVE  (TCP-Retransmit — bestehend)
  → S3_BRIEFING / S3_ACTIVE  (Assessment — bestehend)
  → ZONE_TRANSPORT    (Transport-Flügel: TCP/UDP — layer3-transport.js)
                       Trigger: pos.z < -16.5 && pos.x >= 0
  → ZONE_ANWENDUNG    (Anwendungs-Flügel: HTTP/DNS/FTP/SMTP — layer4-anwendung.js)
                       Trigger: pos.z < -16.5 && pos.x < 0
  → ZONE_ROUTING      (Büro-Flügel: Routing-Tabellen — p2-s5-routing.js)
                       Trigger: pos.x < -12.5 && pos.z > -12
  → ZONE_ASSESSMENT   (Tiefer Nordflügel: Volltest — p2-s6-assessment.js)
                       Trigger: pos.z < -30
  → FINAL             (Gesamtauswertung)
```

Neue States werden analog zu den bestehenden `S1_ACTIVE / S2_BRIEFING / S2_ACTIVE` in `js/game.js` ergänzt. Jedes Szenario-Modul unter `js/scenarios/` exportiert `init()`, `teardown()` und `getScore()`.

## Geplante Dateistruktur (Zielzustand)

```
index.html                              # HTML-Struktur + A-Frame-Scene
css/style.css                           # Alle UI-Styles (HUD, Overlays, Banner,
                                        #   .drag-card, .drop-zone, .conveyor-belt,
                                        #   .routing-table, .line-connector)
js/game.js                              # State-Machine (alt + P2-States)
js/components.js                        # A-Frame-Custom-Komponenten
js/scenarios/
  layer3-transport.js                   # Transport-Flügel: Pakete auf TCP/UDP-Band tragen (ZONE_TRANSPORT)
  layer4-anwendung.js                   # Anwendungs-Flügel: Pakete in Protokoll-Briefkasten (ZONE_ANWENDUNG)
  p2-s5-routing.js                      # Routing-Tabellen + Forwarding (fehlt)
  p2-s6-assessment.js                   # Kombinierter Bewertungsablauf (fehlt)
  # Entfernt/ersetzt: p2-s1-layers.js, p2-s2-protocols.js, p2-s3-tcpudp.js, p2-s4-addressing.js
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
| `kiosk-interaction` | js/components.js | Proximity + E-Toggle für Info-Kioske in 3D-Räumen; zeigt Info-Text wenn Spieler nah genug und E drückt |

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

Neue Szenario-Module verwalten ihren eigenen State intern und kommunizieren mit `game.js` nur über `init()` / `teardown()` / `getScore()`.

## Wichtige IDs / DOM-Elemente (bestehend)

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
| `#final-overlay` | Gesamt-Abschluss mit Statistik (`#final-s1/s2/s3`, `#final-total`, `#final-time`) |
| `#palette-1/2/3` | Interaktive Paletten-Zonen (S1 + S2) |
| `#palette-4` | Assessment-Palette (nur Szenario 3) |
| `#step-banner` | Animiertes Tutorial-Schritt-Banner (`#sb-counter`, `#sb-icon`, `#sb-title`, `#sb-keys`, `#sb-desc`) |
| `#hud-tag` | Szenario-Label im HUD (Klasse `tutorial` für S0) |
| `#progress-pips` | Fortschritts-Punkte im HUD |
| `#lieferschein-list` | Pakete-Liste im HUD |
| `paket-A1` … `paket-A5` | Interaktive Pakete (Regal A) |
| `#s0-map` | SVG-Grundriss der Lagerhalle (4 Zonen = 4 TCP/IP-Schichten), inline in `#tutorial-start-overlay` |
| `.s0-two-col` / `.s0-lz-*` | Hallenplan + Lernziele-Spalten-Layout (CSS-Namespace `.s0-*` für S0-Elemente) |

Neue P2-Overlays erhalten IDs nach dem Schema `#p2-s{N}-overlay` und `#p2-s{N}-complete-overlay`.

## Bekannte Fallstricke / Gotchas

### Lieferschein-Update in S2 / S3-Retransmit (computer-proximity + E-Handler)

**Problem:** Der Lieferschein (`#lieferschein-list`) wird NICHT aktualisiert, wenn `startS2()` oder `confirmS3Retransmit()` zu früh ausgelöst werden — also bevor der Spieler wirklich am PC steht.

**Ursache:** Der `keydown`-Handler für E prüft zwar `gameState === 'S2_BRIEFING'`, aber NICHT ob der Spieler nah am Computer ist. Ein versehentlicher E-Druck irgendwo im Lager ruft `initS2()` auf, bevor `lieferschein`-Einträge als `done: true` gesetzt sind → `s2LostPackets = []` → Lieferschein leer.

**Fix (seit v7):**
- E-Handler prüft `comp._hintVisible === true` als Proximity-Gate: `startS2()` / `confirmS3Retransmit()` feuern nur, wenn der `computer-proximity`-Hint gerade sichtbar ist (= Spieler < 3.5m vom PC).
- `initS2()` hat Fallback: wenn `lieferschein.filter(p => p.done)` leer ist, wird auf alle Pakete zurückgegriffen, sodass `s2LostPackets` nie leer bleibt.

**Wichtig bei zukünftigen Änderungen:** `computer-proximity.tick()` setzt `_hintVisible` auf `true/false` je nach Abstand. Das E-Gate hängt davon ab — `_hintVisible` darf nicht aus anderen Gründen auf `false` gesetzt bleiben.

### S2-Transition: Lieferschein-Zustand

- `showS2Transition()` leert den Lieferschein sofort (zeigt nichts während der Briefing-Phase)
- Erst nach E-Druck am PC → `startS2()` → `renderLieferscheinList(s2LostPackets, 'lieferschein-list', true)` füllt ihn mit den 2 verlorenen Paketen (inkl. IP + Ziel-LKW)
- Gleiches Muster für S3-Retransmit: `startS3Retransmit()` → Briefing → E am PC → `confirmS3Retransmit()`

### CSS-Spezifität bei gemischten Selektoren in Overlays

`.klasse span` (Spezifität 0,1,1) schlägt `.badge-klasse` (0,1,0), auch wenn beide auf dasselbe Element zutreffen. Wenn ein Overlay sowohl eine Badge-Klasse als auch einen Descendant-`span`-Selektor hat, `:not()` verwenden: `.s0-lz-item span:not(.s0-lz-badge)` — verhindert ungewollte Überschreibung. Gilt analog für alle künftigen `.p2-s{N}-*`-Namensräume.

### SVG-Testbarkeit (Playwright)

SVG-Elemente für Playwright: Zone-Rects brauchen `data-zone="..."` — sonst nicht von Rahmen/Eingang-Rects unterscheidbar. Selektor-Pattern: `rect[data-zone]` statt `rect:nth-child(n)`.

### Kein generisches `.hidden` im CSS (vor P2 S1)

Das Projekt definierte `.hidden` nur für spezifische Overlay-IDs (`#overlay-id.hidden { display: none }`), nicht global. Neue Elemente (Buttons, Divs), die `classList.add('hidden')` nutzen, blieben sichtbar. Mit P2 S1 wurde `.hidden { display: none; }` als generische Regel ergänzt — seitdem funktioniert `classList.add/remove('hidden')` für alle Elemente.

### Neue Overlays in `style.css` registrieren (zwei Stellen)

1. **Display-Selektor** (~Zeile 65): ID zur `position: fixed; display: flex`-Regel hinzufügen
2. **Hidden-Selektor** (~Zeile 75): ID zur `display: none`-Regel hinzufügen

Fehlt einer der beiden Einträge → Overlay bleibt immer sichtbar oder lässt sich nicht ausblenden.

### Szenario-Module: Einbindung und Struktur

Script-Tag **vor** `game.js` einfügen, mit Cache-Busting-Suffix:
```html
<script src="js/scenarios/p2-s1-layers.js?v=1"></script>
```
Alle Module in `js/scenarios/` ablegen. Modul-Pattern: IIFE, das `{ init(onComplete), teardown(), getScore(), _dropForTest }` (bzw. äquivalenter Test-Helper) exportiert. `init()` ruft `document.exitPointerLock()` auf und registriert Event-Listener; `teardown()` versteckt das Overlay; `onComplete(score)` wird nach Abschluss aufgerufen und übergibt die Kontrolle an `game.js` zurück.

### IIFE-Module: Listener-Akkumulation bei erneutem `init()`

`addEventListener({ once: true })` reicht nicht, wenn `init()` mehrfach aufgerufen werden kann (z.B. Reset-Flow). Fix: `cloneNode(true)` + `replaceWith()` vor dem Neuregistrieren:
```js
const fresh = btn.cloneNode(true);
btn.replaceWith(fresh);
fresh.addEventListener('click', handler, { once: true });
```

### Quiz-Antwort-Highlighting: Referenz statt textContent-Matching

`b.textContent === opt.text` ist fragil (Whitespace, zukünftige Edits). Stattdessen Option direkt als Property speichern:
```js
btn._opt = opt;  // in _showQuiz()
// in wrong-Branch: if (b._opt && b._opt.correct) b.classList.add('correct');
```

### Test-Helper `_dropForTest()` immer auf Overlay scoppen

`document.querySelector('[data-layer="..."]')` trifft auch andere Module mit demselben Attribut. Immer auf den eigenen Overlay scoppen:
```js
const overlay = document.getElementById('p2-sN-overlay');
const zone = overlay ? overlay.querySelector(`[data-layer="${layerId}"]`) : null;
```
Gilt analog für alle zukünftigen Module.

### cloneNode(true) nur für einfache Buttons — nicht für Panels mit Kind-IDs

Container-Elemente mit benannten Kinder-IDs (z.B. Belt-Panels, die `#p2s3-chips-tcp` enthalten) dürfen nicht per `cloneNode(true)` bereinigt werden — doppelte IDs entstehen im DOM. Fix: Handler als Property am Element speichern:
```js
if (el._p2s3Handler) el.removeEventListener('click', el._p2s3Handler);
el._p2s3Handler = () => handler();
el.addEventListener('click', el._p2s3Handler);
```
Einfache Buttons ohne Kind-IDs (quiz-btn, next-btn) weiterhin per `cloneNode(true)` + `replaceWith()` bereinigen.

### Test-Helper-Signaturen je Szenario

Jedes Modul exportiert einen eigenen Test-Helper (kein globaler Standard):
- P2S1: kein Helper (Karten direkt per Playwright klicken)
- P2S2: `_dropForTest(protocolId, layerId)` — simuliert Drag&Drop
- P2S3: `_assignForTest(scenarioId, protocol)` — setzt `_selected` und ruft `_onBeltClick`
- P2S4: `_matchForTest(tcpipId, osiGroupId)` — setzt `_selectedTcpip` und ruft `_onOsiClick`

### SVG-Linien zwischen zwei DOM-Spalten (P2 S4)

SVG liegt `position: absolute; inset: 0; pointer-events: none; overflow: visible` über einem `position: relative`-Container. Linien-Koordinaten per `getBoundingClientRect()` relativ zum SVG berechnen:
```js
const svgRect = svg.getBoundingClientRect();
const x1 = el.getBoundingClientRect().right - svgRect.left;
const y1 = el.getBoundingClientRect().top + el.offsetHeight / 2 - svgRect.top;
```
`overflow: visible` ist nötig, damit Linien über die SVG-Bounds hinausragen. `pointer-events: none` verhindert, dass das SVG Klicks auf darunterliegenden Elementen blockiert.

### Neue Szenario-Module: Overlay-Pointer-Events

Sobald ein P2-Overlay sichtbar ist, muss A-Frame-Kamera-Input deaktiviert werden (Maus-Look blockiert Drag&Drop). Das Overlay-Element braucht `pointer-events: all` und die A-Frame-Scene muss temporär `document.exitPointerLock()` aufrufen — analog zu den bestehenden Overlay-Screens.

### Zone-Detection via setInterval (player.z < -16.5)

Die Zonen-Erkennung für `ZONE_TRANSPORT` und `ZONE_ANWENDUNG` läuft per `setInterval`, das die Spieler-Position überwacht:

Vollständige Raumgeometrie und Zone-Trigger:

```
         NORD (z=-30)
    ┌────────────────────┐
    │  ZONE_ASSESSMENT   │  z: -30..-44  (tiefer Nordflügel)
    ├────────┬───────────┤
    │ZONE_L4 │ ZONE_L3   │  z: -16..-30  (Nordflügel)
    │ x<0    │  x>=0     │
    ├────────┴───────────┼──────────┐
    │ ZONE_ROUTING       │ Versand  │  z: 0..-16
    │ (Büro, x<-12.5)   │ DO NOT   │
    │                    │ TOUCH    │
    └────────────────────┴──────────┘
         SÜD (z=0, Eingang)
```

Zone-Detection-Pattern (alle vier Zonen im selben `setInterval`):

```js
if (pos.z < -30) {                              // Tiefer Nordflügel → Assessment
  if (...) enterZoneAssessment();
} else if (pos.z < -16.5) {                    // Nordflügel → Transport / Anwendung
  if (pos.x >= 0 && ...) enterZoneTransport();
  else if (pos.x < 0 && ...) enterZoneAnwendung();
} else if (pos.x < -12.5 && pos.z > -12) {    // Büro-Flügel → Routing
  if (...) enterZoneRouting();
}
```

**Wichtige Einschränkungen:**
- Zone-Detection feuert **nur** aus den States `S1_ACTIVE`, `INTRO` oder `TUTORIAL` — nie während einer bereits aktiven Zone oder S2/S3-Phase.
- Sobald eine Zone aktiv ist, wird das Intervall gestoppt; `teardown()` des Moduls startet es ggf. neu.
- Der Versandraum (rechte Seite, x=12..22) ist NICHT Teil der Zone-Detection — dieser Bereich bleibt unberührt.
- `ZONE_ROUTING` und Büro-S2/S3 (`computer-proximity`) koexistieren: Die `computer-proximity`-Komponente bleibt, wird aber in `ZONE_ROUTING` ignoriert (anderer State).
- `ZONE_ASSESSMENT` (z<-30) benötigt neue Geometrie hinter dem bestehenden Nordflügel.

## Debugging

- `F2` im Browser: Kollisionsboxen als rote transparente Quader einblenden/ausblenden
- Alle Pakete haben `class="interactable paket"`, Paletten `class="interactable palette-zone"`
- Neue Szenario-Module: `window.__p2debug = true` (Konvention, noch nicht implementiert) für Einzelschritte überspringen

## Offene Punkte / Roadmap

### Implementierungsreihenfolge (priorisiert)

1. ~~**S0 Update**~~ — ✅ fertig (SVG-Hallenplan + Lernziele, 2026-06-16)
2. ~~**P2 S1 (Overlay)**~~ — Prototyp durch 3D-Zonen-Architektur ersetzt
3. ~~**P2 S2 (Overlay)**~~ — Prototyp durch 3D-Zonen-Architektur ersetzt
4. ~~**P2 S3 (Overlay)**~~ — Prototyp durch 3D-Zonen-Architektur ersetzt
5. ~~**P2 S4 (Overlay)**~~ — Prototyp durch 3D-Zonen-Architektur ersetzt
6. **ZONE_TRANSPORT** — `js/scenarios/layer3-transport.js`; Transport-Flügel (TCP/UDP), State: `ZONE_TRANSPORT`
7. **ZONE_ANWENDUNG** — `js/scenarios/layer4-anwendung.js`; Anwendungs-Flügel (HTTP/DNS/FTP/SMTP), State: `ZONE_ANWENDUNG`
8. **ZONE_ROUTING** — `js/scenarios/p2-s5-routing.js`; Büro-Flügel (x<-12.5), State: `ZONE_ROUTING`; Routing-Tabellen + 3D-Router-Knoten
9. **ZONE_ASSESSMENT** — `js/scenarios/p2-s6-assessment.js`; Tiefer Nordflügel (z<-30), State: `ZONE_ASSESSMENT`; Orchestrierung aller Szenarien, keine Hinweise, Musterlösung

### Offene Architekturentscheidungen

- **Bestehender Lernpfad (IP-Sortierung):** Soll S1–S3 (alt) erhalten bleiben oder komplett durch P2 ersetzt werden?
- ~~**P2 S5 Router:** Echte 3D-Router oder 2D-Overlay?~~ — **Entschieden:** 3D-Raum im Büro-Flügel (x<-12.5), Zone-Detection-Pattern analog zu L3/L4. `computer-proximity`-Komponente bleibt unberührt (anderer State).
- ~~**P2 S6 Platzierung:**~~ — **Entschieden:** Tiefer Nordflügel (z<-30) hinter dem bestehenden L3/L4-Bereich; braucht neue Wandgeometrie (`z=-44`).

### Technische Basis

- `resetToS1()` in `js/game.js` setzt das Spiel von S3 in den Trainingsmodus zurück
- Deploy: `index.html` + `css/` + `js/` + `.glb`-Dateien (keine weiteren Abhängigkeiten außer A-Frame CDN)
- Szenarien-Referenzdokument: `Szenarien Nadine.pdf` (nicht im Repo, liegt lokal)
