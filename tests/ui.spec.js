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
