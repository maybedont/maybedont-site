// test-mobile-nav.mjs — Playwright test for mobile navigation breakpoints
//
// Run via: ./tests/test-mobile-nav.sh (preferred, handles Hugo server lifecycle)
// Or directly: HUGO_PORT=1313 node tests/test-mobile-nav.mjs

import { chromium } from 'playwright';

const PORT = process.env.HUGO_PORT || '1313';
const BASE = `http://127.0.0.1:${PORT}`;

let passCount = 0;
let failCount = 0;

function pass(msg) { passCount++; console.log(`PASS: ${msg}`); }
function fail(msg) { failCount++; console.log(`FAIL: ${msg}`); }

async function testBreakpoint(page, width, label, expectations) {
  await page.setViewportSize({ width, height: 800 });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  // Check hamburger visibility
  const hamburger = page.locator('.hextra-hamburger-menu');
  const hamburgerVisible = await hamburger.isVisible();

  if (hamburgerVisible === expectations.hamburgerVisible) {
    pass(`${label} (${width}px): hamburger ${expectations.hamburgerVisible ? 'visible' : 'hidden'}`);
  } else {
    fail(`${label} (${width}px): hamburger expected ${expectations.hamburgerVisible ? 'visible' : 'hidden'}, got ${hamburgerVisible ? 'visible' : 'hidden'}`);
  }

  // Check desktop nav links visibility (CTA button as proxy)
  const ctaButton = page.locator('.nav-cta');
  const ctaVisible = await ctaButton.isVisible();

  if (ctaVisible === expectations.desktopNavVisible) {
    pass(`${label} (${width}px): desktop nav ${expectations.desktopNavVisible ? 'visible' : 'hidden'}`);
  } else {
    fail(`${label} (${width}px): desktop nav expected ${expectations.desktopNavVisible ? 'visible' : 'hidden'}, got ${ctaVisible ? 'visible' : 'hidden'}`);
  }

  // Test hamburger click opens mobile menu (only at mobile breakpoints)
  if (expectations.hamburgerVisible) {
    await hamburger.click();
    await page.waitForTimeout(500);

    const sidebar = page.locator('.hextra-sidebar-container');
    const sidebarBox = await sidebar.boundingBox();

    if (sidebarBox && sidebarBox.y >= 0) {
      pass(`${label} (${width}px): hamburger click opens mobile menu`);
    } else {
      fail(`${label} (${width}px): hamburger click did not open mobile menu (sidebar y=${sidebarBox?.y})`);
    }

    // Close menu
    await hamburger.click();
    await page.waitForTimeout(500);
  }
}

async function testPages(page, width) {
  const pages = ['/', '/docs/', '/pricing/', '/blog/'];
  for (const pagePath of pages) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto(BASE + pagePath, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);

    const hamburger = page.locator('.hextra-hamburger-menu');
    if (await hamburger.isVisible()) {
      await hamburger.click();
      await page.waitForTimeout(500);

      const sidebar = page.locator('.hextra-sidebar-container');
      const sidebarBox = await sidebar.boundingBox();

      if (sidebarBox && sidebarBox.y >= 0) {
        pass(`Page ${pagePath} at ${width}px: menu opens`);
      } else {
        fail(`Page ${pagePath} at ${width}px: menu did not open`);
      }

      await hamburger.click();
      await page.waitForTimeout(300);
    }
  }
}

async function checkConsoleErrors(page) {
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));

  await page.setViewportSize({ width: 1023, height: 800 });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });

  const hamburger = page.locator('.hextra-hamburger-menu');
  if (await hamburger.isVisible()) {
    await hamburger.click();
    await page.waitForTimeout(300);
    await hamburger.click();
    await page.waitForTimeout(300);
  }

  // Trigger search to exercise flexsearch.js
  await page.keyboard.press('/');
  await page.waitForTimeout(200);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);

  if (errors.length === 0) {
    pass('No JavaScript errors in console');
  } else {
    fail(`JavaScript errors found: ${errors.join(', ')}`);
  }
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navbar breakpoint: 768px (md) — hamburger/links switch here
  // Sidebar breakpoint: 1024px (lg) — overlay/sticky switch here

  console.log('--- Mobile (390px) ---');
  await testBreakpoint(page, 390, 'Mobile', {
    hamburgerVisible: true,
    desktopNavVisible: false,
  });

  console.log('--- Below nav breakpoint (767px) ---');
  await testBreakpoint(page, 767, 'Below nav', {
    hamburgerVisible: true,
    desktopNavVisible: false,
  });

  console.log('--- At nav breakpoint (768px) ---');
  await testBreakpoint(page, 768, 'Nav breakpoint', {
    hamburgerVisible: false,
    desktopNavVisible: true,
  });

  console.log('--- Tablet (900px) ---');
  await testBreakpoint(page, 900, 'Tablet', {
    hamburgerVisible: false,
    desktopNavVisible: true,
  });

  console.log('--- Desktop (1024px) ---');
  await testBreakpoint(page, 1024, 'Desktop', {
    hamburgerVisible: false,
    desktopNavVisible: true,
  });

  console.log('--- Wide Desktop (1440px) ---');
  await testBreakpoint(page, 1440, 'Wide', {
    hamburgerVisible: false,
    desktopNavVisible: true,
  });

  console.log('--- Page-specific tests at 767px ---');
  await testPages(page, 767);

  console.log('--- Console error check ---');
  await checkConsoleErrors(page);

  await browser.close();

  console.log(`\nResults: ${passCount} passed, ${failCount} failed`);
  process.exit(failCount > 0 ? 1 : 0);
})();
