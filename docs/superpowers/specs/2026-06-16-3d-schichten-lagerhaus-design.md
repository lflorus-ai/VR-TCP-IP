# Design: 3D-Schichten-Lagerhaus

**Datum:** 2026-06-16  
**Status:** Approved  
**Scope:** Vollständiger Umbau der P2-Szenarien von 2D-Overlays zu physischen 3D-Räumen in A-Frame

---

## Ziel

Alle P2-Lernszenarien werden als echte 3D-Räume innerhalb der bestehenden A-Frame-Szene umgesetzt. Keine vollflächigen 2D-Overlays mehr für Lerninteraktionen. Der Spieler navigiert physisch durch das Lagerhaus und interagiert mit 3D-Objekten.

---

## Raumstruktur

Die bestehende Haupthalle (Internet-Layer, Schicht 2) bildet den Mittelpunkt. Drei neue Flügel docken über Türöffnungen an:

```
                    ┌─────────────────┐
                    │  SCHICHT 4      │
                    │  Anwendungs-    │
                    │  flügel         │
                    │  HTTP·DNS·FTP   │
                    └────────┬────────┘
                             │ Tür Nord
┌───────────────┐   ┌────────┴────────┐   ┌────────────────┐
│  SCHICHT 1    │   │  SCHICHT 2      │   │  SCHICHT 3     │
│  Netzzugang   ├───┤  HAUPTHALLE     ├───┤  Transport-    │
│  Flügel       │Tür│  (bestehend)    │Tür│  flügel        │
│  (Empfehlung) │West  IP-Sortierung  │Ost│  TCP · UDP     │
└───────────────┘   └────────┬────────┘   └────────────────┘
                             │
                          Eingang Süd
                       (Tutorial S0, bleibt)
```

### Koordinatensystem (A-Frame)

Die bestehende Halle liegt bei ca. x: –7 bis +7, z: –16 bis +4.

| Flügel | Position (Zentrum) | Größe (B×T) |
|---|---|---|
| Haupthalle (bestehend) | x:0, z:–6 | 14×20 |
| Transport-Flügel (Ost) | x:18, z:–6 | 14×20 |
| Anwendungs-Flügel (Nord) | x:0, z:–28 | 14×20 |
| Netzzugang-Flügel (West) | x:–18, z:–6 | 14×20 |

Türöffnungen:
- Ost-Tür (→ Transport): x:7, z:–6 (Lücke in der Ostwand der Haupthalle)
- Nord-Tür (→ Anwendung): x:0, z:–16 (Lücke in der Nordwand der Haupthalle)
- West-Tür (→ Netzzugang): x:–7, z:–6 (Lücke in der Westwand der Haupthalle)

---

## Schicht 2 — Internet-Flügel (Haupthalle, bestehend)

**Änderungen am Bestand:** minimal.

- Türöffnungen in Ost-, Nord- und Westwand einbauen (Wand-Segmente um Lücken aufteilen)
- Türrahmen-Entities mit Schicht-Beschriftung (`<a-text>` über Durchgang)
- Routing-Schild/Übersichtstafel an der Eingangswand: zeigt alle 4 Schichten
- Bestehende IP-Sortier-Mechanik bleibt vollständig erhalten
- Neuer State `P2_S2_ACTIVE` (Internet-Routing-Szenario) ersetzt den alten S1-State

---

## Schicht 3 — Transport-Flügel (Ost) — vollständig bauen

### Metapher

Versandhalle mit zwei Förderbändern. TCP-Band: blau, langsam, mit Scan-Animation (Bestätigungs-Leuchte). UDP-Band: orange, schnell, keine Bestätigung.

### Raumgestaltung (A-Frame-Entities)

- Boden: dunkles Industriegrau (analog `m-boden`)
- Decke + Wände: analog Haupthalle
- Beleuchtung: blaues Spotlicht über TCP-Band, oranges über UDP-Band
- Zwei Förderbandmaschinen (je 3 `<a-box>`-Segmente): sichtbar animierter Streifen (`animation` property, `position.z` Loop)
- Paket-Ablage-Tisch am Eingang: 6 Pakete mit Aufklebern (z.B. `<a-text>` auf der Paket-Box)
- Beschriftungsschilder über jedem Band (`<a-plane>` + `<a-text>`)
- Info-Kiosk-Terminal (vor dem Eingang): erklärt TCP/UDP beim Annähern
- Quiz-Terminal am Ausgang: entsperrt sich nach korrekter Paketsortierung

### Paket-Labels (Sortieraufgabe)

| Paket | Korrekte Zuordnung | Begründung |
|---|---|---|
| Video-Stream | UDP | Latenz wichtiger als Vollständigkeit |
| Datei-Download | TCP | Vollständigkeit zwingend |
| Online-Game (Inputs) | UDP | Echtzeit, Verlust tolerierbar |
| E-Mail-Anhang | TCP | Datei muss vollständig ankommen |
| DNS-Anfrage | UDP | Kurze Anfrage, schnell |
| HTTPS-Seite laden | TCP | Garantierte Zustellung |

### Interaktionsablauf

1. Spieler betritt Flügel durch Ost-Tür
2. Info-Kiosk leuchtet auf → E drücken → TCP/UDP-Erklärung erscheint als 3D-Text auf der Tafel
3. Spieler hebt Pakete vom Tisch auf (E-Taste, bestehende Mechanik)
4. Spieler trägt Paket zum richtigen Band und legt es ab (E über Band-Dropzone)
5. Feedback: Paket leuchtet grün/rot, `+100`/`–20` Punkte wie bisher
6. Nach 6 korrekten Zuordnungen: Quiz-Terminal entsperrt sich (Türrahmen-Licht wechselt auf grün)
7. Quiz: 4 Antwort-Boxen im Raum, Spieler schaut drauf + drückt E
8. Nach Quiz: Tür zurück zur Haupthalle öffnet sich

---

## Schicht 4 — Anwendungs-Flügel (Nord) — vollständig bauen

### Metapher

Büro-/Empfangsbereich. Eingehende Bestellungen (HTTP-Requests, DNS-Anfragen, FTP-Transfers) kommen per Paket rein und müssen an den richtigen Dienst-Briefkasten weitergeleitet werden.

### Raumgestaltung (A-Frame-Entities)

- Boden: helleres Grau, Büro-Feeling
- Schreibtische aus `<a-box>` (2–3 Stück)
- 4 Briefkasten-Regale an der Nordwand: HTTP (blau), DNS (gelb), FTP (grün), SMTP (orange)
- Jedes Regal hat ein Schild mit kurzem Protokoll-Label
- Pakete auf dem Empfangstresen (Eingang)
- Info-Tafel an der Eingangswand: Was ist die Anwendungsschicht?
- Quiz-Terminal (rechte Wand), entsperrt nach Sortierung

### Paket-Labels (Sortieraufgabe)

| Paket | Korrekte Zuordnung |
|---|---|
| „Webseite laden" | HTTP |
| „Domain → IP auflösen" | DNS |
| „Datei hochladen (Server)" | FTP |
| „E-Mail senden" | SMTP |
| „API-Request (JSON)" | HTTP |
| „Mail-Server Adresse finden" | DNS |

### Interaktionsablauf

Analog Transport-Flügel:
1. Info-Tafel lesen (Proximity + E)
2. 6 Pakete aufheben und in richtigen Briefkasten legen
3. Quiz-Terminal entsperrt sich → Quiz in 3D
4. Abschluss → Tür zurück zur Haupthalle

---

## Schicht 1 — Netzzugang-Flügel (West) — Empfehlung

Kein Code in diesem Sprint. Empfehlung für spätere Umsetzung:

**Metapher:** Maschinenraum / Kabelkeller. Hier liegt alles, was physisch mit dem Netz verbindet.

**Raumgestaltung (Vorschlag):**
- Dicker Kabel-"Baum" aus `<a-cylinder>`-Entities hängt von der Decke
- Switch-Modell (aus `<a-box>`-Segmenten) mit blinkendem LED-Licht (`animation` auf `emissiveIntensity`)
- Regale mit beschrifteten Ethernet-Frame-Kisten
- Info-Kiosks: MAC-Adresse, Ethernet-Frame-Struktur, WLAN vs. Kabel

**Lernziele:**
- Physische vs. logische Adressierung (MAC vs. IP)
- Was ist ein Ethernet-Frame?
- CSMA/CD als Metapher: Zwei Pakete auf demselben Kabel = Kollision

---

## Technische Mechaniken

### Kiosk-/Tafel-Pattern

Ersetzt alle 2D-Overlays für Lerninhalt:

```js
// Pseudo-Struktur für Info-Kiosk
<a-entity id="kiosk-tcp" position="..." class="interactable kiosk">
  <a-box .../>                          // Gehäuse
  <a-plane id="kiosk-tcp-screen" .../>  // Screen-Fläche
  <a-text id="kiosk-tcp-text" visible="false" .../>  // Inhalt, default hidden
</a-entity>
```

Proximity-Trigger analog `computer-proximity` in `components.js`. E-Taste togglet `<a-text visible>`.

### Quiz-Pattern in 3D

```
┌──────────────────────────────────────┐
│  FRAGE: Welches Protokoll nutzt UDP? │  ← a-plane + a-text
└──────────────────────────────────────┘
  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
  │  HTTP  │  │  DNS   │  │  FTP   │  │  SMTP  │   ← a-box entities
  └────────┘  └────────┘  └────────┘  └────────┘
    class="quiz-option" data-correct="false/true"
```

Raycaster-Highlight (bestehend) + E-Taste → `correct`-Klasse prüfen → grün/rot + Punkte.

### Türen / Zone-Transition

- Türrahmen als `<a-entity>` mit `class="zone-door" data-target="transport"`
- Unsichtbare Trigger-Box in der Durchgangsöffnung
- Spieler läuft durch → `gameState` wechselt auf `P2_S3_ACTIVE` (Transport) bzw. `P2_S4_ACTIVE` (Anwendung)
- Tür-Animation: `<a-box>` Türblatt rotiert 90° per `animation__open`

### State Machine (Erweiterung game.js)

Neue States ergänzen die bestehende Maschine. Benennung nach Schicht-Nummer um Konflikt mit alten Szenario-States (S1_ACTIVE, S2_ACTIVE …) zu vermeiden:

```
TUTORIAL → ZONE_INTERNET  (Haupthalle, bestehende IP-Sortierung)
         → ZONE_TRANSPORT  (Transport-Flügel, TCP/UDP-Sortierung)
         → ZONE_ANWENDUNG  (Anwendungs-Flügel, Protokoll-Briefkästen)
         → FINAL
```

Schicht-1-Flügel bekommt vorerst keinen State — Tür bleibt verschlossen (visuell markiert als „coming soon").

### Szenario-Module

Bestehende `js/scenarios/p2-s*.js` werden ersetzt. Neue Module:

| Datei | Inhalt |
|---|---|
| `js/scenarios/layer3-transport.js` | Transport-Flügel: Paket-Sortierung + Quiz |
| `js/scenarios/layer4-anwendung.js` | Anwendungs-Flügel: Protokoll-Briefkästen + Quiz |

Neue Dateinamen (layer3/layer4) vermeiden Verwechslung mit den alten p2-s3-*/p2-s4-*-Modulen, die entfernt werden.

Modul-API bleibt gleich: `init(onComplete)`, `teardown()`, `getScore()`.

### Was entfällt

- `#p2-s1-overlay`, `#p2-s2-overlay`, `#p2-s3-overlay`, `#p2-s4-overlay` aus `index.html` entfernen
- Zugehörige CSS-Blöcke in `style.css` entfernen
- `js/scenarios/p2-s1-layers.js`, `p2-s2-protocols.js`, `p2-s3-tcpudp.js`, `p2-s4-addressing.js` ersetzen (nicht ergänzen)

---

## Nicht in diesem Sprint

- Netzzugang-Flügel (Schicht 1): nur Empfehlung oben, kein Code
- P2 S5 Routing und P2 S6 Assessment: separate Planung nach diesem Sprint
- VR-Controller-Support (Oculus/Quest): Raycaster-Interaktion ist Maus/Keyboard-first
