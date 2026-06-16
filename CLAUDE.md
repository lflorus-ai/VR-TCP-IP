# VR-TCP/IP — Projektkontext

## Hinweis zur Gültigkeit von Skills

Alle Skills, Berechtigungen und Anweisungen, die Claude in diesem Projekt erteilt werden, gelten **ausschließlich für dieses Projekt** und sind nicht auf andere Projekte oder Repositories übertragbar.

## Was ist das?

Ein browserbasiertes 3D-Lernspiel, das TCP/IP-Netzwerkkonzepte durch eine interaktive Lagerhallen-Metapher vermittelt. Entstanden als Seminararbeit (Integrationsseminar, Gruppe 08).

**Kernidee:** Datenpakete = Kartons mit IP-Adressen. Der Spieler sortiert sie per IP-Netzwerk auf die richtige Palette/den richtigen LKW.

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
| Spiellogik     | `js/game.js` — gesamte Game-Logik (~60KB) |
| Komponenten    | `js/components.js` — A-Frame-Komponenten |
| Styles         | `css/style.css` — alle CSS-Definitionen |

## Spielmechanik (Szenario 1)

1. Spieler startet in einem Lagerhaus mit Regal A (links) und Regal B (rechts)
2. Pakete tragen IP-Adressen (`192.168.1.x`, `10.0.0.x`, `172.16.5.x`)
3. `E`-Taste: Paket aus dem Regal aufnehmen → dann Palette anvisieren und erneut `E`
4. Jede Palette entspricht einem Zielnetz (LKW 1/2/3)
5. Richtig → +100 Punkte, Falsch → −20 Punkte + Feedback mit korrekter Palette
6. Timer läuft ab erstem Paket-Pick; Abschluss-Overlay nach Zustellung aller Pakete

**Lernziel:** IP-Adressklassen (A/B/C private Ranges) und Subnetz-Zugehörigkeit anhand der ersten Oktette erkennen.

## A-Frame-Komponenten (custom)

| Komponente | Datei | Funktion |
|---|---|---|
| `collision-walls` | js/components.js | AABB/OBB-Kollisionserkennung für Wände/Regale |
| `auto-collider` | js/components.js | Berechnet OBB aus GLTF-Bounding-Box automatisch |
| `jump-controls` | js/components.js | Sprung-Physik (Leertaste, feste Gravitationskonstante) |
| `proximity-dialog` | js/components.js | NPC "Max" spricht Spieler an, wenn nah genug |

## Schlüssel-Datenstrukturen

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

## Dateistruktur

```
index.html                              # HTML-Struktur + A-Frame-Scene
css/style.css                           # Alle UI-Styles (HUD, Overlays, Banner)
js/game.js                              # Spiellogik, Szenarien, State-Machine (~60KB)
js/components.js                        # A-Frame-Custom-Komponenten
tests/ui.spec.js                        # Playwright E2E-Tests
playwright.config.js                    # Test-Konfiguration (baseURL: localhost:8080)
audio/                                  # Audio-Assets (derzeit leer, DATEIEN.md vorhanden)
lct_3000_07-_low_poly_model.glb         # LKW-3D-Modell
warehouse_forklift_gameready.glb        # Gabelstapler
warehouse_storage_racking_fbx_low_poly_free.glb  # Lagerregale (nicht direkt geladen)
set_of_cardboard_boxes.glb              # Kartons (nicht direkt geladen)
Integrationsseminar_Gruppe08.pdf        # Seminararbeit / Projektdokumentation
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
| `#final-overlay` | Gesamt-Abschluss mit Statistik (`#final-s1/s2/s3`, `#final-total`, `#final-time`) |
| `#palette-1/2/3` | Interaktive Paletten-Zonen (S1 + S2) |
| `#palette-4` | Assessment-Palette (nur Szenario 3) |
| `#step-banner` | Animiertes Tutorial-Schritt-Banner (`#sb-counter`, `#sb-icon`, `#sb-title`, `#sb-keys`, `#sb-desc`) |
| `#hud-tag` | Szenario-Label im HUD (Klasse `tutorial` für S0) |
| `#progress-pips` | Fortschritts-Punkte im HUD |
| `#lieferschein-list` | Pakete-Liste im HUD |
| `paket-A1` … `paket-A5` | Interaktive Pakete (Regal A) |

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

## Debugging

- `F2` im Browser: Kollisionsboxen als rote transparente Quader einblenden/ausblenden
- Alle Pakete haben `class="interactable paket"`, Paletten `class="interactable palette-zone"`

## Offene Punkte / Roadmap

- Alle 3 Szenarien + Tutorial sind implementiert und spielbar
- `resetToS1()` in `js/game.js` setzt das Spiel von S3 in den Trainingsmodus (S1) zurück
- Deploy: `index.html` + `css/` + `js/` + `.glb`-Dateien (keine weiteren Abhängigkeiten außer A-Frame CDN)
