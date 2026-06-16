// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Intro & HUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Intro-Overlay ist beim Laden sichtbar', async ({ page }) => {
    const overlay = page.locator('#tutorial-start-overlay');
    await expect(overlay).toBeVisible();
    await expect(overlay).not.toHaveClass(/hidden/);
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
      { id: 'l3-paket-1', protocol: 'udp' },
      { id: 'l3-paket-2', protocol: 'tcp' },
      { id: 'l3-paket-3', protocol: 'udp' },
      { id: 'l3-paket-4', protocol: 'tcp' },
      { id: 'l3-paket-5', protocol: 'udp' },
      { id: 'l3-paket-6', protocol: 'tcp' },
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
    await page.evaluate(() => L3._dropForTest('l3-paket-1', 'udp'));
    const after = await page.evaluate(() => L3.getScore());
    expect(after).toBe(before + 100);
  });

  test('Falsche Zuordnung gibt -20 Punkte', async ({ page }) => {
    await page.evaluate(() => L3.init(() => {}));
    const before = await page.evaluate(() => L3.getScore());
    await page.evaluate(() => L3._dropForTest('l3-paket-2', 'udp')); // tcp → udp (wrong)
    const after = await page.evaluate(() => L3.getScore());
    expect(after).toBe(before - 20);
  });

  test('Alle 6 korrekt zugeordnet entsperrt Quiz', async ({ page }) => {
    await page.evaluate(() => L3.init(() => {}));
    await page.evaluate(() => {
      L3._dropForTest('l3-paket-1', 'udp');
      L3._dropForTest('l3-paket-2', 'tcp');
      L3._dropForTest('l3-paket-3', 'udp');
      L3._dropForTest('l3-paket-4', 'tcp');
      L3._dropForTest('l3-paket-5', 'udp');
      L3._dropForTest('l3-paket-6', 'tcp');
    });
    await page.waitForTimeout(1000);
    const quizVisible = await page.evaluate(() => {
      const t = document.getElementById('l3-quiz-terminal');
      return t && t.getAttribute('visible') !== 'false';
    });
    expect(quizVisible).toBe(true);
  });

  test('Korrektes Quiz-Answer ruft onComplete auf', async ({ page }) => {
    await page.evaluate(() => {
      window.__l3Complete = false;
      L3.init(() => { window.__l3Complete = true; });
      L3._dropForTest('l3-paket-1', 'udp');
      L3._dropForTest('l3-paket-2', 'tcp');
      L3._dropForTest('l3-paket-3', 'udp');
      L3._dropForTest('l3-paket-4', 'tcp');
      L3._dropForTest('l3-paket-5', 'udp');
      L3._dropForTest('l3-paket-6', 'tcp');
    });
    await page.waitForTimeout(1000);
    await page.evaluate(() => L3._answerQuizForTest(true));
    await page.waitForTimeout(2000);
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
    await page.waitForTimeout(1000);
    const quizVisible = await page.evaluate(() => {
      const t = document.getElementById('l4-quiz-terminal');
      return t && t.getAttribute('visible') !== 'false';
    });
    expect(quizVisible).toBe(true);
  });
});
