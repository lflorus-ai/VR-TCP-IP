# 3D-Schichten-Lagerhaus Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all 2D overlay P2-scenarios with physical 3D rooms (Transport-Flügel + Anwendungs-Flügel) built directly into the existing A-Frame warehouse scene.

**Architecture:** The existing main hall (IP-sorting, Internet-Layer) stays unchanged. A new North Wing (24×14m) is added behind the back wall: right half = Transport-Flügel (Schicht 3, TCP/UDP), left half = Anwendungs-Flügel (Schicht 4, HTTP/DNS/FTP/SMTP). The player walks through a central door in the back wall to enter the wing. Zone entry is detected by player position. Each zone has an IIFE module (`layer3-transport.js`, `layer4-anwendung.js`) that handles package pickup/drop and quiz interactions via delegation from game.js.

**Tech Stack:** A-Frame 1.7.1, Vanilla JS, Playwright (tests), no build tools.

---

## Existing Geometry Reference

```
Main Hall:   x: -12..+12,  z: 0..-16,  h: 6.1
Back wall:   position="0 3 -16" width="24" height="6.1" depth="0.3"  ← split for door
Versandraum: x: +12..+22,  z: -4..-14              ← palettes here, DO NOT TOUCH
Left Office: x: -22..-12,  z: -2..-10              ← Netzzugang (recommendation only)
```

New North Wing:
```
x: -12..+12,  z: -16..-30  (24m wide, 14m deep)
Transport sub-zone:  x: 0..+12  (right)
Anwendung sub-zone:  x: -12..0  (left)
```

---

## File Map

| Action | File | What changes |
|---|---|---|
| Modify | `CLAUDE.md` | Update arch, states, scenario files table |
| Modify | `index.html` | Remove old P2 overlays; add back-wall door; add North Wing geometry + all zone entities |
| Modify | `css/style.css` | Remove P2 overlay CSS blocks |
| Modify | `js/game.js` | Add ZONE_TRANSPORT/ZONE_ANWENDUNG states, zone detection, E-key delegation |
| Modify | `js/components.js` | Add `kiosk-interaction` component |
| Create | `js/scenarios/layer3-transport.js` | Transport-Flügel IIFE module |
| Create | `js/scenarios/layer4-anwendung.js` | Anwendungs-Flügel IIFE module |
| Modify | `tests/ui.spec.js` | Remove old P2S2 overlay tests; add L3/L4 zone tests |
| Delete | `js/scenarios/p2-s1-layers.js` | Replaced |
| Delete | `js/scenarios/p2-s2-protocols.js` | Replaced |
| Delete | `js/scenarios/p2-s3-tcpudp.js` | Replaced |
| Delete | `js/scenarios/p2-s4-addressing.js` | Replaced |

---

## Task 1: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update Lernpfad-Tabelle, Dateistruktur und State-Machine**

Replace the P2-Szenario rows and State-Machine section in CLAUDE.md. The updated sections:

Lernpfad-Tabelle (replace S1–S4 rows):
```markdown
| **P2 S3** | Lern | Transport-Flügel: TCP vs. UDP | 5 Min | LZ5 | ✅ 3D — Förderbänder + Paketsortierung (`js/scenarios/layer3-transport.js`) |
| **P2 S4** | Lern | Anwendungs-Flügel: HTTP, DNS, FTP, SMTP | 5 Min | LZ5 | ✅ 3D — Briefkästen + Paketsortierung (`js/scenarios/layer4-anwendung.js`) |
```

State Machine (replace P2_S*_ACTIVE entries):
```
TUTORIAL → S1_ACTIVE (Haupthalle/Internet, bestehend)
         → ZONE_TRANSPORT (Transport-Flügel, player.x >= 0 && player.z < -16)
         → ZONE_ANWENDUNG (Anwendungs-Flügel, player.x < 0 && player.z < -16)
         → FINAL
```

Neue Szenario-Module:
```
js/scenarios/layer3-transport.js   # Transport-Flügel: TCP/UDP-Sortierung + Quiz
js/scenarios/layer4-anwendung.js   # Anwendungs-Flügel: Protokoll-Briefkästen + Quiz
```

Interaktionsmuster (add):
```markdown
| Layer 3 | Paket zu Förderband tragen (E-Mechanik) | class="interactable paket-l3" / belt-zone |
| Layer 4 | Paket zu Briefkasten tragen (E-Mechanik) | class="interactable paket-l4" / inbox-zone |
| Kiosk   | Nähern + E drücken (kiosk-interaction)  | kiosk-interaction component in components.js |
| Quiz    | 3D-Boxen anvisieren + E drücken         | class="interactable quiz-option-l3/l4" |
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: CLAUDE.md auf 3D-Zonen-Architektur aktualisieren"
```

---

## Task 2: Remove Old P2 2D Overlay Code

**Files:**
- Modify: `index.html` (remove 4 overlay divs + 4 script tags)
- Modify: `css/style.css` (remove P2 overlay CSS)
- Modify: `tests/ui.spec.js` (remove P2S2 overlay tests, lines ~140–215)
- Delete: `js/scenarios/p2-s1-layers.js`, `p2-s2-protocols.js`, `p2-s3-tcpudp.js`, `p2-s4-addressing.js`

- [ ] **Step 1: Remove overlay divs from index.html**

Remove these four `<div>` blocks (search by their IDs):
- `<div id="p2-s1-overlay" ...>` and its entire closing `</div>`
- `<div id="p2-s2-overlay" ...>` and its entire closing `</div>`
- `<div id="p2-s3-overlay" ...>` and its entire closing `</div>`
- `<div id="p2-s4-overlay" ...>` and its entire closing `</div>`

- [ ] **Step 2: Remove script tags from index.html**

Remove these four `<script>` lines from the bottom of index.html:
```html
<script src="js/scenarios/p2-s1-layers.js?v=1"></script>
<script src="js/scenarios/p2-s2-protocols.js?v=1"></script>
<script src="js/scenarios/p2-s3-tcpudp.js?v=1"></script>
<script src="js/scenarios/p2-s4-addressing.js?v=1"></script>
```

- [ ] **Step 3: Remove P2 overlay CSS from style.css**

Remove all CSS rule blocks that start with `.p2s1-`, `.p2s2-`, `.p2s3-`, `.p2s4-`, `#p2-s1-overlay`, `#p2-s2-overlay`, `#p2-s3-overlay`, `#p2-s4-overlay`.

Also remove these two IDs from the `position:fixed;display:flex` selector (~line 65) and from the `.hidden` selector (~line 75):
- `#p2-s1-overlay`
- `#p2-s2-overlay`
- `#p2-s3-overlay`
- `#p2-s4-overlay`

- [ ] **Step 4: Remove P2S2 test block from tests/ui.spec.js**

Remove the entire `test.describe('P2 S2 — Drag & Drop Protokoll-Zuordnung', ...)` block (roughly lines 140–215 in the current file).

- [ ] **Step 5: Delete old scenario JS files**

```bash
rm js/scenarios/p2-s1-layers.js js/scenarios/p2-s2-protocols.js \
   js/scenarios/p2-s3-tcpudp.js js/scenarios/p2-s4-addressing.js
```

- [ ] **Step 6: Run existing tests to verify nothing is broken**

```bash
npm test
```

Expected: all remaining tests pass (Intro/HUD, Paket-Daten, IP-Logik tests).

- [ ] **Step 7: Commit**

```bash
git add index.html css/style.css tests/ui.spec.js
git rm js/scenarios/p2-s1-layers.js js/scenarios/p2-s2-protocols.js \
       js/scenarios/p2-s3-tcpudp.js js/scenarios/p2-s4-addressing.js
git commit -m "refactor: entferne alte P2-2D-Overlays und veraltete Szenario-Module"
```

---

## Task 3: Write Failing Tests for L3 and L4 Modules

**Files:**
- Modify: `tests/ui.spec.js`

- [ ] **Step 1: Add L3 + L4 test blocks at the end of tests/ui.spec.js**

```js
test.describe('Layer 3 — Transport-Flügel (TCP/UDP)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Skip tutorial to access zone modules
    await page.evaluate(() => {
      gameState = 'S1_ACTIVE';
    });
  });

  test('L3-Pakete sind im DOM mit data-protocol Attributen', async ({ page }) => {
    const packets = [
      { id: 'l3-paket-1', protocol: 'udp'  },
      { id: 'l3-paket-2', protocol: 'tcp'  },
      { id: 'l3-paket-3', protocol: 'udp'  },
      { id: 'l3-paket-4', protocol: 'tcp'  },
      { id: 'l3-paket-5', protocol: 'udp'  },
      { id: 'l3-paket-6', protocol: 'tcp'  },
    ];
    for (const p of packets) {
      const el = page.locator(`#${p.id}`);
      await expect(el).toBeAttached();
      const proto = await el.getAttribute('data-protocol');
      expect(proto).toBe(p.protocol);
    }
  });

  test('Korrekte Zuordnung gibt +100 Punkte', async ({ page }) => {
    await page.evaluate(() => L3.init(() => {}));
    const before = await page.evaluate(() => L3.getScore());
    await page.evaluate(() => L3._dropForTest('l3-paket-1', 'udp')); // udp → udp belt
    const after = await page.evaluate(() => L3.getScore());
    expect(after).toBe(before + 100);
  });

  test('Falsche Zuordnung gibt -20 Punkte', async ({ page }) => {
    await page.evaluate(() => L3.init(() => {}));
    const before = await page.evaluate(() => L3.getScore());
    await page.evaluate(() => L3._dropForTest('l3-paket-2', 'udp')); // tcp → udp belt (wrong)
    const after = await page.evaluate(() => L3.getScore());
    expect(after).toBe(before - 20);
  });

  test('Alle 6 korrekt zugeordnet entsperrt Quiz', async ({ page }) => {
    await page.evaluate(() => L3.init(() => {}));
    await page.evaluate(() => {
      L3._dropForTest('l3-paket-1', 'udp'); // udp
      L3._dropForTest('l3-paket-2', 'tcp'); // tcp
      L3._dropForTest('l3-paket-3', 'udp'); // udp
      L3._dropForTest('l3-paket-4', 'tcp'); // tcp
      L3._dropForTest('l3-paket-5', 'udp'); // udp
      L3._dropForTest('l3-paket-6', 'tcp'); // tcp
    });
    const quizVisible = await page.evaluate(() => {
      const t = document.getElementById('l3-quiz-terminal');
      return t && t.getAttribute('visible') !== 'false';
    });
    expect(quizVisible).toBe(true);
  });

  test('Korrektes Quiz-Answer ruft onComplete auf', async ({ page }) => {
    await page.evaluate(() => {
      let called = false;
      L3.init(() => { called = true; window.__l3Complete = true; });
      L3._dropForTest('l3-paket-1', 'udp');
      L3._dropForTest('l3-paket-2', 'tcp');
      L3._dropForTest('l3-paket-3', 'udp');
      L3._dropForTest('l3-paket-4', 'tcp');
      L3._dropForTest('l3-paket-5', 'udp');
      L3._dropForTest('l3-paket-6', 'tcp');
    });
    await page.evaluate(() => L3._answerQuizForTest(true));
    const completed = await page.evaluate(() => window.__l3Complete);
    expect(completed).toBe(true);
  });
});

test.describe('Layer 4 — Anwendungs-Flügel (Protokolle)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => { gameState = 'S1_ACTIVE'; });
  });

  test('L4-Pakete sind im DOM mit data-protocol Attributen', async ({ page }) => {
    const packets = [
      { id: 'l4-paket-1', protocol: 'http'  },
      { id: 'l4-paket-2', protocol: 'dns'   },
      { id: 'l4-paket-3', protocol: 'ftp'   },
      { id: 'l4-paket-4', protocol: 'smtp'  },
      { id: 'l4-paket-5', protocol: 'http'  },
      { id: 'l4-paket-6', protocol: 'dns'   },
    ];
    for (const p of packets) {
      const el = page.locator(`#${p.id}`);
      await expect(el).toBeAttached();
      const proto = await el.getAttribute('data-protocol');
      expect(proto).toBe(p.protocol);
    }
  });

  test('Korrekte Zuordnung gibt +100 Punkte', async ({ page }) => {
    await page.evaluate(() => L4.init(() => {}));
    const before = await page.evaluate(() => L4.getScore());
    await page.evaluate(() => L4._dropForTest('l4-paket-1', 'http'));
    const after = await page.evaluate(() => L4.getScore());
    expect(after).toBe(before + 100);
  });

  test('Falsche Zuordnung gibt -20 Punkte', async ({ page }) => {
    await page.evaluate(() => L4.init(() => {}));
    const before = await page.evaluate(() => L4.getScore());
    await page.evaluate(() => L4._dropForTest('l4-paket-1', 'dns')); // http → dns (wrong)
    const after = await page.evaluate(() => L4.getScore());
    expect(after).toBe(before - 20);
  });

  test('Alle 6 korrekt → Quiz entsperrt', async ({ page }) => {
    await page.evaluate(() => L4.init(() => {}));
    await page.evaluate(() => {
      L4._dropForTest('l4-paket-1', 'http');
      L4._dropForTest('l4-paket-2', 'dns');
      L4._dropForTest('l4-paket-3', 'ftp');
      L4._dropForTest('l4-paket-4', 'smtp');
      L4._dropForTest('l4-paket-5', 'http');
      L4._dropForTest('l4-paket-6', 'dns');
    });
    const quizVisible = await page.evaluate(() => {
      const t = document.getElementById('l4-quiz-terminal');
      return t && t.getAttribute('visible') !== 'false';
    });
    expect(quizVisible).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- --grep "Layer 3|Layer 4"
```

Expected: FAIL — `L3 is not defined`, `L4 is not defined`, element not found.

---

## Task 4: Add North Wing Geometry to index.html

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Split the existing back wall at z=-16**

Find and replace:
```html
<a-box mixin="m-wand" position="0 3 -16"   width="24"   height="6.1" depth="0.3"  receive-shadow="true"></a-box>
```

Replace with (central 4m door gap at x=-2..+2):
```html
<!-- RÜCKWAND — aufgeteilt für Durchgang zum Nordflügel (x=-2..+2) -->
<a-box mixin="m-wand" position="-7 3 -16"    width="10" height="6.1" depth="0.3" receive-shadow="true"></a-box>
<a-box mixin="m-wand" position=" 7 3 -16"    width="10" height="6.1" depth="0.3" receive-shadow="true"></a-box>
<a-box mixin="m-wand" position=" 0 4.55 -16" width="4"  height="3.1" depth="0.3"></a-box>
<!-- Türpfosten Nordflügel -->
<a-box material="color:#555;roughness:0.5;metalness:0.4" position="-2 1.5 -16" width="0.12" height="3.0" depth="0.35"></a-box>
<a-box material="color:#555;roughness:0.5;metalness:0.4" position=" 2 1.5 -16" width="0.12" height="3.0" depth="0.35"></a-box>
<!-- Schild: Nordflügel-Eingang -->
<a-plane material="color:#1a2844;roughness:0.8" width="3.5" height="0.5" position="0 5.6 -15.8">
  <a-text value="NORDFLÜGEL — SCHICHTEN 3 + 4" color="#88aaff" scale="0.36 0.36 0.36"
          position="0 0 0.01" align="center" material="shader:flat;emissive:#88aaff;emissiveIntensity:0.3"></a-text>
</a-plane>
```

- [ ] **Step 2: Add North Wing shell (walls, floor, ceiling)**

Add directly after the Versandraum section (after `<!-- AUßENBEREICH -->`), before the NPC entity:

```html
<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<!-- NORDFLÜGEL (x=-12..+12, z=-16..-30)                                       -->
<!-- Rechte Hälfte (x=0..+12): SCHICHT 3 — Transport-Flügel                    -->
<!-- Linke Hälfte (x=-12..0): SCHICHT 4 — Anwendungs-Flügel                    -->
<!-- ═══════════════════════════════════════════════════════════════════════════ -->

<!-- Hülle -->
<a-box mixin="m-wand"  position=" 0 3 -30"   width="24"  height="6.1" depth="0.3"></a-box>
<a-box mixin="m-wand"  position="-12 3 -23"  width="0.3" height="6.1" depth="14"></a-box>
<a-box mixin="m-wand"  position=" 12 3 -23"  width="0.3" height="6.1" depth="14"></a-box>
<a-plane mixin="m-boden" rotation="-90 0 0"  position="0 0 -23" width="24" height="14" receive-shadow="true"></a-plane>
<a-box mixin="m-decke"   position="0 6.15 -23" width="24" height="0.3" depth="14"></a-box>

<!-- Mittelstreifen (dekorativ, trennt die zwei Sub-Zonen) -->
<a-box mixin="m-stripe" position="0 0.005 -23" width="0.08" height="0.01" depth="14"></a-box>

<!-- Zone-Beschriftungen über dem Eingang -->
<a-plane material="color:#1a2844;roughness:0.8" width="3.5" height="0.45" position="-6 5.6 -16.2">
  <a-text value="SCHICHT 4 — ANWENDUNG" color="#50e0a0" scale="0.35 0.35 0.35"
          position="0 0 0.01" align="center" material="shader:flat;emissive:#50e0a0;emissiveIntensity:0.3"></a-text>
</a-plane>
<a-plane material="color:#1a2844;roughness:0.8" width="3.5" height="0.45" position=" 6 5.6 -16.2">
  <a-text value="SCHICHT 3 — TRANSPORT" color="#64a0ff" scale="0.35 0.35 0.35"
          position="0 0 0.01" align="center" material="shader:flat;emissive:#64a0ff;emissiveIntensity:0.3"></a-text>
</a-plane>

<!-- Beleuchtung Nordflügel -->
<a-light type="point" color="#b0d0ff" intensity="4.5" distance="10" decay="2" position="-6 5.5 -23"></a-light>
<a-light type="point" color="#ffd0a0" intensity="4.5" distance="10" decay="2" position=" 6 5.5 -23"></a-light>
```

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: Nordflügel-Grundstruktur in A-Frame-Szene (Wände, Boden, Decke, Eingang)"
```

---

## Task 5: Add Zone Content to index.html

**Files:**
- Modify: `index.html`

Add all content entities directly below the North Wing shell comment block.

- [ ] **Step 1: Add Transport-Flügel content (right half, x=0..+12)**

```html
<!-- ─── SCHICHT 3: TRANSPORT-FLÜGEL (x=0..+12) ─────────────────────────── -->

<!-- TCP-Förderband (blau, links im Transport-Raum) -->
<a-entity id="l3-belt-tcp" position="3 0 -23">
  <a-box material="color:#1a2030;roughness:0.6;metalness:0.7" width="2.6" height="0.65" depth="10" position="0 0.325 0"></a-box>
  <a-box material="color:#1e3a5f;roughness:0.7" width="2.3" height="0.06" depth="10" position="0 0.66 0"></a-box>
  <a-box material="color:#3060a0;shader:flat;opacity:0.9" width="2.3" height="0.02" depth="0.35" position="0 0.68 0"
         animation="property:position.z;from:-5;to:5;dur:2500;loop:true;easing:linear"></a-box>
  <a-plane material="color:#0d1a30;roughness:0.8" width="2.2" height="0.5" position="0 1.6 -4.8">
    <a-text value="TCP" color="#64a0ff" scale="0.55 0.55 0.55" position="0 0.1 0.01" align="center"></a-text>
    <a-text value="Zuverlässig · Bestätigt" color="#8899bb" scale="0.22 0.22 0.22" position="0 -0.12 0.01" align="center"></a-text>
  </a-plane>
  <a-box class="interactable belt-zone" id="l3-dropzone-tcp" data-belt="tcp"
         material="color:#3060a0;opacity:0.0;transparent:true" width="2.4" height="0.8" depth="10" position="0 0.9 0"></a-box>
</a-entity>

<!-- UDP-Förderband (orange, rechts im Transport-Raum) -->
<a-entity id="l3-belt-udp" position="9 0 -23">
  <a-box material="color:#1a1000;roughness:0.6;metalness:0.7" width="2.6" height="0.65" depth="10" position="0 0.325 0"></a-box>
  <a-box material="color:#3d1e00;roughness:0.7" width="2.3" height="0.06" depth="10" position="0 0.66 0"></a-box>
  <a-box material="color:#c05010;shader:flat;opacity:0.9" width="2.3" height="0.02" depth="0.35" position="0 0.68 0"
         animation="property:position.z;from:-5;to:5;dur:1200;loop:true;easing:linear"></a-box>
  <a-plane material="color:#1a0800;roughness:0.8" width="2.2" height="0.5" position="0 1.6 -4.8">
    <a-text value="UDP" color="#ff7830" scale="0.55 0.55 0.55" position="0 0.1 0.01" align="center"></a-text>
    <a-text value="Schnell · Verbindungslos" color="#bb7755" scale="0.22 0.22 0.22" position="0 -0.12 0.01" align="center"></a-text>
  </a-plane>
  <a-box class="interactable belt-zone" id="l3-dropzone-udp" data-belt="udp"
         material="color:#c05010;opacity:0.0;transparent:true" width="2.4" height="0.8" depth="10" position="0 0.9 0"></a-box>
</a-entity>

<!-- L3 Pakettisch (am Eingang, z=-17.5) -->
<a-box material="color:#3a3020;roughness:0.8" position="6 0.45 -17.5" width="5" height="0.9" depth="1.5"></a-box>

<!-- L3 Pakete -->
<a-entity class="interactable paket-l3" id="l3-paket-1" data-protocol="udp"
          position="4.0 1.18 -17.5" geometry="primitive:box;width:0.55;height:0.48;depth:0.48"
          material="color:#c8a060;roughness:0.9">
  <a-entity look-at="[camera]" position="0 0.3 0">
    <a-plane material="color:#0a1828;opacity:0.9;shader:flat;side:double" width="0.55" height="0.16"></a-plane>
    <a-text value="Video-Stream\nUDP?" color="#a8d8ff" scale="0.42 0.42 0.42" align="center" position="0 0 0.002" material="shader:flat"></a-text>
  </a-entity>
</a-entity>
<a-entity class="interactable paket-l3" id="l3-paket-2" data-protocol="tcp"
          position="5.0 1.18 -17.2" geometry="primitive:box;width:0.55;height:0.48;depth:0.48"
          material="color:#b09050;roughness:0.9">
  <a-entity look-at="[camera]" position="0 0.3 0">
    <a-plane material="color:#0a1828;opacity:0.9;shader:flat;side:double" width="0.55" height="0.16"></a-plane>
    <a-text value="Datei-Download\nTCP?" color="#a8d8ff" scale="0.42 0.42 0.42" align="center" position="0 0 0.002" material="shader:flat"></a-text>
  </a-entity>
</a-entity>
<a-entity class="interactable paket-l3" id="l3-paket-3" data-protocol="udp"
          position="6.0 1.18 -17.8" geometry="primitive:box;width:0.55;height:0.48;depth:0.48"
          material="color:#d0a850;roughness:0.9">
  <a-entity look-at="[camera]" position="0 0.3 0">
    <a-plane material="color:#0a1828;opacity:0.9;shader:flat;side:double" width="0.55" height="0.16"></a-plane>
    <a-text value="Online-Game\nUDP?" color="#a8d8ff" scale="0.42 0.42 0.42" align="center" position="0 0 0.002" material="shader:flat"></a-text>
  </a-entity>
</a-entity>
<a-entity class="interactable paket-l3" id="l3-paket-4" data-protocol="tcp"
          position="7.0 1.18 -17.3" geometry="primitive:box;width:0.55;height:0.48;depth:0.48"
          material="color:#c8a060;roughness:0.9">
  <a-entity look-at="[camera]" position="0 0.3 0">
    <a-plane material="color:#0a1828;opacity:0.9;shader:flat;side:double" width="0.55" height="0.16"></a-plane>
    <a-text value="E-Mail-Anhang\nTCP?" color="#a8d8ff" scale="0.42 0.42 0.42" align="center" position="0 0 0.002" material="shader:flat"></a-text>
  </a-entity>
</a-entity>
<a-entity class="interactable paket-l3" id="l3-paket-5" data-protocol="udp"
          position="7.8 1.18 -17.7" geometry="primitive:box;width:0.55;height:0.48;depth:0.48"
          material="color:#b09050;roughness:0.9">
  <a-entity look-at="[camera]" position="0 0.3 0">
    <a-plane material="color:#0a1828;opacity:0.9;shader:flat;side:double" width="0.55" height="0.16"></a-plane>
    <a-text value="DNS-Anfrage\nUDP?" color="#a8d8ff" scale="0.42 0.42 0.42" align="center" position="0 0 0.002" material="shader:flat"></a-text>
  </a-entity>
</a-entity>
<a-entity class="interactable paket-l3" id="l3-paket-6" data-protocol="tcp"
          position="8.5 1.18 -17.4" geometry="primitive:box;width:0.55;height:0.48;depth:0.48"
          material="color:#d0a850;roughness:0.9">
  <a-entity look-at="[camera]" position="0 0.3 0">
    <a-plane material="color:#0a1828;opacity:0.9;shader:flat;side:double" width="0.55" height="0.16"></a-plane>
    <a-text value="HTTPS-Seite\nTCP?" color="#a8d8ff" scale="0.42 0.42 0.42" align="center" position="0 0 0.002" material="shader:flat"></a-text>
  </a-entity>
</a-entity>

<!-- L3 Info-Kiosk -->
<a-entity id="l3-kiosk" kiosk-interaction position="1.2 0 -18.5">
  <a-box material="color:#252830;roughness:0.4;metalness:0.6" width="0.9" height="1.4" depth="0.45" position="0 0.7 0"></a-box>
  <a-plane id="l3-kiosk-screen" material="color:#001428;emissive:#001428;emissiveIntensity:0.8;shader:flat"
           width="0.75" height="1.0" position="0 0.75 0.23"></a-plane>
  <a-text id="l3-kiosk-text" visible="false"
          value="TCP — Transmission Control Protocol&#10;&#10;• Verbindungsorientiert&#10;• Garantiert Zustellung&#10;• Bestätigt jedes Paket&#10;• Nutze für: Dateien, E-Mails, Web&#10;&#10;UDP — User Datagram Protocol&#10;&#10;• Verbindungslos&#10;• Keine Bestätigung&#10;• Sehr schnell&#10;• Nutze für: Video, Gaming, DNS"
          color="#a8d8ff" scale="0.12 0.12 0.12" position="-0.34 1.2 0.24" width="5.5" wrap-count="28" material="shader:flat"></a-text>
  <a-entity id="l3-kiosk-hint" position="0 1.7 0" visible="false">
    <a-plane material="color:#1a2844;opacity:0.9;shader:flat" width="0.65" height="0.18"></a-plane>
    <a-text value="E — Info lesen" color="#64a0ff" scale="0.17 0.17 0.17" position="0 0 0.01" align="center" material="shader:flat"></a-text>
  </a-entity>
</a-entity>

<!-- L3 Quiz-Terminal (gesperrt bis alle Pakete zugeordnet) -->
<a-entity id="l3-quiz-terminal" position="6 0 -29" visible="false">
  <a-box material="color:#1a2030;roughness:0.4;metalness:0.6" width="4.5" height="3.2" depth="0.45" position="0 1.6 0"></a-box>
  <a-plane material="color:#001428;emissive:#001428;emissiveIntensity:0.7;shader:flat" width="4.2" height="3.0" position="0 1.6 0.23"></a-plane>
  <a-text id="l3-quiz-question" value="..." color="#e8edf5" scale="0.2 0.2 0.2"
          position="-1.9 2.9 0.24" width="9" wrap-count="38" material="shader:flat"></a-text>
  <!-- Antwort A -->
  <a-box class="interactable quiz-option-l3" id="l3-quiz-a" data-correct="false"
         material="color:#1a2040;roughness:0.5" width="1.8" height="0.65" depth="0.06" position="-1.1 1.8 0.24">
    <a-text id="l3-quiz-a-text" value="A: ..." color="#c8d8f0" scale="0.18 0.18 0.18"
            position="-0.8 0 0.04" width="8" wrap-count="28" material="shader:flat"></a-text>
  </a-box>
  <!-- Antwort B -->
  <a-box class="interactable quiz-option-l3" id="l3-quiz-b" data-correct="false"
         material="color:#1a2040;roughness:0.5" width="1.8" height="0.65" depth="0.06" position="1.1 1.8 0.24">
    <a-text id="l3-quiz-b-text" value="B: ..." color="#c8d8f0" scale="0.18 0.18 0.18"
            position="-0.8 0 0.04" width="8" wrap-count="28" material="shader:flat"></a-text>
  </a-box>
  <!-- Antwort C -->
  <a-box class="interactable quiz-option-l3" id="l3-quiz-c" data-correct="false"
         material="color:#1a2040;roughness:0.5" width="1.8" height="0.65" depth="0.06" position="-1.1 1.0 0.24">
    <a-text id="l3-quiz-c-text" value="C: ..." color="#c8d8f0" scale="0.18 0.18 0.18"
            position="-0.8 0 0.04" width="8" wrap-count="28" material="shader:flat"></a-text>
  </a-box>
  <!-- Antwort D -->
  <a-box class="interactable quiz-option-l3" id="l3-quiz-d" data-correct="true"
         material="color:#1a2040;roughness:0.5" width="1.8" height="0.65" depth="0.06" position="1.1 1.0 0.24">
    <a-text id="l3-quiz-d-text" value="D: ..." color="#c8d8f0" scale="0.18 0.18 0.18"
            position="-0.8 0 0.04" width="8" wrap-count="28" material="shader:flat"></a-text>
  </a-box>
  <a-entity id="l3-quiz-hint" position="0 3.35 0" visible="false">
    <a-plane material="color:#1a2844;opacity:0.9;shader:flat" width="0.8" height="0.18"></a-plane>
    <a-text value="E — Antwort wählen" color="#64a0ff" scale="0.17 0.17 0.17" position="0 0 0.01" align="center" material="shader:flat"></a-text>
  </a-entity>
</a-entity>
```

- [ ] **Step 2: Add Anwendungs-Flügel content (left half, x=-12..0)**

```html
<!-- ─── SCHICHT 4: ANWENDUNGS-FLÜGEL (x=-12..0) ────────────────────────── -->

<!-- Schreibtische (Büro-Atmosphäre) -->
<a-entity position="-8 0 -20">
  <a-box material="color:#8b7355;roughness:0.7" width="1.6" height="0.06" depth="0.85" position="0 0.74 0"></a-box>
  <a-box material="color:#5a3c1e;roughness:0.8" width="0.06" height="0.74" depth="0.06" position="-0.75 0.37  0.38"></a-box>
  <a-box material="color:#5a3c1e;roughness:0.8" width="0.06" height="0.74" depth="0.06" position=" 0.75 0.37  0.38"></a-box>
  <a-box material="color:#5a3c1e;roughness:0.8" width="0.06" height="0.74" depth="0.06" position="-0.75 0.37 -0.38"></a-box>
  <a-box material="color:#5a3c1e;roughness:0.8" width="0.06" height="0.74" depth="0.06" position=" 0.75 0.37 -0.38"></a-box>
</a-entity>
<a-entity position="-3 0 -20">
  <a-box material="color:#8b7355;roughness:0.7" width="1.6" height="0.06" depth="0.85" position="0 0.74 0"></a-box>
  <a-box material="color:#5a3c1e;roughness:0.8" width="0.06" height="0.74" depth="0.06" position="-0.75 0.37  0.38"></a-box>
  <a-box material="color:#5a3c1e;roughness:0.8" width="0.06" height="0.74" depth="0.06" position=" 0.75 0.37  0.38"></a-box>
  <a-box material="color:#5a3c1e;roughness:0.8" width="0.06" height="0.74" depth="0.06" position="-0.75 0.37 -0.38"></a-box>
  <a-box material="color:#5a3c1e;roughness:0.8" width="0.06" height="0.74" depth="0.06" position=" 0.75 0.37 -0.38"></a-box>
</a-entity>

<!-- Protokoll-Briefkästen (Hinterwand z=-29) -->
<!-- HTTP (blau) -->
<a-entity id="l4-inbox-http" position="-10 0 -29">
  <a-box material="color:#1a2040;roughness:0.6;metalness:0.3" width="2.2" height="2.2" depth="0.5" position="0 1.1 0"></a-box>
  <a-plane material="color:#0d1a30;roughness:0.8" width="2.0" height="0.6" position="0 2.0 0.26">
    <a-text value="HTTP" color="#64a0ff" scale="0.5 0.5 0.5" position="0 0.1 0.01" align="center"></a-text>
    <a-text value="Web-Seiten &amp; APIs" color="#8899aa" scale="0.2 0.2 0.2" position="0 -0.12 0.01" align="center"></a-text>
  </a-plane>
  <a-box class="interactable inbox-zone" id="l4-drop-http" data-protocol="http"
         material="color:#3060a0;opacity:0.0;transparent:true" width="2.0" height="0.9" depth="0.9" position="0 0.6 0.45"></a-box>
</a-entity>

<!-- DNS (gelb) -->
<a-entity id="l4-inbox-dns" position="-7 0 -29">
  <a-box material="color:#201a00;roughness:0.6;metalness:0.3" width="2.2" height="2.2" depth="0.5" position="0 1.1 0"></a-box>
  <a-plane material="color:#1a1400;roughness:0.8" width="2.0" height="0.6" position="0 2.0 0.26">
    <a-text value="DNS" color="#f5c518" scale="0.5 0.5 0.5" position="0 0.1 0.01" align="center"></a-text>
    <a-text value="Domain-Auflösung" color="#aa9955" scale="0.2 0.2 0.2" position="0 -0.12 0.01" align="center"></a-text>
  </a-plane>
  <a-box class="interactable inbox-zone" id="l4-drop-dns" data-protocol="dns"
         material="color:#f5c518;opacity:0.0;transparent:true" width="2.0" height="0.9" depth="0.9" position="0 0.6 0.45"></a-box>
</a-entity>

<!-- FTP (grün) -->
<a-entity id="l4-inbox-ftp" position="-4 0 -29">
  <a-box material="color:#0a2010;roughness:0.6;metalness:0.3" width="2.2" height="2.2" depth="0.5" position="0 1.1 0"></a-box>
  <a-plane material="color:#061408;roughness:0.8" width="2.0" height="0.6" position="0 2.0 0.26">
    <a-text value="FTP" color="#50e0a0" scale="0.5 0.5 0.5" position="0 0.1 0.01" align="center"></a-text>
    <a-text value="Datei-Transfer" color="#559977" scale="0.2 0.2 0.2" position="0 -0.12 0.01" align="center"></a-text>
  </a-plane>
  <a-box class="interactable inbox-zone" id="l4-drop-ftp" data-protocol="ftp"
         material="color:#50e0a0;opacity:0.0;transparent:true" width="2.0" height="0.9" depth="0.9" position="0 0.6 0.45"></a-box>
</a-entity>

<!-- SMTP (rot/orange) -->
<a-entity id="l4-inbox-smtp" position="-1 0 -29">
  <a-box material="color:#200800;roughness:0.6;metalness:0.3" width="2.2" height="2.2" depth="0.5" position="0 1.1 0"></a-box>
  <a-plane material="color:#140400;roughness:0.8" width="2.0" height="0.6" position="0 2.0 0.26">
    <a-text value="SMTP" color="#ff7850" scale="0.5 0.5 0.5" position="0 0.1 0.01" align="center"></a-text>
    <a-text value="E-Mail-Versand" color="#aa6644" scale="0.2 0.2 0.2" position="0 -0.12 0.01" align="center"></a-text>
  </a-plane>
  <a-box class="interactable inbox-zone" id="l4-drop-smtp" data-protocol="smtp"
         material="color:#ff7850;opacity:0.0;transparent:true" width="2.0" height="0.9" depth="0.9" position="0 0.6 0.45"></a-box>
</a-entity>

<!-- L4 Pakettisch (am Eingang) -->
<a-box material="color:#3a3020;roughness:0.8" position="-6 0.45 -17.5" width="5" height="0.9" depth="1.5"></a-box>

<!-- L4 Pakete -->
<a-entity class="interactable paket-l4" id="l4-paket-1" data-protocol="http"
          position="-4.5 1.18 -17.3" geometry="primitive:box;width:0.55;height:0.48;depth:0.48"
          material="color:#c8a060;roughness:0.9">
  <a-entity look-at="[camera]" position="0 0.3 0">
    <a-plane material="color:#0a1828;opacity:0.9;shader:flat;side:double" width="0.55" height="0.16"></a-plane>
    <a-text value="Webseite laden\nHTTP?" color="#a8d8ff" scale="0.42 0.42 0.42" align="center" position="0 0 0.002" material="shader:flat"></a-text>
  </a-entity>
</a-entity>
<a-entity class="interactable paket-l4" id="l4-paket-2" data-protocol="dns"
          position="-5.5 1.18 -17.7" geometry="primitive:box;width:0.55;height:0.48;depth:0.48"
          material="color:#b09050;roughness:0.9">
  <a-entity look-at="[camera]" position="0 0.3 0">
    <a-plane material="color:#0a1828;opacity:0.9;shader:flat;side:double" width="0.55" height="0.16"></a-plane>
    <a-text value="Domain → IP\nDNS?" color="#a8d8ff" scale="0.42 0.42 0.42" align="center" position="0 0 0.002" material="shader:flat"></a-text>
  </a-entity>
</a-entity>
<a-entity class="interactable paket-l4" id="l4-paket-3" data-protocol="ftp"
          position="-6.5 1.18 -17.4" geometry="primitive:box;width:0.55;height:0.48;depth:0.48"
          material="color:#d0a850;roughness:0.9">
  <a-entity look-at="[camera]" position="0 0.3 0">
    <a-plane material="color:#0a1828;opacity:0.9;shader:flat;side:double" width="0.55" height="0.16"></a-plane>
    <a-text value="Datei hochladen\nFTP?" color="#a8d8ff" scale="0.42 0.42 0.42" align="center" position="0 0 0.002" material="shader:flat"></a-text>
  </a-entity>
</a-entity>
<a-entity class="interactable paket-l4" id="l4-paket-4" data-protocol="smtp"
          position="-7.5 1.18 -17.6" geometry="primitive:box;width:0.55;height:0.48;depth:0.48"
          material="color:#c8a060;roughness:0.9">
  <a-entity look-at="[camera]" position="0 0.3 0">
    <a-plane material="color:#0a1828;opacity:0.9;shader:flat;side:double" width="0.55" height="0.16"></a-plane>
    <a-text value="E-Mail senden\nSMTP?" color="#a8d8ff" scale="0.42 0.42 0.42" align="center" position="0 0 0.002" material="shader:flat"></a-text>
  </a-entity>
</a-entity>
<a-entity class="interactable paket-l4" id="l4-paket-5" data-protocol="http"
          position="-8.3 1.18 -17.3" geometry="primitive:box;width:0.55;height:0.48;depth:0.48"
          material="color:#b09050;roughness:0.9">
  <a-entity look-at="[camera]" position="0 0.3 0">
    <a-plane material="color:#0a1828;opacity:0.9;shader:flat;side:double" width="0.55" height="0.16"></a-plane>
    <a-text value="API-Request\nHTTP?" color="#a8d8ff" scale="0.42 0.42 0.42" align="center" position="0 0 0.002" material="shader:flat"></a-text>
  </a-entity>
</a-entity>
<a-entity class="interactable paket-l4" id="l4-paket-6" data-protocol="dns"
          position="-9.0 1.18 -17.7" geometry="primitive:box;width:0.55;height:0.48;depth:0.48"
          material="color:#d0a850;roughness:0.9">
  <a-entity look-at="[camera]" position="0 0.3 0">
    <a-plane material="color:#0a1828;opacity:0.9;shader:flat;side:double" width="0.55" height="0.16"></a-plane>
    <a-text value="Mail-Server finden\nDNS?" color="#a8d8ff" scale="0.42 0.42 0.42" align="center" position="0 0 0.002" material="shader:flat"></a-text>
  </a-entity>
</a-entity>

<!-- L4 Info-Kiosk -->
<a-entity id="l4-kiosk" kiosk-interaction position="-11 0 -18.5">
  <a-box material="color:#252830;roughness:0.4;metalness:0.6" width="0.9" height="1.4" depth="0.45" position="0 0.7 0"></a-box>
  <a-plane id="l4-kiosk-screen" material="color:#001428;emissive:#001428;emissiveIntensity:0.8;shader:flat"
           width="0.75" height="1.0" position="0 0.75 0.23"></a-plane>
  <a-text id="l4-kiosk-text" visible="false"
          value="ANWENDUNGSSCHICHT (Layer 4)&#10;&#10;HTTP: Webseiten, REST-APIs&#10;HTTPS: Verschlüsseltes HTTP&#10;DNS: Domain → IP-Adresse&#10;FTP: Datei-Transfer (Server)&#10;SMTP: E-Mails versenden&#10;&#10;Diese Schicht ist die&#10;Schnittstelle zwischen&#10;Anwendung und Netzwerk."
          color="#a8d8ff" scale="0.12 0.12 0.12" position="-0.34 1.2 0.24" width="5.5" wrap-count="28" material="shader:flat"></a-text>
  <a-entity id="l4-kiosk-hint" position="0 1.7 0" visible="false">
    <a-plane material="color:#1a2844;opacity:0.9;shader:flat" width="0.65" height="0.18"></a-plane>
    <a-text value="E — Info lesen" color="#64a0ff" scale="0.17 0.17 0.17" position="0 0 0.01" align="center" material="shader:flat"></a-text>
  </a-entity>
</a-entity>

<!-- L4 Quiz-Terminal -->
<a-entity id="l4-quiz-terminal" position="-6 0 -29" visible="false">
  <a-box material="color:#1a2030;roughness:0.4;metalness:0.6" width="4.5" height="3.2" depth="0.45" position="0 1.6 0"></a-box>
  <a-plane material="color:#001428;emissive:#001428;emissiveIntensity:0.7;shader:flat" width="4.2" height="3.0" position="0 1.6 0.23"></a-plane>
  <a-text id="l4-quiz-question" value="..." color="#e8edf5" scale="0.2 0.2 0.2"
          position="-1.9 2.9 0.24" width="9" wrap-count="38" material="shader:flat"></a-text>
  <a-box class="interactable quiz-option-l4" id="l4-quiz-a" data-correct="false"
         material="color:#1a2040;roughness:0.5" width="1.8" height="0.65" depth="0.06" position="-1.1 1.8 0.24">
    <a-text id="l4-quiz-a-text" value="A: ..." color="#c8d8f0" scale="0.18 0.18 0.18"
            position="-0.8 0 0.04" width="8" wrap-count="28" material="shader:flat"></a-text>
  </a-box>
  <a-box class="interactable quiz-option-l4" id="l4-quiz-b" data-correct="false"
         material="color:#1a2040;roughness:0.5" width="1.8" height="0.65" depth="0.06" position="1.1 1.8 0.24">
    <a-text id="l4-quiz-b-text" value="B: ..." color="#c8d8f0" scale="0.18 0.18 0.18"
            position="-0.8 0 0.04" width="8" wrap-count="28" material="shader:flat"></a-text>
  </a-box>
  <a-box class="interactable quiz-option-l4" id="l4-quiz-c" data-correct="true"
         material="color:#1a2040;roughness:0.5" width="1.8" height="0.65" depth="0.06" position="-1.1 1.0 0.24">
    <a-text id="l4-quiz-c-text" value="C: ..." color="#c8d8f0" scale="0.18 0.18 0.18"
            position="-0.8 0 0.04" width="8" wrap-count="28" material="shader:flat"></a-text>
  </a-box>
  <a-box class="interactable quiz-option-l4" id="l4-quiz-d" data-correct="false"
         material="color:#1a2040;roughness:0.5" width="1.8" height="0.65" depth="0.06" position="1.1 1.0 0.24">
    <a-text id="l4-quiz-d-text" value="D: ..." color="#c8d8f0" scale="0.18 0.18 0.18"
            position="-0.8 0 0.04" width="8" wrap-count="28" material="shader:flat"></a-text>
  </a-box>
  <a-entity id="l4-quiz-hint" position="0 3.35 0" visible="false">
    <a-plane material="color:#1a2844;opacity:0.9;shader:flat" width="0.8" height="0.18"></a-plane>
    <a-text value="E — Antwort wählen" color="#64a0ff" scale="0.17 0.17 0.17" position="0 0 0.01" align="center" material="shader:flat"></a-text>
  </a-entity>
</a-entity>
```

- [ ] **Step 3: Add L3/L4 script tags to index.html (before game.js)**

```html
<script src="js/scenarios/layer3-transport.js?v=1"></script>
<script src="js/scenarios/layer4-anwendung.js?v=1"></script>
```

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: Transport-Flügel und Anwendungs-Flügel Entities in A-Frame-Szene"
```

---

## Task 6: Add kiosk-interaction Component to components.js

**Files:**
- Modify: `js/components.js`

- [ ] **Step 1: Append kiosk-interaction component at the end of components.js**

```js
AFRAME.registerComponent('kiosk-interaction', {
  init() {
    this._hintVisible = false;
    this._open = false;
    this._hintEl = this.el.querySelector('[id$="-hint"]');
    this._textEl = this.el.querySelector('[id$="-text"]');
  },
  tick() {
    const cam = document.querySelector('[camera]');
    if (!cam) return;
    const camPos = new AFRAME.THREE.Vector3();
    cam.object3D.getWorldPosition(camPos);
    const myPos = new AFRAME.THREE.Vector3();
    this.el.object3D.getWorldPosition(myPos);
    const dist = camPos.distanceTo(myPos);
    const inRange = dist < 3.2;
    if (inRange !== this._hintVisible) {
      this._hintVisible = inRange;
      if (this._hintEl) this._hintEl.setAttribute('visible', inRange);
      if (!inRange && this._open) {
        this._open = false;
        if (this._textEl) this._textEl.setAttribute('visible', false);
      }
    }
  },
  toggle() {
    if (!this._hintVisible) return;
    this._open = !this._open;
    if (this._textEl) this._textEl.setAttribute('visible', this._open);
  }
});
```

- [ ] **Step 2: Commit**

```bash
git add js/components.js
git commit -m "feat: kiosk-interaction A-Frame-Komponente für 3D-Infotafeln"
```

---

## Task 7: Build layer3-transport.js

**Files:**
- Create: `js/scenarios/layer3-transport.js`

- [ ] **Step 1: Create the file**

```js
const L3 = (() => {
  let _score = 0;
  let _assigned = 0;
  let _quizAnswered = false;
  let _onComplete = null;
  let _selectedPaket = null;

  const PACKETS = [
    { id: 'l3-paket-1', protocol: 'udp', label: 'Video-Stream'  },
    { id: 'l3-paket-2', protocol: 'tcp', label: 'Datei-Download' },
    { id: 'l3-paket-3', protocol: 'udp', label: 'Online-Game'   },
    { id: 'l3-paket-4', protocol: 'tcp', label: 'E-Mail-Anhang' },
    { id: 'l3-paket-5', protocol: 'udp', label: 'DNS-Anfrage'   },
    { id: 'l3-paket-6', protocol: 'tcp', label: 'HTTPS-Seite'   },
  ];

  const QUIZ = {
    question: 'Welches Protokoll wird typischerweise für einen Live-Video-Stream verwendet?',
    options: [
      { text: 'TCP — weil Zuverlässigkeit wichtig ist',    correct: false },
      { text: 'FTP — weil Dateien übertragen werden',      correct: false },
      { text: 'HTTP — weil Video im Browser läuft',        correct: false },
      { text: 'UDP — weil Latenz wichtiger ist als Verlust', correct: true  },
    ],
  };

  function _showQuiz() {
    const term = document.getElementById('l3-quiz-terminal');
    if (!term) return;
    term.setAttribute('visible', true);

    document.getElementById('l3-quiz-question').setAttribute('value', QUIZ.question);
    const ids = ['a', 'b', 'c', 'd'];
    QUIZ.options.forEach((opt, i) => {
      const box = document.getElementById('l3-quiz-' + ids[i]);
      if (box) {
        box.setAttribute('data-correct', opt.correct ? 'true' : 'false');
        box._opt = opt;
      }
      const txt = document.getElementById('l3-quiz-' + ids[i] + '-text');
      if (txt) txt.setAttribute('value', ['A','B','C','D'][i] + ': ' + opt.text);
    });
  }

  function _onDrop(paketId, beltId) {
    if (_quizAnswered) return;
    const packet = PACKETS.find(p => p.id === paketId);
    if (!packet) return;

    const el = document.getElementById(paketId);
    if (el) el.setAttribute('visible', false);

    const correct = packet.protocol === beltId;
    if (correct) {
      _score += 100;
      _assigned++;
      if (window.playSoundCorrect) playSoundCorrect();
    } else {
      _score = Math.max(0, _score - 20);
      if (window.playSoundWrong) playSoundWrong();
    }

    const scorePill = document.getElementById('score-pill');
    if (scorePill) scorePill.textContent = _score + ' P';

    const taskText = document.getElementById('task-text');
    if (taskText) taskText.textContent = correct
      ? '✓ Richtig! ' + packet.label + ' → ' + beltId.toUpperCase()
      : '✗ Falsch! ' + packet.label + ' gehört zu ' + packet.protocol.toUpperCase();

    if (_assigned >= PACKETS.length) {
      setTimeout(_showQuiz, 800);
    }
  }

  function _onQuizAnswer(boxEl) {
    if (_quizAnswered) return;
    _quizAnswered = true;

    const correct = boxEl.getAttribute('data-correct') === 'true';
    const ids = ['a', 'b', 'c', 'd'];
    ids.forEach(id => {
      const b = document.getElementById('l3-quiz-' + id);
      if (b) {
        if (b._opt && b._opt.correct) {
          b.setAttribute('material', 'color:#1a4020;roughness:0.5');
        } else if (b === boxEl && !correct) {
          b.setAttribute('material', 'color:#401010;roughness:0.5');
        }
      }
    });

    if (correct) _score += 200;

    setTimeout(() => {
      if (_onComplete) _onComplete(_score);
    }, 1500);
  }

  return {
    init(onComplete) {
      _score = 0;
      _assigned = 0;
      _quizAnswered = false;
      _selectedPaket = null;
      _onComplete = onComplete;

      PACKETS.forEach(p => {
        const el = document.getElementById(p.id);
        if (el) el.setAttribute('visible', true);
      });
      const term = document.getElementById('l3-quiz-terminal');
      if (term) term.setAttribute('visible', false);

      const taskText = document.getElementById('task-text');
      if (taskText) taskText.textContent = 'Transport-Flügel: Sortiere Pakete auf das richtige Förderband (TCP oder UDP)';

      const scorePill = document.getElementById('score-pill');
      if (scorePill) scorePill.textContent = '0 P';
    },

    teardown() {
      PACKETS.forEach(p => {
        const el = document.getElementById(p.id);
        if (el) el.setAttribute('visible', false);
      });
      const term = document.getElementById('l3-quiz-terminal');
      if (term) term.setAttribute('visible', false);
      _onComplete = null;
    },

    getScore() { return _score; },

    // Called from game.js E-key handler when in ZONE_TRANSPORT
    handlePickup(target) {
      if (_quizAnswered) return false;
      if (target.classList.contains('paket-l3') && !_selectedPaket) {
        _selectedPaket = target;
        const badge = document.getElementById('selected-badge');
        if (badge) {
          badge.classList.add('visible');
          badge.textContent = '📦 ' + (target.getAttribute('data-protocol') || '').toUpperCase();
        }
        target.setAttribute('material', 'color:#ffffff');
        return true;
      }
      if (target.classList.contains('belt-zone') && _selectedPaket) {
        const beltId = target.getAttribute('data-belt');
        const paketId = _selectedPaket.id;
        _selectedPaket.setAttribute('material', 'color:#c8a060;roughness:0.9');
        _selectedPaket = null;
        const badge = document.getElementById('selected-badge');
        if (badge) badge.classList.remove('visible');
        _onDrop(paketId, beltId);
        return true;
      }
      if (target.classList.contains('quiz-option-l3') && _assigned >= PACKETS.length) {
        _onQuizAnswer(target);
        return true;
      }
      return false;
    },

    // Test helpers
    _dropForTest(paketId, beltId) { _onDrop(paketId, beltId); },
    _answerQuizForTest(correct) {
      const ids = ['a', 'b', 'c', 'd'];
      for (const id of ids) {
        const b = document.getElementById('l3-quiz-' + id);
        if (b && b.getAttribute('data-correct') === (correct ? 'true' : 'false')) {
          _onQuizAnswer(b);
          return;
        }
      }
    },
  };
})();
```

- [ ] **Step 2: Commit**

```bash
git add js/scenarios/layer3-transport.js
git commit -m "feat: layer3-transport.js — TCP/UDP-Sortierung + 3D-Quiz-Modul"
```

---

## Task 8: Build layer4-anwendung.js

**Files:**
- Create: `js/scenarios/layer4-anwendung.js`

- [ ] **Step 1: Create the file**

```js
const L4 = (() => {
  let _score = 0;
  let _assigned = 0;
  let _quizAnswered = false;
  let _onComplete = null;
  let _selectedPaket = null;

  const PACKETS = [
    { id: 'l4-paket-1', protocol: 'http',  label: 'Webseite laden'    },
    { id: 'l4-paket-2', protocol: 'dns',   label: 'Domain → IP'       },
    { id: 'l4-paket-3', protocol: 'ftp',   label: 'Datei hochladen'   },
    { id: 'l4-paket-4', protocol: 'smtp',  label: 'E-Mail senden'     },
    { id: 'l4-paket-5', protocol: 'http',  label: 'API-Request'       },
    { id: 'l4-paket-6', protocol: 'dns',   label: 'Mail-Server finden'},
  ];

  const QUIZ = {
    question: 'Welches Protokoll wird zum Versenden von E-Mails verwendet?',
    options: [
      { text: 'HTTP — für Web-Anfragen',          correct: false },
      { text: 'DNS  — für Namensauflösung',        correct: false },
      { text: 'SMTP — Simple Mail Transfer Protocol', correct: true  },
      { text: 'FTP  — für Datei-Transfer',         correct: false },
    ],
  };

  function _showQuiz() {
    const term = document.getElementById('l4-quiz-terminal');
    if (!term) return;
    term.setAttribute('visible', true);

    document.getElementById('l4-quiz-question').setAttribute('value', QUIZ.question);
    const ids = ['a', 'b', 'c', 'd'];
    QUIZ.options.forEach((opt, i) => {
      const box = document.getElementById('l4-quiz-' + ids[i]);
      if (box) {
        box.setAttribute('data-correct', opt.correct ? 'true' : 'false');
        box._opt = opt;
      }
      const txt = document.getElementById('l4-quiz-' + ids[i] + '-text');
      if (txt) txt.setAttribute('value', ['A','B','C','D'][i] + ': ' + opt.text);
    });
  }

  function _onDrop(paketId, inboxProtocol) {
    if (_quizAnswered) return;
    const packet = PACKETS.find(p => p.id === paketId);
    if (!packet) return;

    const el = document.getElementById(paketId);
    if (el) el.setAttribute('visible', false);

    const correct = packet.protocol === inboxProtocol;
    if (correct) {
      _score += 100;
      _assigned++;
      if (window.playSoundCorrect) playSoundCorrect();
    } else {
      _score = Math.max(0, _score - 20);
      if (window.playSoundWrong) playSoundWrong();
    }

    const scorePill = document.getElementById('score-pill');
    if (scorePill) scorePill.textContent = _score + ' P';

    const taskText = document.getElementById('task-text');
    if (taskText) taskText.textContent = correct
      ? '✓ Richtig! ' + packet.label + ' → ' + inboxProtocol.toUpperCase()
      : '✗ Falsch! ' + packet.label + ' gehört zu ' + packet.protocol.toUpperCase();

    if (_assigned >= PACKETS.length) {
      setTimeout(_showQuiz, 800);
    }
  }

  function _onQuizAnswer(boxEl) {
    if (_quizAnswered) return;
    _quizAnswered = true;

    const correct = boxEl.getAttribute('data-correct') === 'true';
    const ids = ['a', 'b', 'c', 'd'];
    ids.forEach(id => {
      const b = document.getElementById('l4-quiz-' + id);
      if (b) {
        if (b._opt && b._opt.correct) {
          b.setAttribute('material', 'color:#1a4020;roughness:0.5');
        } else if (b === boxEl && !correct) {
          b.setAttribute('material', 'color:#401010;roughness:0.5');
        }
      }
    });

    if (correct) _score += 200;

    setTimeout(() => {
      if (_onComplete) _onComplete(_score);
    }, 1500);
  }

  return {
    init(onComplete) {
      _score = 0;
      _assigned = 0;
      _quizAnswered = false;
      _selectedPaket = null;
      _onComplete = onComplete;

      PACKETS.forEach(p => {
        const el = document.getElementById(p.id);
        if (el) el.setAttribute('visible', true);
      });
      const term = document.getElementById('l4-quiz-terminal');
      if (term) term.setAttribute('visible', false);

      const taskText = document.getElementById('task-text');
      if (taskText) taskText.textContent = 'Anwendungs-Flügel: Sortiere Pakete in den richtigen Protokoll-Briefkasten';

      const scorePill = document.getElementById('score-pill');
      if (scorePill) scorePill.textContent = '0 P';
    },

    teardown() {
      PACKETS.forEach(p => {
        const el = document.getElementById(p.id);
        if (el) el.setAttribute('visible', false);
      });
      const term = document.getElementById('l4-quiz-terminal');
      if (term) term.setAttribute('visible', false);
      _onComplete = null;
    },

    getScore() { return _score; },

    handlePickup(target) {
      if (_quizAnswered) return false;
      if (target.classList.contains('paket-l4') && !_selectedPaket) {
        _selectedPaket = target;
        const badge = document.getElementById('selected-badge');
        if (badge) {
          badge.classList.add('visible');
          badge.textContent = '📦 ' + (target.getAttribute('data-protocol') || '').toUpperCase();
        }
        target.setAttribute('material', 'color:#ffffff');
        return true;
      }
      if (target.classList.contains('inbox-zone') && _selectedPaket) {
        const inboxProto = target.getAttribute('data-protocol');
        const paketId = _selectedPaket.id;
        _selectedPaket.setAttribute('material', 'color:#c8a060;roughness:0.9');
        _selectedPaket = null;
        const badge = document.getElementById('selected-badge');
        if (badge) badge.classList.remove('visible');
        _onDrop(paketId, inboxProto);
        return true;
      }
      if (target.classList.contains('quiz-option-l4') && _assigned >= PACKETS.length) {
        _onQuizAnswer(target);
        return true;
      }
      return false;
    },

    _dropForTest(paketId, inboxProtocol) { _onDrop(paketId, inboxProtocol); },
    _answerQuizForTest(correct) {
      const ids = ['a', 'b', 'c', 'd'];
      for (const id of ids) {
        const b = document.getElementById('l4-quiz-' + id);
        if (b && b.getAttribute('data-correct') === (correct ? 'true' : 'false')) {
          _onQuizAnswer(b);
          return;
        }
      }
    },
  };
})();
```

- [ ] **Step 2: Commit**

```bash
git add js/scenarios/layer4-anwendung.js
git commit -m "feat: layer4-anwendung.js — HTTP/DNS/FTP/SMTP-Sortierung + 3D-Quiz-Modul"
```

---

## Task 9: Update game.js — Zone Detection + E-Key Delegation

**Files:**
- Modify: `js/game.js`

- [ ] **Step 1: Add ZONE_TRANSPORT and ZONE_ANWENDUNG states + zone detection**

Find the `a-scene loaded` handler at the bottom of game.js (~line 1644). Add zone detection after the existing setup code:

```js
// Zone-Detektion: Spieler betritt Nordflügel
let _zoneCheckInterval = null;
document.querySelector('a-scene').addEventListener('loaded', () => {
  // ... existing code stays ...

  _zoneCheckInterval = setInterval(() => {
    const cam = document.querySelector('[camera]');
    if (!cam) return;
    const pos = new AFRAME.THREE.Vector3();
    cam.object3D.getWorldPosition(pos);

    if (pos.z < -16.5) {
      // In Nordflügel
      if (pos.x >= 0 && gameState !== 'ZONE_TRANSPORT') {
        enterZoneTransport();
      } else if (pos.x < 0 && gameState !== 'ZONE_ANWENDUNG') {
        enterZoneAnwendung();
      }
    } else if (pos.z >= -15.5) {
      // Zurück in Haupthalle
      if (gameState === 'ZONE_TRANSPORT') {
        L3.teardown();
        gameState = 'S1_ACTIVE';
        const taskText = document.getElementById('task-text');
        if (taskText) taskText.textContent = 'Haupthalle — Sortiere Pakete nach IP-Netzwerken.';
      } else if (gameState === 'ZONE_ANWENDUNG') {
        L4.teardown();
        gameState = 'S1_ACTIVE';
        const taskText = document.getElementById('task-text');
        if (taskText) taskText.textContent = 'Haupthalle — Sortiere Pakete nach IP-Netzwerken.';
      }
    }
  }, 400);
});

function enterZoneTransport() {
  if (!['S1_ACTIVE', 'INTRO', 'TUTORIAL'].includes(gameState)) return;
  gameState = 'ZONE_TRANSPORT';
  L3.init((score) => {
    gameState = 'S1_ACTIVE';
    const taskText = document.getElementById('task-text');
    if (taskText) taskText.textContent = 'Transport abgeschlossen (' + score + ' P). Erkunde den Anwendungs-Flügel!';
  });
}

function enterZoneAnwendung() {
  if (!['S1_ACTIVE', 'INTRO', 'TUTORIAL'].includes(gameState)) return;
  gameState = 'ZONE_ANWENDUNG';
  L4.init((score) => {
    gameState = 'S1_ACTIVE';
    const taskText = document.getElementById('task-text');
    if (taskText) taskText.textContent = 'Anwendung abgeschlossen (' + score + ' P). Erkunde den Transport-Flügel!';
  });
}
```

- [ ] **Step 2: Delegate E-key interactions to L3/L4 modules**

Find the main E-key handler in game.js. It's a `keydown` listener with `if (e.code !== 'KeyE')` guard. After the existing `selectedPaket` pickup/drop logic, add delegation to L3/L4:

Locate the section where interactable targets are resolved (the raycaster intersect check). After `const target = ...`, add at the **top** of the handler (before existing paket/palette logic), so zone modules get first pick:

```js
// Delegation an Zone-Module
if (gameState === 'ZONE_TRANSPORT' && target) {
  if (L3.handlePickup(target)) return;
}
if (gameState === 'ZONE_ANWENDUNG' && target) {
  if (L4.handlePickup(target)) return;
}
// Kiosk-Interaktion
if (target) {
  const kiosk = target.closest ? target.closest('[kiosk-interaction]') : null;
  const comp = kiosk && kiosk.components && kiosk.components['kiosk-interaction'];
  if (comp) { comp.toggle(); return; }
}
```

- [ ] **Step 3: Commit**

```bash
git add js/game.js
git commit -m "feat: game.js Zone-Detektion und E-Key-Delegation an L3/L4-Module"
```

---

## Task 10: Run Tests and Fix Failures

**Files:**
- Modify: `tests/ui.spec.js` (fix any assertion mismatches)
- Modify: any module files as needed

- [ ] **Step 1: Run all tests**

```bash
npm test
```

- [ ] **Step 2: Fix failures**

Common failure patterns and fixes:

**`L3 is not defined`**: Check that `layer3-transport.js` script tag appears before `game.js` in `index.html`.

**`l3-paket-1` not attached**: The Playwright test checks DOM. A-Frame entities are always in DOM; check that the entity has no `visible="false"` at load time — the `init()` sets them visible, but tests check DOM attachment before init. The entities should be in DOM regardless.

**Score assertion mismatch**: `_dropForTest` requires `init()` to be called first — the `beforeEach` sets `gameState` but doesn't call `L3.init()`. Fix: call `L3.init(() => {})` in the test, or modify the test to call init first (already done in the test code above).

**Quiz not showing**: After 6 correct drops via `_dropForTest`, `_showQuiz` is called immediately (no timeout in test context). If the test checks `visible` too fast, use `await page.waitForTimeout(100)` after the drops.

- [ ] **Step 3: Final test run**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add tests/ui.spec.js
git commit -m "test: L3/L4-Zone-Tests grün — Paketsortierung und Quiz verifiziert"
```

---

## Self-Review Notes

**Spec coverage check:**
- ✅ Transport-Flügel (TCP/UDP Sortierung + Quiz) — Tasks 5, 7, 9
- ✅ Anwendungs-Flügel (HTTP/DNS/FTP/SMTP + Quiz) — Tasks 5, 8, 9
- ✅ Bestehende IP-Sortierung bleibt — nicht angefasst
- ✅ Kiosk-Pattern (proximity + E) — Task 6
- ✅ Quiz in 3D (a-box entities) — Tasks 5, 7, 8
- ✅ Zone-Transition via Position — Task 9
- ✅ Alte 2D-Overlays entfernt — Task 2
- ✅ Netzzugang-Empfehlung — im Spec-Dokument, kein Code hier
- ✅ CLAUDE.md update — Task 1

**Type consistency check:**
- `L3.handlePickup(target)` / `L4.handlePickup(target)`: `target` is an HTMLElement, consistent in tasks 7, 8, 9
- `L3._dropForTest(paketId, beltId)` / `L4._dropForTest(paketId, inboxProtocol)`: string IDs, consistent with test task 3
- `L3._answerQuizForTest(correct)` / `L4._answerQuizForTest(correct)`: boolean, consistent with tests
- `gameState = 'ZONE_TRANSPORT'` / `'ZONE_ANWENDUNG'`: string constants, consistent throughout
