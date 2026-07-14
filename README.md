# VR-TCP/IP — Die Logistikhalle

Ein browserbasiertes 3D-Lernspiel, das **TCP/IP-Netzwerkkonzepte** über eine interaktive
Lagerhallen-Metapher vermittelt. Datenpakete werden zu echten Paketen, Netzwerkschichten
zu Hallenbereichen, Router zu Sortierstationen.

Entstanden als Seminararbeit (Integrationsseminar, Gruppe 08, DHBW Stuttgart WWI2023G).

- **VR-Anwendung** — auf [A-Frame](https://aframe.io/) / WebXR aufgebaut und damit grundsätzlich für immersives VR im Headset ausgelegt (Details und aktueller Stand: [VR-Modus](#vr-modus)).
- **Kein Build-Tool, kein Framework** — reines HTML/CSS/JavaScript.
- **Läuft auch ohne Headset** — im Desktop-Browser mit Maus + Tastatur voll spielbar.

---

## Schnellstart

Voraussetzung: [Node.js](https://nodejs.org/) **18+** (nur für den lokalen Dev-Server und die Tests — die App selbst braucht kein Node zur Laufzeit).

```bash
# 1. Repository klonen
git clone https://github.com/lflorus-ai/VR-TCP-IP.git
cd VR-TCP-IP

# 2. Dev-Abhängigkeiten installieren (serve + Playwright)
npm install

# 3. Dev-Server starten
npm run serve
```

Dann im Browser öffnen: **http://localhost:8080**

> Die App besteht nur aus statischen Dateien. Alternativ funktioniert **jeder** statische
> Webserver (`python3 -m http.server 8080`, VS Code Live Server, …). A-Frame wird zur
> Laufzeit vom CDN geladen — eine Internetverbindung ist beim ersten Start also nötig.

### Kommandos

| Kommando | Wirkung |
|---|---|
| `npm run serve` | Dev-Server auf http://localhost:8080 |
| `npm test` | Playwright-E2E-Tests headless ausführen |
| `npm run test:ui` | Playwright-Tests im interaktiven UI-Modus |

Playwright startet den Server bei Bedarf automatisch (`webServer` in [playwright.config.js](playwright.config.js)).

---

## Steuerung

| Eingabe | Aktion |
|---|---|
| `W` `A` `S` `D` | Bewegen |
| Maus | Umsehen (Klick ins Fenster aktiviert den Pointer-Lock) |
| `E` | Interagieren — Paket aufnehmen/ablegen, Tafel/Terminal aktivieren |
| `Leertaste` | Springen |
| `F2` | Debug: Kollisionsboxen ein-/ausblenden |

---

## VR-Modus

Die Anwendung ist auf A-Frame/WebXR aufgebaut — die Engine ist also grundsätzlich
VR-fähig und kann mit einem Headset immersiv gerendert werden.

**Aktueller Stand:** Der „Enter VR"-Button ist bewusst **deaktiviert**
(`vr-mode-ui="enabled: false"` am `<a-scene>` in [index.html](index.html)), aus zwei Gründen:

1. Die Spielinteraktionen (Paket aufnehmen/ablegen, Tafeln/Terminals) laufen derzeit
   über die **`E`-Taste** — es gibt noch keine VR-Controller-Bindings (Trigger/Laser-Pointer).
   Ohne Tastatur wäre das Spiel im Headset also nicht bedienbar.
2. Am Desktop (kein Headset) führt der Button ins Leere und verwirrt nur.

**VR aktivieren (für Weiterentwickler):** Das Attribut am `<a-scene>` auf
`vr-mode-ui="enabled: true"` setzen — dann erscheint der „Enter VR"-Button unten rechts.
Damit VR im Headset wirklich nutzbar wird, sind zusätzlich **VR-Controller-Interaktionen**
(Laser-Pointer + Trigger statt `E`) zu implementieren — ein sinnvoller nächster
Ausbauschritt. WebXR verlangt außerdem einen sicheren Kontext (**HTTPS** oder `localhost`
direkt auf dem Headset).

---

## Spielablauf

Beim Start wählt der Spieler einen **Durchlauf-Modus** (für die Sitzung fix):

- **Geführter Durchlauf** — die Szenarien laufen in fester Reihenfolge (S1 → S5).
  Jeder Raum ist gesperrt, bis die vorherige Aufgabe abgeschlossen ist (physische Türen/Gates).
- **Freier Durchlauf** — die Szenarien sind frei anwählbar (grüne Start-Knöpfe in der Halle).

Nach allen Lern-Szenarien kann optional ein **Assessment** (Lernkontrolle über alle Zonen)
absolviert werden.

### Lernpfad

Das Curriculum deckt das gesamte TCP/IP-Schichtenmodell ab (~22 Min):

| ID | Titel | Lernziel | Interaktion |
|---|---|---|---|
| **S0** | Die Logistikhalle | Orientierung + Aktivierung | SVG-Hallenplan, 5 Lernziele |
| **S1** | Vier Bereiche, vier Schichten | Architektur des TCP/IP-Modells | Tafel-Quiz (Overlay) |
| **S2** | Protokolle der Transportschicht | Protokolle den Schichten zuordnen | Tafel-Quiz (Overlay) |
| **S3** | TCP/UDP in der Lagerhalle | TCP vs. UDP unterscheiden | Pakete auf TCP-/UDP-Förderband ablegen |
| **S4** | HTTP/DNS/FTP/SMTP-Briefkästen | IP-Adressen + OSI-Mapping | Pakete in Protokoll-Briefkästen + Quiz-Terminal |
| **S5** | Paket auf Reise: Routing | Routing + Paketverlauf | Pakete anhand IP-Adresse sortieren |

**Die fünf Lernziele:**

1. Grundlegende Architektur des TCP/IP-Modells verstehen
2. Weg eines Datenpakets durch ein Netzwerk nachvollziehen
3. Rolle von Routern und IP-Adressen bei der Weiterleitung
4. Internet-Schicht (TCP/IP) ↔ OSI-Netzwerkschicht (Layer 3) zuordnen
5. Typische Protokolle den jeweiligen TCP/IP-Schichten zuordnen

---

## Projektstruktur

```
index.html                     # HTML-Struktur, A-Frame-Scene, alle Overlays
css/style.css                  # Sämtliche UI-Styles (HUD, Overlays, Banner)
js/
  components.js                # A-Frame-Custom-Komponenten (Kollision, Sprung, NPC …)
  scenario-manager.js          # Zentrale Verwaltung: Modus, Fortschritt, Freischaltung
  game.js                      # State-Machine, Zone-Detection, Gates, Assessment-Logik
  scenarios/
    p2-s1-schichten.js         # S1: TCP/IP-Schichten (Tafel-Quiz)
    p2-s2-protokolle.js        # S2: Protokolle (Tafel-Quiz)
    p2-s3-transport.js         # S3: TCP/UDP-Förderband
    p2-s4-anwendung.js         # S4: Protokoll-Briefkästen + Quiz
    p2-s5-routing.js           # S5: IP-Routing / Paketsortierung
    p2-s6-assessment.js        # Assessment-Fortschritts-Tracker (ScenarioManager-Bindeglied)
tests/ui.spec.js               # Playwright-E2E-Tests
playwright.config.js           # Test-Konfiguration
*.glb                          # 3D-Modelle (LKW, Gabelstapler, NPC „Max")
```

---

## Technologie-Stack

| Komponente | Details |
|---|---|
| 3D-Renderer | A-Frame 1.7.1 (WebVR/WebXR), per CDN geladen |
| Sprache | Vanilla HTML/CSS/JavaScript — kein Build-Schritt |
| 3D-Assets | `.glb`-Modelle |
| Tests | Playwright (E2E) |
| Dev-Server | `serve` (statisch) |

---

## Architektur (für Weiterentwickler)

### State-Machine

Der Spielzustand wird in [js/game.js](js/game.js) als String-State geführt:

```
INTRO → TUTORIAL (S0) → S1_ACTIVE (Basis zwischen Szenarien)
      → ZONE_S1 / ZONE_S2   (Tafel-Quizze, per E an der Info-Tafel)
      → ZONE_S3 / ZONE_S4   (3D-Räume im Nordflügel, per Betreten)
      → ZONE_S5             (3D-Raum im Büro-Flügel)
      → FINAL               (Gesamtauswertung)
```

Jede Zone ist gegen mehrfaches Betreten gesichert. Im geführten Modus sperren **Gates**
(Kollisionsboxen + ausblendbare Tür-Entities) den Weg, bis die Vorgänger-Zone
abgeschlossen ist. Die Zone-Erkennung läuft über ein `setInterval`, das die
Spielerposition gegen definierte Raumgrenzen prüft.

### Raumgeometrie

```
         NORD (z=-30)
    ┌────────────────────┐
    │  ZONE_S4  │ ZONE_S3 │  Nordflügel (z < -16.5)
    │   x < 0   │  x ≥ 0  │
    ├───────────┴────────┤  z=-16: zwei Türen (x=4.5..7.5 rechts, x=-7.5..-4.5 links)
    │  Haupthalle        │
    │  ZONE_S5 (Büro,    │  Büro-Flügel: x < -12.5
    │  x < -12.5)        │
    └────────────────────┘  z=0: Eingang (Lücke x=-2..+2)
         SÜD (z=0)
```

### Szenario-Modul-API

Jedes Modul in `js/scenarios/` ist ein IIFE-Singleton, das einem einheitlichen Vertrag folgt:

```js
const P2SN = (() => {
  // interner State
  return {
    init(onComplete) { /* Szenario starten; onComplete(score) am Ende aufrufen */ },
    teardown()       { /* aufräumen beim Verlassen der Zone */ },
    getScore()       { return _score; },
  };
})();
```

Der zentrale [ScenarioManager](js/scenario-manager.js) kapselt Modus (`Mode.GUIDED` /
`Mode.FREE`), Fortschritt und Freischaltungslogik (`canEnter`). Er wird **vor** allen
Szenario-Modulen und **vor** `game.js` geladen, damit `Mode`, `BaseScenario` und
`ScenarioManager` als Globals bereitstehen.

### A-Frame-Custom-Komponenten

Definiert in [js/components.js](js/components.js):

| Komponente | Funktion |
|---|---|
| `collision-walls` | AABB/OBB-Kollisionserkennung für Wände/Regale |
| `auto-collider` | Berechnet OBB automatisch aus der GLTF-Bounding-Box |
| `jump-controls` | Sprung-Physik (Leertaste) |
| `proximity-dialog` | NPC „Max" spricht den Spieler bei Nähe an |
| `kiosk-interaction` | Proximity + E-Toggle für Info-Kioske |

### Ein neues Szenario hinzufügen

1. Modul unter `js/scenarios/p2-sN-name.js` nach dem IIFE-Muster oben anlegen.
2. Script-Tag in [index.html](index.html) **vor** `game.js` einbinden (mit Cache-Busting-Suffix, z.B. `?v=1`).
3. In [js/game.js](js/game.js) registrieren: Zone-Eintritt (`enterZoneSN`), Zone-Erkennung
   (Positions-Check im Interval), E-Handler und Nachfolge-Logik.
4. Zugehörige Overlays/3D-Entities in `index.html` und Styles in `css/style.css` ergänzen.
   Neue Overlays müssen im Display- **und** im Hidden-Selektor der CSS-Datei registriert werden.

> **Tipp:** Cache-Busting-Suffixe (`?v=N`) an den Script-Tags nach Änderungen hochzählen,
> damit der Browser die neue Version lädt.

---

## Tests

E2E-Tests liegen in [tests/ui.spec.js](tests/ui.spec.js) und treiben die App über Playwright.

```bash
npm test            # headless
npm run test:ui     # interaktiv
```

Beim ersten Lauf ggf. die Browser-Binaries installieren:

```bash
npx playwright install
```

---

## Deployment

Die App ist rein statisch. Zum Veröffentlichen reichen folgende Dateien auf jedem
Static-Hosting (GitHub Pages, Netlify, Vercel, beliebiger Webserver):

```
index.html   css/   js/   *.glb
```

Keine weiteren Laufzeit-Abhängigkeiten außer dem A-Frame-CDN.

---

## Team

Seminararbeit im Integrationsseminar — DHBW Stuttgart, Studiengang Wirtschaftsinformatik
(WWI2023G), Gruppe 08:

- Jan Rögner
- Luca Florus
- Mark Keller
- Andreas Cherbukhovskiy

## Lizenz & 3D-Modelle

Die 3D-Modelle (`.glb`) wurden als kostenlose Downloads von [Sketchfab](https://sketchfab.com/)
bezogen. Alle stehen unter der **Creative-Commons-Attribution-Lizenz (CC-BY 4.0)** — die
Namensnennung der Urheber ist damit verpflichtend:

| Modell | Datei | Urheber | Lizenz |
|---|---|---|---|
| [Warehouse Forklift Gameready](https://sketchfab.com/3d-models/warehouse-forklift-gameready-94e21059f00c4e989c6403ada034516e) | `warehouse_forklift_gameready.glb` | Kamran Mughal (@absologixemployee) | [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| [LCT 3000 '07 – Low poly model](https://sketchfab.com/3d-models/lct-3000-07-low-poly-model-3be03b6a43aa41898c9ca806b8787052) | `lct_3000_07-_low_poly_model.glb` | Daniel Zhabotinsky (@DanielZhabotinsky) | [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| [Stropalschik](https://sketchfab.com/3d-models/stropalschik-a9f0edc67f774faa829e74f3413255dd) | `stropalschik.glb` | tu_ugmk | [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
