# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui.spec.js >> Layer 5 — Büro-Flügel (Routing) >> R5-Pakete sind im DOM mit data-dest Attributen
- Location: tests/ui.spec.js:274:3

# Error details

```
Error: expect(locator).toBeAttached() failed

Locator: locator('#r5-paket-1')
Expected: attached
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeAttached" with timeout 5000ms
  - waiting for locator('#r5-paket-1')

```

```yaml
- text: ■ Lern-Szenario 1 Starte bei der blauen S1-Tafel links in der Halle — geh hin und drücke E. 75% ★ 0 Punkte ⏱ 00:00 W A S D · Leertaste = Springen · E = Interagieren · Klick zum Maus sperren 👷 Max — Lagerlogistik TCP/IP-Lagerhaus · Spielmodus 🎮 Wie möchtest du spielen? Wähle deinen Durchlauf. Du kannst den Modus für diese Sitzung nicht mehr ändern.
- button "🧭 Geführter Durchlauf Die Szenarien werden in fester Reihenfolge (S1→S5) durchlaufen. Jeder Raum ist gesperrt, bis die vorherige Aufgabe abgeschlossen ist."
- button "🧮 Freier Durchlauf Du bestimmst die Reihenfolge selbst. Keine Sperren — starte jedes Szenario per grünem Knopf im jeweiligen Raum."
- button "Enter VR mode with a headset or fullscreen without"
```

# Test source

```ts
  184 | 
  185 |   test('Falsche Zuordnung gibt -20 Punkte', async ({ page }) => {
  186 |     await page.evaluate(() => {
  187 |       L3.init(() => {});
  188 |       L3._dropForTest('l3-paket-1', 'tcp'); // correct: tcp → tcp (+100)
  189 |     });
  190 |     const before = await page.evaluate(() => L3.getScore()); // 100
  191 |     await page.evaluate(() => L3._dropForTest('l3-paket-2', 'tcp')); // wrong: udp → tcp (-20)
  192 |     const after = await page.evaluate(() => L3.getScore());
  193 |     expect(after).toBe(before - 20); // 80
  194 |   });
  195 | 
  196 |   test('Alle 5 korrekt zugeordnet ruft onComplete auf', async ({ page }) => {
  197 |     await page.evaluate(() => {
  198 |       window.__l3Complete = false;
  199 |       L3.init(() => { window.__l3Complete = true; });
  200 |       L3._dropForTest('l3-paket-1', 'tcp');
  201 |       L3._dropForTest('l3-paket-2', 'udp');
  202 |       L3._dropForTest('l3-paket-3', 'tcp');
  203 |       L3._dropForTest('l3-paket-4', 'udp');
  204 |       L3._dropForTest('l3-paket-5', 'tcp');
  205 |     });
  206 |     await page.waitForTimeout(2000);
  207 |     const completed = await page.evaluate(() => window.__l3Complete);
  208 |     expect(completed).toBe(true);
  209 |   });
  210 | });
  211 | 
  212 | test.describe('Layer 4 — Anwendungs-Flügel (Protokolle)', () => {
  213 |   test.beforeEach(async ({ page }) => {
  214 |     await page.goto('/');
  215 |     await page.evaluate(() => { gameState = 'S1_ACTIVE'; });
  216 |   });
  217 | 
  218 |   test('L4-Pakete sind im DOM mit data-protocol Attributen', async ({ page }) => {
  219 |     const packets = [
  220 |       { id: 'l4-paket-1', protocol: 'http' },
  221 |       { id: 'l4-paket-2', protocol: 'dns'  },
  222 |       { id: 'l4-paket-3', protocol: 'ftp'  },
  223 |       { id: 'l4-paket-4', protocol: 'smtp' },
  224 |       { id: 'l4-paket-5', protocol: 'http' },
  225 |       { id: 'l4-paket-6', protocol: 'dns'  },
  226 |     ];
  227 |     for (const p of packets) {
  228 |       const el = page.locator(`#${p.id}`);
  229 |       await expect(el).toBeAttached();
  230 |       const proto = await el.getAttribute('data-protocol');
  231 |       expect(proto).toBe(p.protocol);
  232 |     }
  233 |   });
  234 | 
  235 |   test('Korrekte Zuordnung gibt +100 Punkte', async ({ page }) => {
  236 |     await page.evaluate(() => L4.init(() => {}));
  237 |     const before = await page.evaluate(() => L4.getScore());
  238 |     await page.evaluate(() => L4._dropForTest('l4-paket-1', 'http'));
  239 |     const after = await page.evaluate(() => L4.getScore());
  240 |     expect(after).toBe(before + 100);
  241 |   });
  242 | 
  243 |   test('Falsche Zuordnung gibt -20 Punkte', async ({ page }) => {
  244 |     await page.evaluate(() => {
  245 |       L4.init(() => {});
  246 |       L4._dropForTest('l4-paket-1', 'http'); // correct: http → http (+100)
  247 |     });
  248 |     const before = await page.evaluate(() => L4.getScore()); // 100
  249 |     await page.evaluate(() => L4._dropForTest('l4-paket-2', 'http')); // wrong: dns → http (-20)
  250 |     const after = await page.evaluate(() => L4.getScore());
  251 |     expect(after).toBe(before - 20); // 80
  252 |   });
  253 | 
  254 |   test('Alle 6 zugeordnet → onComplete wird aufgerufen', async ({ page }) => {
  255 |     const completed = await page.evaluate(() => new Promise(resolve => {
  256 |       L4.init(score => resolve(score));
  257 |       L4._dropForTest('l4-paket-1', 'http');
  258 |       L4._dropForTest('l4-paket-2', 'dns');
  259 |       L4._dropForTest('l4-paket-3', 'ftp');
  260 |       L4._dropForTest('l4-paket-4', 'smtp');
  261 |       L4._dropForTest('l4-paket-5', 'http');
  262 |       L4._dropForTest('l4-paket-6', 'dns');
  263 |     }));
  264 |     expect(completed).toBe(600);
  265 |   });
  266 | });
  267 | 
  268 | test.describe('Layer 5 — Büro-Flügel (Routing)', () => {
  269 |   test.beforeEach(async ({ page }) => {
  270 |     await page.goto('/');
  271 |     await page.evaluate(() => { gameState = 'S1_ACTIVE'; });
  272 |   });
  273 | 
  274 |   test('R5-Pakete sind im DOM mit data-dest Attributen', async ({ page }) => {
  275 |     const packets = [
  276 |       { id: 'r5-paket-1', dest: '10.0.0.5'      },
  277 |       { id: 'r5-paket-2', dest: '192.168.1.10'  },
  278 |       { id: 'r5-paket-3', dest: '172.16.5.3'    },
  279 |       { id: 'r5-paket-4', dest: '10.0.0.20'     },
  280 |       { id: 'r5-paket-5', dest: '192.168.1.42'  },
  281 |     ];
  282 |     for (const p of packets) {
  283 |       const el = page.locator(`#${p.id}`);
> 284 |       await expect(el).toBeAttached();
      |                        ^ Error: expect(locator).toBeAttached() failed
  285 |       expect(await el.getAttribute('data-dest')).toBe(p.dest);
  286 |     }
  287 |   });
  288 | 
  289 |   test('Korrekte Zuordnung gibt +100 Punkte', async ({ page }) => {
  290 |     await page.evaluate(() => P2S5.init(() => {}));
  291 |     const before = await page.evaluate(() => P2S5.getScore());
  292 |     await page.evaluate(() => P2S5._routeForTest('r5-paket-1', 'r5-exit-a'));
  293 |     expect(await page.evaluate(() => P2S5.getScore())).toBe(before + 100);
  294 |   });
  295 | 
  296 |   test('Falsche Zuordnung gibt -20 Punkte', async ({ page }) => {
  297 |     await page.evaluate(() => { P2S5.init(() => {}); P2S5._routeForTest('r5-paket-1', 'r5-exit-a'); });
  298 |     const before = await page.evaluate(() => P2S5.getScore());
  299 |     await page.evaluate(() => P2S5._routeForTest('r5-paket-2', 'r5-exit-a'));
  300 |     expect(await page.evaluate(() => P2S5.getScore())).toBe(before - 20);
  301 |   });
  302 | 
  303 |   test('Alle 5 zugeordnet → onComplete mit 500 aufgerufen', async ({ page }) => {
  304 |     const score = await page.evaluate(() => new Promise(resolve => {
  305 |       P2S5.init(s => resolve(s));
  306 |       P2S5._routeForTest('r5-paket-1', 'r5-exit-a');
  307 |       P2S5._routeForTest('r5-paket-2', 'r5-exit-b');
  308 |       P2S5._routeForTest('r5-paket-3', 'r5-exit-c');
  309 |       P2S5._routeForTest('r5-paket-4', 'r5-exit-a');
  310 |       P2S5._routeForTest('r5-paket-5', 'r5-exit-b');
  311 |     }));
  312 |     expect(score).toBe(500);
  313 |   });
  314 | });
  315 | 
  316 | test.describe('Durchlauf-Modi (ScenarioManager)', () => {
  317 |   test.beforeEach(async ({ page }) => {
  318 |     await page.goto('/');
  319 |   });
  320 | 
  321 |   test('Geführter Modus: Reihenfolge wird erzwungen (canEnter)', async ({ page }) => {
  322 |     await page.locator('#mode-guided-btn').click();
  323 |     const r = await page.evaluate(() => ({
  324 |       free: ScenarioManager.isFree(),
  325 |       s1: ScenarioManager.canEnter('s1'),
  326 |       s3: ScenarioManager.canEnter('s3'),
  327 |     }));
  328 |     expect(r.free).toBe(false);
  329 |     expect(r.s1).toBe(true);   // erstes Szenario immer offen
  330 |     expect(r.s3).toBe(false);  // gesperrt, solange S2 nicht abgeschlossen
  331 |   });
  332 | 
  333 |   test('Freier Modus: jedes Szenario sofort betretbar', async ({ page }) => {
  334 |     await page.locator('#mode-free-btn').click();
  335 |     const r = await page.evaluate(() => ({
  336 |       free: ScenarioManager.isFree(),
  337 |       all: ['s1', 's2', 's3', 's4', 's5'].map(id => ScenarioManager.canEnter(id)),
  338 |     }));
  339 |     expect(r.free).toBe(true);
  340 |     expect(r.all).toEqual([true, true, true, true, true]);
  341 |   });
  342 | 
  343 |   test('Grüne Start-Trigger (5 Szenarien + Assessment) existieren, initial versteckt', async ({ page }) => {
  344 |     await expect(page.locator('.free-trigger')).toHaveCount(6);
  345 |     for (const id of ['s1', 's2', 's3', 's4', 's5', 'assessment']) {
  346 |       await expect(page.locator(`#free-trigger-${id}`)).toHaveAttribute('visible', 'false');
  347 |     }
  348 |   });
  349 | 
  350 |   test('Frei-Modus: abgeschlossenes Szenario bleibt wiederholbar (canEnter)', async ({ page }) => {
  351 |     await page.locator('#mode-free-btn').click();
  352 |     const r = await page.evaluate(() => {
  353 |       ScenarioManager.markDone('s3');
  354 |       return { done: ScenarioManager.isDone('s3'), canEnter: ScenarioManager.canEnter('s3') };
  355 |     });
  356 |     expect(r.done).toBe(true);
  357 |     expect(r.canEnter).toBe(true); // trotz abgeschlossen → frei wiederholbar
  358 |   });
  359 | });
  360 | 
```