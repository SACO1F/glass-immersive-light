/* global document, getComputedStyle, CSS */

import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import { firefox, webkit } from "playwright-core";

const root = process.cwd();
const port = Number(process.env.BROWSER_PORT ?? 3101);
const base = `http://localhost:${port}`;
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function parseBlur(value) {
  if (!value || value === "none") return 0;
  const match = value.match(/blur\(([\d.]+)px\)/);
  return match ? Number(match[1]) : 0;
}

async function waitForServer() {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    try {
      const response = await fetch(base);
      if (response.ok) return;
    } catch {
      // Server is still starting.
    }
    await sleep(250);
  }

  throw new Error("Production server did not become ready.");
}

async function main() {
  if (process.env.BROWSER_SKIP_BUILD !== "1") {
    const build = spawnSync(process.execPath, [nextBin, "build"], {
      cwd: root,
      stdio: "inherit",
    });
    if (build.status !== 0) process.exit(build.status ?? 1);
  }

  const server = spawn(
    process.execPath,
    [nextBin, "start", "-p", String(port)],
    { cwd: root, stdio: "ignore" },
  );

  const results = [];
  const run = async (name, fn) => {
    try {
      await fn();
      results.push({ name, pass: true });
      console.log(`PASS ${name}`);
    } catch (error) {
      results.push({ name, pass: false, error });
      console.error(`FAIL ${name}: ${error.message}`);
    }
  };

  try {
    await waitForServer();

    for (const engine of [
      { name: "firefox", launcher: firefox },
      { name: "webkit", launcher: webkit },
    ]) {
      const browser = await engine.launcher.launch({ headless: true });
      const page = await browser.newPage({
        viewport: { width: 1440, height: 1000 },
      });
      const errors = [];

      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });

      await run(`${engine.name}: routes and hydration`, async () => {
        await page.goto(`${base}/`, { waitUntil: "networkidle" });
        await page.waitForSelector("h1", { timeout: 8000 });

        await page.goto(`${base}/components`, {
          waitUntil: "networkidle",
        });
        await page.waitForSelector("[data-thumb]", { timeout: 8000 });
        assert.equal(await page.locator("[data-thumb]").count(), 15);

        await page.goto(`${base}/components/refractive-card`, {
          waitUntil: "networkidle",
        });
        await page.waitForSelector(".il-refractive-card", { timeout: 8000 });
      });

      await run(`${engine.name}: mid tier blur`, async () => {
        await page.goto(`${base}/components/refractive-card?tier=mid`, {
          waitUntil: "networkidle",
        });
        await page.waitForSelector(".il-refractive-card__surface", {
          timeout: 8000,
        });

        assert.equal(
          await page
            .locator(".il-refractive-card")
            .getAttribute("data-il-tier"),
          "mid",
        );

        const supported = await page.evaluate(() =>
          CSS.supports("backdrop-filter", "blur(1px)"),
        );

        if (!supported) {
          console.log(`SKIP ${engine.name}: backdrop-filter unsupported`);
          return;
        }

        const blur = parseBlur(
          await page
            .locator(".il-refractive-card__surface")
            .evaluate((element) => getComputedStyle(element).backdropFilter),
        );
        assert.equal(blur, 10);
      });

      await run(`${engine.name}: light variant materials`, async () => {
        await page.goto(`${base}/components/refractive-card?theme=light`, {
          waitUntil: "networkidle",
        });
        await page.waitForSelector(".il-refractive-card", { timeout: 8000 });

        const tints = {};

        for (const variant of ["clear", "frosted", "tinted"]) {
          await page
            .getByRole("button", { name: variant, exact: true })
            .click();
          await page.waitForTimeout(200);
          tints[variant] = await page
            .locator(".il-refractive-card")
            .evaluate((element) =>
              getComputedStyle(element)
                .getPropertyValue("--il-card-tint")
                .trim(),
            );
        }

        assert.equal(new Set(Object.values(tints)).size, 3);
      });

      await run(`${engine.name}: modal opens and caps blur`, async () => {
        await page.goto(`${base}/components/immersive-modal?tier=mid`, {
          waitUntil: "networkidle",
        });
        await page
          .getByRole("button", { name: "打开光感弹窗" })
          .click();
        await page.waitForSelector("dialog.il-immersive-modal[open]", {
          timeout: 4000,
        });

        const panel = parseBlur(
          await page
            .locator(".il-immersive-modal__glass")
            .evaluate((element) => getComputedStyle(element).backdropFilter),
        );
        assert.ok(panel >= 0 && panel <= 10, `panel blur ${panel}`);

        await page.keyboard.press("Escape");
        await page.waitForFunction(
          () => !document.querySelector("dialog.il-immersive-modal[open]"),
          null,
          { timeout: 4000 },
        );
      });

      await run(`${engine.name}: no console errors`, async () => {
        assert.deepEqual(errors, []);
      });

      await browser.close();
    }

    const failed = results.filter((item) => !item.pass);
    console.log(
      `\n${results.length - failed.length}/${results.length} cross-browser checks passed`,
    );
    if (failed.length) process.exitCode = 1;
  } finally {
    server.kill();
  }
}

main().catch((error) => {
  console.error("CROSS-BROWSER CHECK FAILED", error);
  process.exit(1);
});
