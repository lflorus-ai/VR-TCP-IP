# Design: S1 polieren + S2 implementieren

**Datum:** 2026-05-12  
**Projekt:** VR-TCP/IP (Integrationsseminar Gruppe 08)  
**Datei:** `index.html` (gesamte App)

---

## Kontext

Das Spiel weicht in mehreren Punkten vom beschriebenen Szenario der Seminararbeit ab. Das PDF beschreibt einen Spielfluss mit Steuer-Szenario → Lern-S1 → Lern-S2 → Bewertungs-Szenario. Aktuell endet das Spiel nach Lern-S1 mit einem "coming soon"-Hinweis am Bürocomputer. Außerdem fehlen didaktisch wichtige Feedback-Elemente: Lieferschein-Durchstreichen, qualitative Avatarbewertung und das Paketverlust-Szenario (TCP-Neuübertragung).

**Ziel:** S1 auf die PDF-Spezifikation anheben und S2 (Paketverlust) vollständig implementieren. Das Bewertungs-Szenario bleibt aus Scope-Gründen für einen späteren Schritt.

---

## Spielfluss (neu)

```
Intro-Modal (unverändert)
  → Lern-S1: IP-Adressierung (verbessert)
  → S1-Abschluss-Overlay (+ qualitative Bewertung)
  → Max-Übergang: führt aktiv zu S2
  → Lern-S2: Paketverlust & Neuübertragung (neu)
  → S2-Abschluss: TCP-Erklärung
```

---

## S1 — Verbesserungen

### 1. Lieferschein: Durchstreichen abgeschlossener Einträge

Das Clipboard-HUD (links im Bild, aktuell als `#task-text`-Bereich und Progress-Pips realisiert) wird erweitert: statt nur Pips zeigt der Lieferschein-Abschnitt alle 5 Pakete als Listeneinträge.

- Gelieferte Pakete: `text-decoration: line-through`, Farbe `#50e0a0`, Häkchen rechts
- Aktuelles Paket: fett, weiß, `◀ jetzt`-Marker
- Noch nicht bearbeitete Pakete: grau, normal

**Wo:** Im bestehenden HUD-Panel `#task-text` oder als eigenständiger `#lieferschein-list`-Block innerhalb des HUD.

### 2. Max-Feedback bei jeder korrekten Lieferung

Aktuell: Audio-Ton + goldene Emissive-Farbe auf Paket.  
Neu: Max sagt zusätzlich einen rotierenden Lehr-Satz (Badge-Anzeige, 5 Sekunden):

```js
const maxFeedback = [
  "Richtig! Die ersten Oktette verraten das Zielnetz — wie eine Postleitzahl.",
  "Gut! 192.168.x.x → Klasse-C-Privat → LKW 1.",
  "Korrekt. 10.x.x.x ist ein Klasse-A-Privatnetz → LKW 2.",
  "Genau! 172.16–31.x.x → Klasse-B-Privat → LKW 3.",
];
```

Aufruf in der bestehenden `deliverPackage()`-Funktion, nach dem Punkte-Update.

### 3. S1-Abschluss: Qualitative Bewertung

Das `#complete-overlay` zeigt neben Score und Zeit eine Textbewertung:

| Score-Anteil | Bewertung | Text |
|---|---|---|
| 100% | **Perfekt** (gold) | „Alle IP-Netzwerke auf Anhieb erkannt!" |
| 70–99% | **Sehr gut** (grün) | „Fast fehlerfrei — gute Arbeit." |
| 40–69% | **Gut** (blau) | „IP-Grundlagen sitzen, weiter üben." |
| <40% | **Weiter üben** (grau) | „Schau dir die Netzklassen nochmal an." |

Max-Kommentar: Score-Schwelle bestimmt auch welchen Satz Max in `showNPCBriefing()` beim Abschluss sagt.

---

## S1 → S2 Übergang

Nach Klick auf „Weiter zu Szenario 2" im Complete-Overlay:

1. Overlay wird ausgeblendet
2. Max-Badge erscheint (7 Sek.): *„Warte! Der Empfänger meldet ein Problem — schau am Computer im Büro nach."*
3. Bürocomputer-Monitor beginnt rot zu pulsen (A-Frame `animation` auf `emissive`, alternating red/dark, 4 Loops dann dauerhaft rot-gedimmt)
4. Grüner Glow-Halo über dem Büroeingang (neues Entity `#office-glow`)
5. HUD-Tag (`#hud-tag`) wechselt auf `"Lern-Szenario 2 — Paketverlust"`
6. Neuer `gameState = 'S2_BRIEFING'`

---

## S2 — Neue Mechanik

### Spielstand-Maschine (Ergänzung)

```
INTRO → S1_ACTIVE → S1_COMPLETE → S2_BRIEFING → S2_ACTIVE → S2_COMPLETE
```

Neue Variable: `let gameState = 'INTRO'` (ersetzt bisheriges `gameActive`-Flag).

### S2-Start (Proximity am Bürocomputer)

Der bestehende `proximity-dialog`-Mechanismus wird für den Bürocomputer erweitert (neues Target: `#office-computer`). Bei Annäherung auf <3 Einheiten:

- Nur wenn `gameState === 'S2_BRIEFING'`
- Computer-Screen-Text wird dynamisch auf die verlorenen Pakete gesetzt
- `gameState = 'S2_ACTIVE'`
- Computer zeigt: welche 1–2 Pakete verloren gingen, dass sie in Regal B liegen

### Paketverlust-Logik

```js
// Am Ende von S1: 1-2 zufällige gelieferte Pakete als "verloren" markieren
function initS2() {
  const delivered = lieferschein.filter(p => p.done);
  const lostCount = delivered.length >= 3 ? 2 : 1;
  s2LostPackets = shuffle(delivered).slice(0, lostCount);
  s2LostPackets.forEach(p => p.done = false);
}
```

### Paket-Respawn in Regal B

Die verlorenen Pakete spawnen als neue interaktierbare Entities in Regal B (Positionen: freie Slots auf Shelf-Ebene 1.2 oder 2.42). Gleiche `class="interactable paket"`, gleiche E-Taste-Mechanik wie S1.

- Keine neuen IPs — dieselben Pakete wie in S1 (gleiche `data-id`, gleiche `data-ip`)
- Regal B erhält visuellen Marker: grüner Pfeil/Glow über den neu gespawnten Paketen

### Bürocomputer-Screen (dynamisch)

```js
function renderComputerScreen(lostPackets) {
  // Zeigt alle S1-Pakete als Liste
  // Verlorene: rot + "✗ VERLOREN — Neuübertragung nötig"
  // Empfangene: grün + "✓ angekommen"
  // Letzter Eintrag: "→ Paket [ID] liegt in Regal B. [E zum Schließen]"
}
```

Wird in das bestehende Office-Monitor-Entity als `<a-text>`-Komponente oder als Texture (Canvas) eingebettet.

### S2-Abschluss

Wenn alle verlorenen Pakete korrekt neu geliefert:

- Neues `#s2-complete-overlay` (identisches Design wie S1-Overlay)
- Titel: „Neuübertragung erfolgreich!"
- Max erklärt: *„Genau so funktioniert TCP: Fehlende Pakete werden automatisch erkannt und erneut gesendet — das nennt man Retransmission."*
- Score-Addition: +50 pro richtig neu geliefertem Paket, –10 bei Fehler
- Button: „Abschließen" (schließt Overlay, Spiel endet)

---

## Nicht in Scope

- Steuer-Szenario (Tutorial mit Avatar-geführter Navigation)
- Bewertungs-Szenario (erhöhte Komplexität, Avatar Markus)
- BITV 2.0 Farbaccessibility (Rot/Grün-Problem) — separater Task
- Szenario-Wiederholung / nicht-linearer Fortschritt

---

## Zu ändernde Dateien

| Datei | Was ändert sich |
|---|---|
| `index.html` | Alles — HTML-Struktur (neue Overlays, Regal-B-Slots, Computer-Entity), CSS (Lieferschein-Styles), JS (gameState-Maschine, S2-Logik, Max-Feedback-Pool, renderComputerScreen) |

Keine weiteren Dateien.

---

## Verifikation

1. S1 spielen — nach jeder richtigen Lieferung prüfen ob Lieferschein-Eintrag durchgestrichen wird
2. S1 abschließen — Qualitätsbewertung prüfen (einmal mit 100%, einmal mit Fehlern)
3. „Weiter zu S2" klicken — Max-Badge erscheint, Computer blinkt rot, Glow am Büroeingang
4. Zum Computer gehen — S2-Fehlermeldung erscheint mit korrekten Paketnummern
5. Verlorene Pakete in Regal B finden, korrekt einlegen — S2-Abschluss erscheint
6. Verlorenes Paket falsch einlegen — Strafpunkte, kein S2-Abschluss
