// Run with Playwright installed (or NODE_PATH pointing at the bundled runtime).
const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const fs = require("node:fs");
const base = process.env.WEBSITE_TEST_URL || "http://127.0.0.1:4175/";
const output = process.env.WEBSITE_TEST_OUTPUT || "artifacts/website-motion";
(async () => {
    fs.mkdirSync(output, { recursive: true });
    const browser = await chromium.launch({
        headless: true,
        channel: "msedge",
    });
    try {
        const context = await browser.newContext({
            viewport: { width: 1440, height: 1000 },
        });
        const page = await context.newPage();
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.goto(base);
        await page.waitForFunction(
            () => document.documentElement.dataset.motion === "ready",
        );
        await page.waitForFunction(() =>
            [...document.querySelectorAll(".motion-letter")].every(
                (el) => getComputedStyle(el).opacity === "1",
            ),
        );
        assert.equal(
            await page.locator("h1").getAttribute("aria-label"),
            await page.locator("h1").textContent(),
        );
        await page.screenshot({ path: output + "/desktop.png" });
        const original = await page.evaluate(
            () => ScrollTrigger.getAll().length,
        );
        assert(original > 0, "Scroll choreography was not created");
        await page.locator(".download-panel a").first().focus();
        assert.equal(
            await page
                .locator(".download-panel")
                .evaluate((el) => getComputedStyle(el).opacity),
            "1",
            "Keyboard focus must reveal its section",
        );
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.waitForFunction(
            () => document.documentElement.dataset.motion === "reduced",
        );
        assert.equal(
            await page.evaluate(() => ScrollTrigger.getAll().length),
            0,
        );
        assert.equal(
            await page
                .locator(".download-panel")
                .evaluate((el) => el.style.opacity),
            "",
        );
        await page.emulateMedia({ reducedMotion: "no-preference" });
        await page.waitForFunction(
            () => document.documentElement.dataset.motion === "ready",
        );
        assert(
            (await page.evaluate(() => ScrollTrigger.getAll().length)) <=
                original,
            "Preference changes leaked triggers",
        );
        await page.emulateMedia({ forcedColors: "active" });
        await page.waitForFunction(
            () => document.documentElement.dataset.motion === "reduced",
        );
        assert.equal(
            await page.evaluate(() => ScrollTrigger.getAll().length),
            0,
        );
        await page.emulateMedia({ forcedColors: "none" });
        await page.setViewportSize({ width: 320, height: 800 });
        for (const name of [
            "index",
            "gallery",
            "guide",
            "downloads",
            "cli",
            "formats",
            "help",
            "roadmap",
            "changelog",
        ]) {
            await page.goto(base + name + ".html");
            await page.waitForFunction(
                () => document.documentElement.dataset.motion === "ready",
            );
            assert(
                await page.evaluate(
                    () => document.documentElement.scrollWidth <= innerWidth,
                ),
                name + " overflows mobile viewport",
            );
            assert.equal(
                await page.evaluate(() =>
                    ScrollTrigger.getAll().some((t) => t.vars.scrub),
                ),
                false,
                "Mobile parallax must be disabled",
            );
        }
        await page.goto(base + "gallery.html");
        await page.waitForFunction(
            () => document.documentElement.dataset.motion === "ready",
        );
        const slider = page.locator("input[type=range]").first();
        await slider.press("End");
        assert.equal(await slider.inputValue(), "100");
        await page.getByRole("button", { name: "文字", exact: true }).click();
        assert.equal(await page.locator("[data-work-type]:visible").count(), 1);
        await page.screenshot({ path: output + "/mobile-gallery.png" });
        assert.deepEqual(errors, [], "Browser runtime errors");
        const blocked = await browser.newPage();
        await blocked.route("**/vendor/*.js", (route) => route.abort());
        await blocked.goto(base);
        await blocked.waitForFunction(
            () => document.documentElement.dataset.motion === "unavailable",
        );
        assert.equal(
            await blocked
                .locator("h1")
                .evaluate((el) => getComputedStyle(el).opacity),
            "1",
        );
        assert.equal(
            await blocked
                .locator(".download-panel")
                .evaluate((el) => getComputedStyle(el).opacity),
            "1",
        );
        const staticPage = await browser.newPage({ javaScriptEnabled: false });
        await staticPage.goto(base + "cli.html");
        assert.equal(await staticPage.locator(".guide-section").count(), 14);
        assert.equal(
            await staticPage
                .locator(".guide-section")
                .first()
                .evaluate((el) => getComputedStyle(el).opacity),
            "1",
        );
        console.log(
            "PASS GSAP: intro, keyboard reveal, live preferences/cleanup, forced colors, 9 mobile pages, gallery controls, missing engine and no-JS",
        );
    } finally {
        await browser.close();
    }
})().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
