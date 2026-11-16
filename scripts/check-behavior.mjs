/* global document, navigator, getComputedStyle, HTMLCanvasElement */

import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import { chromium } from "playwright-core";

const root = process.cwd();
const port = Number(process.env.BEHAVIOR_PORT ?? 3100);
const base = `http://localhost:${port}`;
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function parseBlur(value) {
  if (!value || value === "none") return 0;
  const match = value.match(/blur\(([\d.]+)px\)/);
  return match ? Number(match[1]) : 0;
}

async function launchBrowser() {
  const channels = [
    process.env.PLAYWRIGHT_CHANNEL,
    process.platform === "win32" ? "msedge" : "chrome",
    "chrome",
    "msedge",
  ].filter(Boolean);

  const errors = [];

  for (const channel of [...new Set(channels)]) {
    try {
      return await chromium.launch({ channel, headless: true });
    } catch (error) {
      errors.push(`${channel}: ${error.message.split("\n")[0]}`);
    }
  }

  throw new Error(
    `No supported Chromium browser found. Set PLAYWRIGHT_CHANNEL.\n${errors.join("\n")}`,
  );
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
  if (process.env.BEHAVIOR_SKIP_BUILD !== "1") {
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

  let browser;
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
    browser = await launchBrowser();
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      permissions: ["clipboard-read", "clipboard-write"],
    });
    const page = await context.newPage();

    const open = async (pathname) => {
      await page.goto(`${base}${pathname}`, {
        waitUntil: "domcontentloaded",
      });
      await page.waitForTimeout(200);
    };

    const waitTier = async (selector, expected) => {
      await page.waitForFunction(
        ([target, tier]) =>
          document.querySelector(target)?.getAttribute("data-il-tier") ===
          tier,
        [selector, expected],
        { timeout: 5000 },
      );
    };

    const clickTier = async (label) => {
      await page
        .locator('[aria-label="设备档位模拟"]')
        .getByRole("button", { name: label, exact: true })
        .click();
      await page.waitForTimeout(350);
    };

    const backdropOf = (selector) =>
      page
        .locator(selector)
        .evaluate((element) => getComputedStyle(element).backdropFilter);

    await run("copy exports three files", async () => {
      await open("/components/rim-light");
      await page.getByRole("button", { name: /复制全部/ }).click();
      await page.waitForFunction(
        () => Boolean(document.querySelector('[data-copy-state="copied"]')),
        null,
        { timeout: 4000 },
      );
      const clipboard = await page.evaluate(() =>
        navigator.clipboard.readText(),
      );
      for (const file of ["index.tsx", "styles.css", "use-optical-tier.ts"]) {
        assert.ok(clipboard.includes(file), `clipboard missing ${file}`);
      }
    });

    await run("library search and layer filters", async () => {
      await open("/components");
      assert.equal(await page.locator("[data-thumb]").count(), 16);

      await page.getByPlaceholder("搜索组件名或用途").fill("Liquid");
      assert.equal(await page.locator("[data-thumb]").count(), 1);

      await page.getByPlaceholder("搜索组件名或用途").fill("");
      await page.getByRole("button", { name: "场景组件", exact: true }).click();
      assert.equal(await page.locator("[data-thumb]").count(), 5);

      await page.getByRole("button", { name: "全部", exact: true }).click();
      await page.getByPlaceholder("搜索组件名或用途").fill("no-such-component");
      assert.equal(await page.locator("[data-thumb]").count(), 0);
      await page.getByRole("button", { name: "清除筛选" }).click();
      assert.equal(await page.locator("[data-thumb]").count(), 16);
    });

    await run("theme and variant materials", async () => {
      const expected = {
        dark: { clear: "0.04", frosted: "0.08", tinted: "0.1" },
        light: { clear: "0.015", frosted: "0.05", tinted: "0.14" },
      };

      for (const theme of ["dark", "light"]) {
        await open(`/components/refractive-card?theme=${theme}`);
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

        assert.equal(
          new Set(Object.values(tints)).size,
          3,
          `${theme} variants share the same tint: ${JSON.stringify(tints)}`,
        );

        for (const variant of Object.keys(expected[theme])) {
          assert.ok(
            tints[variant].includes(expected[theme][variant]),
            `${theme}/${variant} tint: ${tints[variant]}`,
          );
        }
      }
    });

    await run("material switch keeps CSS base honest", async () => {
      await open("/components/refractive-card?tier=mid");
      const card = page.locator(".il-refractive-card");

      assert.equal(
        await card.getAttribute("data-il-material"),
        "immersive-light",
      );
      assert.equal(await page.locator(".il-refractive-card__surface").count(), 1);

      await page
        .getByRole("button", { name: "液态玻璃", exact: true })
        .click();
      await page.waitForSelector(".il-refractive-card__glass", {
        timeout: 4000,
      });

      assert.equal(
        await card.getAttribute("data-il-material"),
        "liquid-glass",
      );
      assert.equal(await card.getAttribute("data-il-backend"), "css");
      assert.equal(await card.getAttribute("data-il-dispersion"), "off");
      assert.equal(await page.locator(".il-refractive-card__surface").count(), 0);
      assert.equal(
        parseBlur(await backdropOf(".il-refractive-card__glass")),
        10,
      );

      const tints = {};
      for (const variant of ["clear", "frosted", "tinted"]) {
        await page
          .getByRole("button", { name: variant, exact: true })
          .click();
        await page.waitForTimeout(180);
        tints[variant] = await card.evaluate((element) =>
          getComputedStyle(element)
            .getPropertyValue("--il-card-lg-tint")
            .trim(),
        );
      }
      assert.equal(
        new Set(Object.values(tints)).size,
        3,
        `liquid-glass variants share the same tint: ${JSON.stringify(tints)}`,
      );

      await clickTier("T3");
      await waitTier(".il-refractive-card", "low");
      assert.equal(
        parseBlur(await backdropOf(".il-refractive-card__glass")),
        0,
      );

      await clickTier("Auto");
      await waitTier(".il-refractive-card", "mid");
      assert.equal(
        parseBlur(await backdropOf(".il-refractive-card__glass")),
        10,
      );

      await page
        .getByRole("button", { name: "沉浸光感", exact: true })
        .click();
      await page.waitForSelector(".il-refractive-card__surface", {
        timeout: 4000,
      });
      assert.equal(
        await card.getAttribute("data-il-material"),
        "immersive-light",
      );
    });

    await run("liquid glass light mode stays legible", async () => {
      await open("/components/refractive-card?theme=light&tier=mid");
      await page
        .getByRole("button", { name: "液态玻璃", exact: true })
        .click();
      await page.waitForSelector(".il-refractive-card__glass", {
        timeout: 4000,
      });

      const card = page.locator(".il-refractive-card");
      assert.equal(
        await card.getAttribute("data-il-material"),
        "liquid-glass",
      );
      assert.equal(
        parseBlur(await backdropOf(".il-refractive-card__glass")),
        10,
      );

      const tint = await card.evaluate((element) =>
        getComputedStyle(element).getPropertyValue("--il-card-lg-tint").trim(),
      );
      assert.ok(tint.length > 0, "light liquid-glass tint is empty");

      assert.equal(
        await page
          .locator(".il-refractive-card__content")
          .evaluate((element) => getComputedStyle(element).color),
        "rgb(11, 19, 26)",
      );
    });

    await run("glass hero webgl, tier fallback, and copy", async () => {
      await open("/components/liquid-glass-hero?theme=light&tier=high");
      await page.waitForSelector(".il-glass-hero", { timeout: 8000 });
      await page.waitForFunction(
        () =>
          document
            .querySelector(".il-glass-hero")
            ?.getAttribute("data-il-backend") === "webgl",
        null,
        { timeout: 8000 },
      );

      const hero = page.locator(".il-glass-hero");
      assert.equal(
        await hero.getAttribute("data-il-material"),
        "liquid-glass",
      );
      assert.equal(await hero.getAttribute("data-il-tint"), "cool");
      assert.equal(
        await hero.getAttribute("data-il-webgl-status"),
        "ready",
      );
      assert.equal(await hero.getAttribute("data-il-dispersion"), "off");
      assert.equal(await page.locator(".il-glass-hero canvas").count(), 1);
      assert.equal(
        await page
          .locator(".il-glass-hero canvas")
          .evaluate((element) => getComputedStyle(element).visibility),
        "visible",
      );

      await page
        .getByRole("button", { name: "开启色散", exact: true })
        .click();
      await page.waitForFunction(
        () =>
          document
            .querySelector(".il-glass-hero")
            ?.getAttribute("data-il-dispersion") === "on",
        null,
        { timeout: 3000 },
      );

      await clickTier("T2");
      await page.waitForFunction(
        () =>
          document
            .querySelector(".il-glass-hero")
            ?.getAttribute("data-il-backend") === "css",
        null,
        { timeout: 5000 },
      );
      assert.equal(
        await hero.getAttribute("data-il-webgl-status"),
        "idle",
      );

      await clickTier("T1");
      await page.waitForFunction(
        () =>
          document
            .querySelector(".il-glass-hero")
            ?.getAttribute("data-il-backend") === "webgl",
        null,
        { timeout: 8000 },
      );
      assert.equal(await hero.getAttribute("data-il-dispersion"), "on");

      await page.getByRole("button", { name: /复制全部/ }).click();
      await page.waitForFunction(
        () => Boolean(document.querySelector('[data-copy-state="copied"]')),
        null,
        { timeout: 4000 },
      );
      const clipboard = await page.evaluate(() =>
        navigator.clipboard.readText(),
      );
      for (const file of [
        "index.tsx",
        "styles.css",
        "use-optical-tier.ts",
        "liquid-glass-runtime.ts",
      ]) {
        assert.ok(clipboard.includes(file), `clipboard missing ${file}`);
      }
    });

    await run("glass hero dark tinted glass", async () => {
      await open("/components/liquid-glass-hero?theme=dark&tier=high");
      await page.waitForSelector(".il-glass-hero", { timeout: 8000 });
      await page.waitForFunction(
        () =>
          document
            .querySelector(".il-glass-hero")
            ?.getAttribute("data-il-backend") === "webgl",
        null,
        { timeout: 8000 },
      );

      const hero = page.locator(".il-glass-hero");
      assert.equal(await hero.getAttribute("data-il-tint"), "deep-cool");
      const tint = await hero.evaluate((element) =>
        getComputedStyle(element).getPropertyValue("--il-hero-tint").trim(),
      );
      assert.ok(tint.length > 0, "dark tinted glass tint is empty");

      await clickTier("T2");
      await page.waitForFunction(
        () =>
          document
            .querySelector(".il-glass-hero")
            ?.getAttribute("data-il-backend") === "css",
        null,
        { timeout: 5000 },
      );
      assert.equal(await hero.getAttribute("data-il-tint"), "deep-cool");
      assert.equal(
        await page.locator(".il-glass-hero__fallback-glass").count(),
        1,
      );
    });

    await run("glass hero webgl failure falls back", async () => {
      const failureContext = await browser.newContext();
      const failurePage = await failureContext.newPage();
      await failurePage.addInitScript(() => {
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (type, ...args) {
          if (type === "webgl" || type === "webgl2") return null;
          return original.call(this, type, ...args);
        };
      });

      await failurePage.goto(
        `${base}/components/liquid-glass-hero?tier=high`,
        { waitUntil: "domcontentloaded" },
      );
      await failurePage.waitForFunction(
        () =>
          document
            .querySelector(".il-glass-hero")
            ?.getAttribute("data-il-webgl-status") === "fallback",
        null,
        { timeout: 8000 },
      );

      assert.equal(
        await failurePage
          .locator(".il-glass-hero")
          .getAttribute("data-il-webgl-status"),
        "fallback",
      );
      assert.equal(
        await failurePage
          .locator(".il-glass-hero__fallback-glass")
          .count(),
        1,
      );
      await failureContext.close();
    });

    await run("36 global/local tier combinations", async () => {
      const tiers = { T1: "high", T2: "mid", T3: "low" };
      const expectedBlur = { high: 14, mid: 10, low: 0 };

      for (const globalTier of ["high", "mid", "low"]) {
        await open(`/components/refractive-card?tier=${globalTier}`);

        for (const local of ["Auto", "T3", "T2", "T1", "Auto"]) {
          await clickTier(local);
          const resolved =
            local === "Auto" ? globalTier : tiers[local];
          await waitTier(".il-refractive-card", resolved);
          const blur = parseBlur(
            await backdropOf(".il-refractive-card__surface"),
          );
          assert.equal(blur, expectedBlur[resolved], `${globalTier}/${local}`);
        }

        await open(`/components/cursor-refraction-card?tier=${globalTier}`);

        for (const local of ["Auto", "T3", "T2", "T1", "Auto"]) {
          await clickTier(local);
          const resolved =
            local === "Auto" ? globalTier : tiers[local];
          await waitTier(".il-cursor-refraction-card", resolved);
          const filter = await page
            .locator(".il-cursor-refraction-card__backdrop")
            .evaluate((element) => getComputedStyle(element).filter);
          assert.equal(
            filter.includes("url("),
            resolved !== "low",
            `${globalTier}/${local}: ${filter}`,
          );
        }

        await open(`/components/liquid-light-pool?tier=${globalTier}`);

        for (const local of ["Auto", "T3", "T2", "T1", "Auto"]) {
          await clickTier(local);
          const resolved =
            local === "Auto" ? globalTier : tiers[local];
          await waitTier(".il-liquid-pool", resolved);

          if (resolved === "high") {
            await page.waitForSelector(".il-liquid-pool canvas", {
              timeout: 5000,
            });
          } else {
            await page.waitForFunction(
              () => !document.querySelector(".il-liquid-pool canvas"),
              null,
              { timeout: 5000 },
            );
          }
        }
      }
    });

    await run("reduced motion keeps tier while stopping WebGL", async () => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await open("/components/liquid-light-pool?tier=high");
      await page.waitForSelector(".il-liquid-pool canvas", { timeout: 5000 });

      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.waitForFunction(
        () => !document.querySelector(".il-liquid-pool canvas"),
        null,
        { timeout: 5000 },
      );
      assert.equal(
        await page
          .locator(".il-liquid-pool")
          .getAttribute("data-il-tier"),
        "high",
      );

      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.waitForSelector(".il-liquid-pool canvas", { timeout: 5000 });
      assert.equal(
        await page
          .locator(".il-liquid-pool")
          .getAttribute("data-il-tier"),
        "high",
      );
    });

    await run("modal panel and backdrop caps", async () => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await open("/components/immersive-modal?tier=mid");
      await page.getByRole("button", { name: "打开光感弹窗" }).click();

      const mid = await page.evaluate(() => {
        const dialog = document.querySelector("dialog.il-immersive-modal");
        const glass = document.querySelector(".il-immersive-modal__glass");
        return {
          panel: getComputedStyle(glass).backdropFilter,
          backdrop: getComputedStyle(dialog, "::backdrop").backdropFilter,
        };
      });

      assert.ok(parseBlur(mid.panel) > 0 && parseBlur(mid.panel) <= 10);
      assert.ok(parseBlur(mid.backdrop) > 0 && parseBlur(mid.backdrop) <= 10);

      await open("/components/immersive-modal?tier=low");
      await page.getByRole("button", { name: "打开光感弹窗" }).click();
      const low = await page.evaluate(() => {
        const dialog = document.querySelector("dialog.il-immersive-modal");
        const glass = document.querySelector(".il-immersive-modal__glass");
        return {
          panel: getComputedStyle(glass).backdropFilter,
          backdrop: getComputedStyle(dialog, "::backdrop").backdropFilter,
        };
      });

      assert.equal(parseBlur(low.panel), 0);
      assert.equal(parseBlur(low.backdrop), 0);
    });

    await run("reduced motion removes modal animation", async () => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await open("/components/immersive-modal");
      await page.getByRole("button", { name: "打开光感弹窗" }).click();
      await page.waitForTimeout(200);
      assert.equal(
        await page.evaluate(() => document.getAnimations().length),
        0,
      );
      await page.emulateMedia({ reducedMotion: "no-preference" });
    });

    await run("webgl context loss falls back", async () => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await open("/components/liquid-light-pool?tier=high");
      await page.waitForSelector(".il-liquid-pool canvas", { timeout: 5000 });
      await page.evaluate(() => {
        const canvas = document.querySelector(".il-liquid-pool canvas");
        const gl = canvas.getContext("webgl");
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      });
      await page.waitForFunction(
        () => !document.querySelector(".il-liquid-pool canvas"),
        null,
        { timeout: 5000 },
      );
      assert.equal(
        await page.locator(".il-liquid-pool__fallback").count(),
        1,
      );
    });

    const webglFailureModes = [
      {
        name: "webgl getContext null falls back",
        patch: () => {
          const original = HTMLCanvasElement.prototype.getContext;
          HTMLCanvasElement.prototype.getContext = function (type, ...args) {
            if (
              type === "webgl" &&
              this.classList.contains("il-liquid-pool__canvas")
            ) {
              return null;
            }
            return original.call(this, type, ...args);
          };
        },
      },
      {
        name: "webgl shader compile failure falls back",
        patch: () => {
          const original = HTMLCanvasElement.prototype.getContext;
          HTMLCanvasElement.prototype.getContext = function (type, ...args) {
            const context = original.call(this, type, ...args);
            if (type === "webgl" && context && !context.__ilPatched) {
              context.__ilPatched = true;
              const read = context.getShaderParameter.bind(context);
              context.getShaderParameter = function (shader, pname) {
                if (pname === context.COMPILE_STATUS) return false;
                return read(shader, pname);
              };
            }
            return context;
          };
        },
      },
      {
        name: "webgl program link failure falls back",
        patch: () => {
          const original = HTMLCanvasElement.prototype.getContext;
          HTMLCanvasElement.prototype.getContext = function (type, ...args) {
            const context = original.call(this, type, ...args);
            if (type === "webgl" && context && !context.__ilPatched) {
              context.__ilPatched = true;
              const read = context.getProgramParameter.bind(context);
              context.getProgramParameter = function (program, pname) {
                if (pname === context.LINK_STATUS) return false;
                return read(program, pname);
              };
            }
            return context;
          };
        },
      },
    ];

    for (const mode of webglFailureModes) {
      await run(mode.name, async () => {
        const failureContext = await browser.newContext();
        const failurePage = await failureContext.newPage();
        await failurePage.addInitScript(mode.patch);
        await failurePage.goto(
          `${base}/components/liquid-light-pool?tier=high`,
          { waitUntil: "domcontentloaded" },
        );
        // The pool renders its CSS fallback until the scoped tier resolves.
        // Wait for the high-tier pass to finish before asserting the failure
        // path, otherwise the initial fallback can be mistaken for the final
        // state on slower CI runners.
        await failurePage.waitForFunction(
          () =>
            document
              .querySelector(".il-liquid-pool")
              ?.getAttribute("data-il-tier") === "high",
          null,
          { timeout: 5000 },
        );
        await failurePage.waitForFunction(
          () =>
            !document.querySelector(".il-liquid-pool canvas") &&
            Boolean(document.querySelector(".il-liquid-pool__fallback")),
          null,
          { timeout: 5000 },
        );
        assert.equal(
          await failurePage.locator(".il-liquid-pool canvas").count(),
          0,
        );
        await failureContext.close();
      });
    }

    const failed = results.filter((item) => !item.pass);
    console.log(
      `\n${results.length - failed.length}/${results.length} behavior checks passed`,
    );
    if (failed.length) process.exitCode = 1;
  } finally {
    await browser?.close();
    server.kill();
  }
}

main().catch((error) => {
  console.error("BEHAVIOR CHECK FAILED", error);
  process.exit(1);
});
