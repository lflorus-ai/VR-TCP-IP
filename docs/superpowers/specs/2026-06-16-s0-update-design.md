# S0-Update: Hallenplan + Lernziele im Intro-Overlay

**Datum:** 2026-06-16  
**Status:** Genehmigt

## Ziel

Das bestehende `#tutorial-start-overlay` wird um zwei Elemente erweitert:
1. Einen SVG-Grundriss der Lagerhalle (4 Zonen = 4 TCP/IP-Schichten)
2. Die 5 Lernziele (LZ1–LZ5) mit Stichwort + Kurzbeschreibung

Kein neuer Game-State, kein neues Szenario-Modul — nur Overlay-Erweiterung.

## Entscheidungen

| Frage | Entscheidung |
|---|---|
| Layout | 2-Spalten kompakt (Hallenplan links, Lernziele rechts) |
| Hallenplan | SVG-Grundriss mit 4 Zonen + Eingang |
| Lernziele | LZ-Badge + Kurzbeschreibung (mittleres Detail) |

## Design

### Overlay-Struktur (nach Update)

```
#tutorial-start-overlay
└── .overlay-box
    ├── .overlay-tag          "Steuer-Tutorial · Einführung"
    ├── .overlay-avatar       👷
    ├── .overlay-title        "Willkommen im TCP/IP-Lagerhaus!"
    ├── .overlay-body         Max-Text (gekürzt, mit Schichtenmodell-Bezug)
    ├── .s0-two-col           (neu, CSS-Grid 2 Spalten)
    │   ├── .s0-map-box       Hallenplan-Container
    │   │   ├── .s0-map-label "🗺 Hallenplan"
    │   │   └── svg#s0-map    SVG-Grundriss
    │   └── .s0-lz-box        Lernziele-Container
    │       ├── .s0-lz-label  "🎯 Lernziele"
    │       └── .s0-lz-list   5 × .s0-lz-item (.s0-lz-badge + span)
    └── #tutorial-start-btn   "Tutorial starten →" (unverändert)
```

### Max-Text (neu, gekürzt)

> Ich bin **Max**, dein Lagerleiter. Diese Halle bildet das **TCP/IP-Schichtenmodell** nach — vier Bereiche, vier Schichten. Ich führe dich kurz durch die Steuerung.

### SVG-Grundriss (`svg#s0-map`)

- `viewBox="0 0 180 128"`, `width: 100%`, `height: auto`
- Außenrahmen: abgerundetes Rechteck, Farbe `rgba(100,160,255,0.25)`
- Eingang: kleines Rechteck unten Mitte, beschriftet mit "Eingang"
- 4 Zonen, je als `<rect>` mit farbiger Füllung + Stroke:

| Zone | Position | Farbe | Inhalt |
|---|---|---|---|
| Anwendung | oben links | `#50e0a0` (grün) | Schicht 4 · 📱 |
| Transport | oben rechts | `#64a0ff` (blau) | Schicht 3 · 🔗 |
| Internet | unten links | `#f5c518` (gelb) | Schicht 2 · 🌐 |
| Netzzugang | unten rechts | `#ff7850` (orange) | Schicht 1 · 📡 |

### Lernziele (`.s0-lz-list`)

| Badge | Text |
|---|---|
| LZ1 | Architektur TCP/IP-Modell verstehen |
| LZ2 | Weg eines Datenpakets nachvollziehen |
| LZ3 | Rolle von Routern & IP-Adressen |
| LZ4 | Internet-Schicht ↔ OSI Layer 3 zuordnen |
| LZ5 | Protokolle den TCP/IP-Schichten zuordnen |

Badge-Styling: `background: rgba(100,160,255,0.12)`, `color: #64a0ff`, `border-radius: 4px`

## Änderungen im Code

### `index.html`

- `.overlay-body` innerhalb `#tutorial-start-overlay`: Text kürzen
- Neues `.s0-two-col`-Div mit SVG + Lernziele nach `.overlay-body`, vor `#tutorial-start-btn` einfügen

### `css/style.css`

Neue CSS-Klassen am Ende der Datei:

```css
.s0-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
.s0-map-box { border: 1px solid rgba(245,197,24,0.35); border-radius: 10px; padding: 12px; }
.s0-map-label { font-size: 9px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #f5c518; margin-bottom: 8px; }
.s0-lz-box { border: 1px solid rgba(80,224,160,0.3); border-radius: 10px; padding: 12px; }
.s0-lz-label { font-size: 9px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #50e0a0; margin-bottom: 10px; }
.s0-lz-list { display: flex; flex-direction: column; gap: 7px; }
.s0-lz-item { display: flex; gap: 6px; align-items: flex-start; }
.s0-lz-badge { font-size: 9px; font-weight: 700; color: #64a0ff; background: rgba(100,160,255,0.12); border-radius: 4px; padding: 1px 5px; white-space: nowrap; margin-top: 1px; flex-shrink: 0; }
.s0-lz-item span { font-size: 10.5px; color: #c8d8f0; line-height: 1.4; }
@media (max-width: 480px) { .s0-two-col { grid-template-columns: 1fr; } }
```

### `js/game.js`

Keine Änderungen nötig — das Overlay wird wie bisher durch `#tutorial-start-btn` → `startTutorial()` geschlossen.

## Nicht in Scope

- Neuer Game-State
- Klickbare Hallenplan-Zonen (kommen mit P2 S0 Update falls gewünscht)
- Änderungen am Tutorial-Ablauf selbst
- `#tutorial-complete-overlay` bleibt unverändert

## Testkriterien

- Overlay erscheint beim Spielstart wie bisher
- Hallenplan-SVG wird korrekt skaliert (responsiv)
- Alle 5 Lernziele sind lesbar
- "Tutorial starten →" funktioniert weiterhin
- Auf kleinen Viewports (< 480px): `.s0-two-col` wechselt auf 1-Spalte (Media Query ist Teil der Implementierung)
