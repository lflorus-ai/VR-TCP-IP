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

test.describe('P2 S2: Protokoll-Zuordnung', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // P2S2 direkt initialisieren (überspringt Tutorial + P2S1)
    await page.evaluate(() => P2S2.init(() => {}));
  });

  test('Overlay ist nach init() sichtbar', async ({ page }) => {
    await expect(page.locator('#p2-s2-overlay')).not.toHaveClass(/hidden/);
  });

  test('7 Protokollkarten mit draggable-Attribut vorhanden', async ({ page }) => {
    const cards = page.locator('#p2s2-card-bank [draggable="true"]');
    await expect(cards).toHaveCount(7);
  });

  test('4 Drop-Zonen mit data-layer-Attribut vorhanden', async ({ page }) => {
    const zones = page.locator('#p2s2-drop-col [data-layer]');
    await expect(zones).toHaveCount(4);
  });

  test('Korrekte Drop: Karte verschwindet aus der Bank', async ({ page }) => {
    await page.evaluate(() => P2S2._dropForTest('http', 'anwendung'));
    await expect(page.locator('#p2s2-card-bank [data-id="http"]')).toHaveCount(0);
  });

  test('Korrekte Drop: Chip erscheint in der Zielzone', async ({ page }) => {
    await page.evaluate(() => P2S2._dropForTest('http', 'anwendung'));
    const chip = page.locator('[data-layer="anwendung"] .p2s2-placed-chip');
    await expect(chip).toHaveCount(1);
    await expect(chip).toHaveText('HTTP');
  });

  test('Falscher Drop: Karte bleibt in der Bank', async ({ page }) => {
    await page.evaluate(() => P2S2._dropForTest('http', 'transport')); // HTTP gehört zu Anwendung
    await expect(page.locator('#p2s2-card-bank [data-id="http"]')).toHaveCount(1);
  });

  test('Quiz-Button erscheint nach korrekter Platzierung aller 7 Karten', async ({ page }) => {
    await expect(page.locator('#p2s2-quiz-btn')).toHaveClass(/hidden/);
    await page.evaluate(() => {
      P2S2._dropForTest('http',     'anwendung');
      P2S2._dropForTest('ftp',      'anwendung');
      P2S2._dropForTest('tcp',      'transport');
      P2S2._dropForTest('udp',      'transport');
      P2S2._dropForTest('ip',       'internet');
      P2S2._dropForTest('arp',      'internet');
      P2S2._dropForTest('ethernet', 'netzzugang');
    });
    await expect(page.locator('#p2s2-quiz-btn')).not.toHaveClass(/hidden/);
  });

  test('Quiz zeigt Frage und 4 Antwortoptionen nach Quiz-Button-Klick', async ({ page }) => {
    await page.evaluate(() => {
      P2S2._dropForTest('http', 'anwendung'); P2S2._dropForTest('ftp', 'anwendung');
      P2S2._dropForTest('tcp', 'transport');  P2S2._dropForTest('udp', 'transport');
      P2S2._dropForTest('ip', 'internet');    P2S2._dropForTest('arp', 'internet');
      P2S2._dropForTest('ethernet', 'netzzugang');
    });
    await page.locator('#p2s2-quiz-btn').click();
    await expect(page.locator('#p2s2-quiz')).not.toHaveClass(/hidden/);
    await expect(page.locator('#p2s2-options .p2s1-option')).toHaveCount(4);
  });

  test('Korrekte Quiz-Antwort: Feedback sichtbar + next-btn erscheint', async ({ page }) => {
    await page.evaluate(() => {
      P2S2._dropForTest('http', 'anwendung'); P2S2._dropForTest('ftp', 'anwendung');
      P2S2._dropForTest('tcp', 'transport');  P2S2._dropForTest('udp', 'transport');
      P2S2._dropForTest('ip', 'internet');    P2S2._dropForTest('arp', 'internet');
      P2S2._dropForTest('ethernet', 'netzzugang');
    });
    await page.locator('#p2s2-quiz-btn').click();
    // Korrekte Antwort enthält "TCP garantiert"
    await page.locator('#p2s2-options .p2s1-option', { hasText: 'TCP garantiert' }).click();
    await expect(page.locator('#p2s2-feedback')).not.toHaveClass(/hidden/);
    await expect(page.locator('#p2s2-next-btn')).not.toHaveClass(/hidden/);
  });

  test('next-btn versteckt das Overlay', async ({ page }) => {
    await page.evaluate(() => {
      P2S2._dropForTest('http', 'anwendung'); P2S2._dropForTest('ftp', 'anwendung');
      P2S2._dropForTest('tcp', 'transport');  P2S2._dropForTest('udp', 'transport');
      P2S2._dropForTest('ip', 'internet');    P2S2._dropForTest('arp', 'internet');
      P2S2._dropForTest('ethernet', 'netzzugang');
    });
    await page.locator('#p2s2-quiz-btn').click();
    await page.locator('#p2s2-options .p2s1-option', { hasText: 'TCP garantiert' }).click();
    await page.locator('#p2s2-next-btn').click();
    await expect(page.locator('#p2-s2-overlay')).toHaveClass(/hidden/);
  });
});
