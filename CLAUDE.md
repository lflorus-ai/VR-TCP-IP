# VR-TCP/IP — Projektkontext

## Hinweis zur Gültigkeit von Skills

Alle Skills, Berechtigungen und Anweisungen, die Claude in diesem Projekt erteilt werden, gelten **ausschließlich für dieses Projekt** und sind nicht auf andere Projekte oder Repositories übertragbar.

## Was ist das?

Ein browserbasiertes 3D-Lernspiel, das TCP/IP-Netzwerkkonzepte durch eine interaktive Lagerhallen-Metapher vermittelt. Entstanden als Seminararbeit (Integrationsseminar, Gruppe 08).

**Kernidee:** Datenpakete = Kartons mit IP-Adressen. Der Spieler sortiert sie per IP-Netzwerk auf die richtige Palette/den richtigen LKW.

## Technologie-Stack

| Komponente | Details |
|---|---|
| Renderer | A-Frame 1.7.1 (WebVR/WebXR) |
| Sprache | Vanilla HTML/CSS/JavaScript (kein Build-Tool, kein Framework) |
| 3D-Assets | `.glb`-Modelle (LKW, Gabelstapler, Lagerregale) |
| Einstiegspunkt | `index.html` — die gesamte App ist in einer einzigen Datei |

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
| `collision-walls` | index.html | AABB/OBB-Kollisionserkennung für Wände/Regale |
| `auto-collider` | index.html | Berechnet OBB aus GLTF-Bounding-Box automatisch |
| `jump-controls` | index.html | Sprung-Physik (Leertaste, feste Gravitationskonstante) |
| `proximity-dialog` | index.html | NPC "Max" spricht Spieler an, wenn nah genug |

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
index.html                              # Gesamte App (HTML + CSS + JS + A-Frame-Scene)
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
| `#intro-overlay` / `#complete-overlay` | Start- und Abschluss-Screens |
| `#palette-1/2/3` | Interaktive Paletten-Zonen |
| `paket-A1` … `paket-A5` | Interaktive Pakete (Regal A) |

## Debugging

- `F2` im Browser: Kollisionsboxen als rote transparente Quader einblenden/ausblenden
- Alle Pakete haben `class="interactable paket"`, Paletten `class="interactable palette-zone"`

## Offene Punkte / Roadmap

- **Szenario 2** ist vorbereitet (Büro-Computer zeigt "coming soon...") — noch nicht implementiert
- Nur `index.html` deployen (keine Abhängigkeiten außer A-Frame CDN + lokale `.glb`-Dateien)
