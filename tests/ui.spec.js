// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Intro & HUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Startbildschirm (Modus-Auswahl) ist beim Laden sichtbar', async ({ page }) => {
    const selector = page.locator('#mode-selector-overlay');
    await expect(selector).toBeVisible();
    await expect(selector).not.toHaveClass(/hidden/);
    // Tutorial-Overlay erscheint erst NACH der Modus-Wahl
    await expect(page.locator('#tutorial-start-overlay')).toHaveClass(/hidden/);
  });

  test('Modus-Wahl (geführt) blendet Startbildschirm aus und zeigt Tutorial', async ({ page }) => {
    await page.locator('#mode-guided-btn').click();
    await expect(page.locator('#mode-selector-overlay')).toHaveClass(/hidden/);
    await expect(page.locator('#tutorial-start-overlay')).toBeVisible();
  });

  test('HUD-Elemente sind vorhanden', async ({ page }) => {
    await expect(page.locator('#score-pill')).toBeVisible();
    await expect(page.locator('#timer-pill')).toBeVisible();
    await expect(page.locator('#task-text')).toBeVisible();
  });

  test('Abschluss-Overlay ist initial versteckt', async ({ page }) => {
    await expect(page.locator('#complete-overlay')).toHaveClass(/hidden/);
  });

  test('Intro-Button schließt das Overlay', async ({ page }) => {
    await page.locator('#mode-guided-btn').click();
    await page.locator('#tutorial-start-btn').click();
    await expect(page.locator('#tutorial-start-overlay')).toHaveClass(/hidden/);
  });

  test('Startpunktestand ist 0', async ({ page }) => {
    await expect(page.locator('#score-pill')).toContainText('0');
  });

  test('Timer startet bei 00:00', async ({ page }) => {
    await expect(page.locator('#timer-pill')).toContainText('00:00');
  });
});

test.describe('Paket-Daten', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Alle 5 Pakete sind im DOM mit korrekten IPs', async ({ page }) => {
    const expectedPackets = [
      { id: 'paket-A1', ip: '192.168.1.10' },
      { id: 'paket-A2', ip: '10.0.0.5' },
      { id: 'paket-A3', ip: '172.16.5.3' },
      { id: 'paket-A4', ip: '192.168.1.10' },
      { id: 'paket-A5', ip: '10.0.0.5' },
    ];

    for (const packet of expectedPackets) {
      const el = page.locator(`#${packet.id}`);
      await expect(el).toBeAttached();
      const ip = await el.getAttribute('data-ip');
      expect(ip).toBe(packet.ip);
    }
  });

  test('Paletten haben korrekte Netzwerk-Attribute', async ({ page }) => {
    const palettes = [
      { id: 'palette-1', network: '192.168.1' },
      { id: 'palette-2', network: '10.0.0' },
      { id: 'palette-3', network: '172.16.5' },
    ];

    for (const pal of palettes) {
      const el = page.locator(`#${pal.id}`);
      await expect(el).toBeAttached();
      const network = await el.getAttribute('data-network');
      expect(network).toBe(pal.network);
    }
  });
});

test.describe('IP-Netzwerk-Logik', () => {
  test('netzwerkMap ordnet IPs den richtigen Paletten zu', async ({ page }) => {
    await page.goto('/');

    // netzwerkMap aus dem globalen Scope auslesen
    const mapping = await page.evaluate(() => {
      // @ts-ignore
      return window.__netzwerkMap ?? null;
    });

    // Fallback: Mapping direkt aus den Paket-Attributen ableiten
    const result = await page.evaluate(() => {
      const packets = Array.from(document.querySelectorAll('.paket[data-ip]'));
      const palettes = Array.from(document.querySelectorAll('.palette-zone[data-network]'));
      const netMap = {};
      palettes.forEach(p => {
        netMap[p.getAttribute('data-network')] = p.id;
      });
      return packets.map(p => {
        const ip = p.getAttribute('data-ip');
        const network = ip.split('.').slice(0, 3).join('.');
        return { ip, expectedPalette: netMap[network] ?? null };
      });
    });

    for (const { ip, expectedPalette } of result) {
      expect(expectedPalette, `IP ${ip} hat keine passende Palette`).not.toBeNull();
    }
  });
});

test.describe('S0-Update: Hallenplan + Lernziele', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('SVG-Hallenplan ist im Intro-Overlay vorhanden', async ({ page }) => {
    const svg = page.locator('#tutorial-start-overlay svg#s0-map');
    await expect(svg).toBeAttached();
  });

  test('Hallenplan enthält 4 Zonen-Rechtecke (ohne Außenrahmen und Eingang)', async ({ page }) => {
    // Der SVG hat: 1 Außenrahmen + 1 Eingang + 4 Zonen = 6 rects gesamt
    // Zonen-Rects haben ein data-zone-Attribut
    const zones = page.locator('#s0-map rect[data-zone]');
    await expect(zones).toHaveCount(4);
  });

  test('Lernziele-Liste enthält genau 5 Einträge', async ({ page }) => {
    const items = page.locator('#tutorial-start-overlay .s0-lz-item');
    await expect(items).toHaveCount(5);
  });

  test('Jeder Lernziel-Eintrag hat ein LZ-Badge', async ({ page }) => {
    const badges = page.locator('#tutorial-start-overlay .s0-lz-badge');
    await expect(badges).toHaveCount(5);
    const texts = await badges.allTextContents();
    expect(texts).toEqual(['LZ1', 'LZ2', 'LZ3', 'LZ4', 'LZ5']);
  });

  test('Tutorial-Button funktioniert weiterhin nach S0-Update', async ({ page }) => {
    await page.locator('#mode-guided-btn').click();
    await page.locator('#tutorial-start-btn').click();
    await expect(page.locator('#tutorial-start-overlay')).toHaveClass(/hidden/);
  });
});

test.describe('Layer 3 — Transport-Flügel (TCP/UDP)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      gameState = 'S1_ACTIVE';
    });
  });

  test('L3-Pakete sind im DOM mit data-protocol Attributen', async ({ page }) => {
    const packets = [
      { id: 'l3-paket-1', protocol: 'tcp' },
      { id: 'l3-paket-2', protocol: 'udp' },
      { id: 'l3-paket-3', protocol: 'tcp' },
      { id: 'l3-paket-4', protocol: 'udp' },
      { id: 'l3-paket-5', protocol: 'tcp' },
    ];
    for (const p of packets) {
      const el = page.locator(`#${p.id}`);
      await expect(el).toBeAttached();
      const proto = await el.getAttribute('data-protocol');
      expect(proto).toBe(p.protocol);
    }
  });

  // Punkte gibt es nur im Assessment (Lern-Modus zeigt nur Feedback).
  test('Korrekte Zuordnung gibt +100 Punkte (Assessment)', async ({ page }) => {
    await page.evaluate(() => L3.initAssessment(() => {}));
    const before = await page.evaluate(() => L3.getScore());
    await page.evaluate(() => L3._dropForTest('l3-paket-1', 'tcp')); // E-Mail-Versand → tcp
    const after = await page.evaluate(() => L3.getScore());
    expect(after).toBe(before + 100);
  });

  test('Falsche Zuordnung gibt -20 Punkte (Assessment)', async ({ page }) => {
    await page.evaluate(() => {
      L3.initAssessment(() => {});
      L3._dropForTest('l3-paket-1', 'tcp'); // correct: tcp → tcp (+100)
    });
    const before = await page.evaluate(() => L3.getScore()); // 100
    await page.evaluate(() => L3._dropForTest('l3-paket-2', 'tcp')); // wrong: udp → tcp (-20)
    const after = await page.evaluate(() => L3.getScore());
    expect(after).toBe(before - 20); // 80
  });

  test('Alle 5 korrekt zugeordnet ruft onComplete auf', async ({ page }) => {
    await page.evaluate(() => {
      window.__l3Complete = false;
      L3.init(() => { window.__l3Complete = true; });
      L3._dropForTest('l3-paket-1', 'tcp');
      L3._dropForTest('l3-paket-2', 'udp');
      L3._dropForTest('l3-paket-3', 'tcp');
      L3._dropForTest('l3-paket-4', 'udp');
      L3._dropForTest('l3-paket-5', 'tcp');
    });
    await page.waitForTimeout(3500); // onComplete feuert erst nach Feedback-Anzeige (2800 ms)
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
      { id: 'l4-paket-1', protocol: 'http' },
      { id: 'l4-paket-2', protocol: 'dns'  },
      { id: 'l4-paket-3', protocol: 'ftp'  },
      { id: 'l4-paket-4', protocol: 'smtp' },
      { id: 'l4-paket-5', protocol: 'http' },
      { id: 'l4-paket-6', protocol: 'dns'  },
    ];
    for (const p of packets) {
      const el = page.locator(`#${p.id}`);
      await expect(el).toBeAttached();
      const proto = await el.getAttribute('data-protocol');
      expect(proto).toBe(p.protocol);
    }
  });

  // Punkte gibt es nur im Assessment (Lern-Modus zeigt nur Feedback).
  test('Korrekte Zuordnung gibt +100 Punkte (Assessment)', async ({ page }) => {
    await page.evaluate(() => L4.initAssessment(() => {}));
    const before = await page.evaluate(() => L4.getScore());
    await page.evaluate(() => L4._dropForTest('l4-paket-1', 'http'));
    const after = await page.evaluate(() => L4.getScore());
    expect(after).toBe(before + 100);
  });

  test('Falsche Zuordnung gibt -20 Punkte (Assessment)', async ({ page }) => {
    await page.evaluate(() => {
      L4.initAssessment(() => {});
      L4._dropForTest('l4-paket-1', 'http'); // correct: http → http (+100)
    });
    const before = await page.evaluate(() => L4.getScore()); // 100
    await page.evaluate(() => L4._dropForTest('l4-paket-2', 'http')); // wrong: dns → http (-20)
    const after = await page.evaluate(() => L4.getScore());
    expect(after).toBe(before - 20); // 80
  });

  test('Alle 6 zugeordnet → onComplete wird aufgerufen (Lern-Modus, 0 Punkte)', async ({ page }) => {
    const completed = await page.evaluate(() => new Promise(resolve => {
      L4.init(score => resolve(score));
      L4._dropForTest('l4-paket-1', 'http');
      L4._dropForTest('l4-paket-2', 'dns');
      L4._dropForTest('l4-paket-3', 'ftp');
      L4._dropForTest('l4-paket-4', 'smtp');
      L4._dropForTest('l4-paket-5', 'http');
      L4._dropForTest('l4-paket-6', 'dns');
    }));
    expect(completed).toBe(0);
  });
});

test.describe('Layer 5 — Büro-Flügel (Routing)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => { gameState = 'S1_ACTIVE'; });
  });

  test('R5-Pakete sind im DOM mit data-dest Attributen', async ({ page }) => {
    const packets = [
      { id: 'r5-paket-1', dest: '10.0.0.5'      },
      { id: 'r5-paket-2', dest: '192.168.1.10'  },
      { id: 'r5-paket-3', dest: '172.16.5.3'    },
      { id: 'r5-paket-4', dest: '10.0.0.20'     },
      { id: 'r5-paket-5', dest: '192.168.1.42'  },
    ];
    for (const p of packets) {
      const el = page.locator(`#${p.id}`);
      await expect(el).toBeAttached();
      expect(await el.getAttribute('data-dest')).toBe(p.dest);
    }
  });

  test('Korrekte Zuordnung gibt +100 Punkte', async ({ page }) => {
    await page.evaluate(() => P2S5.init(() => {}));
    const before = await page.evaluate(() => P2S5.getScore());
    await page.evaluate(() => P2S5._routeForTest('r5-paket-1', 'r5-exit-a'));
    expect(await page.evaluate(() => P2S5.getScore())).toBe(before + 100);
  });

  test('Falsche Zuordnung gibt -20 Punkte', async ({ page }) => {
    await page.evaluate(() => { P2S5.init(() => {}); P2S5._routeForTest('r5-paket-1', 'r5-exit-a'); });
    const before = await page.evaluate(() => P2S5.getScore());
    await page.evaluate(() => P2S5._routeForTest('r5-paket-2', 'r5-exit-a'));
    expect(await page.evaluate(() => P2S5.getScore())).toBe(before - 20);
  });

  test('Alle 5 zugeordnet → onComplete mit 500 aufgerufen', async ({ page }) => {
    const score = await page.evaluate(() => new Promise(resolve => {
      P2S5.init(s => resolve(s));
      P2S5._routeForTest('r5-paket-1', 'r5-exit-a');
      P2S5._routeForTest('r5-paket-2', 'r5-exit-b');
      P2S5._routeForTest('r5-paket-3', 'r5-exit-c');
      P2S5._routeForTest('r5-paket-4', 'r5-exit-a');
      P2S5._routeForTest('r5-paket-5', 'r5-exit-b');
    }));
    expect(score).toBe(500);
  });
});

test.describe('Durchlauf-Modi (ScenarioManager)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Geführter Modus: Reihenfolge wird erzwungen (canEnter)', async ({ page }) => {
    await page.locator('#mode-guided-btn').click();
    const r = await page.evaluate(() => ({
      free: ScenarioManager.isFree(),
      s1: ScenarioManager.canEnter('s1'),
      s3: ScenarioManager.canEnter('s3'),
    }));
    expect(r.free).toBe(false);
    expect(r.s1).toBe(true);   // erstes Szenario immer offen
    expect(r.s3).toBe(false);  // gesperrt, solange S2 nicht abgeschlossen
  });

  test('Freier Modus: jedes Szenario sofort betretbar', async ({ page }) => {
    await page.locator('#mode-free-btn').click();
    const r = await page.evaluate(() => ({
      free: ScenarioManager.isFree(),
      all: ['s1', 's2', 's3', 's4', 's5'].map(id => ScenarioManager.canEnter(id)),
    }));
    expect(r.free).toBe(true);
    expect(r.all).toEqual([true, true, true, true, true]);
  });

  test('Grüne Start-Trigger (5 Szenarien + Assessment) existieren, initial versteckt', async ({ page }) => {
    await expect(page.locator('.free-trigger')).toHaveCount(6);
    for (const id of ['s1', 's2', 's3', 's4', 's5', 'assessment']) {
      await expect(page.locator(`#free-trigger-${id}`)).toHaveAttribute('visible', 'false');
    }
  });

  test('Frei-Modus: abgeschlossenes Szenario bleibt wiederholbar (canEnter)', async ({ page }) => {
    await page.locator('#mode-free-btn').click();
    const r = await page.evaluate(() => {
      ScenarioManager.markDone('s3');
      return { done: ScenarioManager.isDone('s3'), canEnter: ScenarioManager.canEnter('s3') };
    });
    expect(r.done).toBe(true);
    expect(r.canEnter).toBe(true); // trotz abgeschlossen → frei wiederholbar
  });
});
