#!/usr/bin/env node
/**
 * Mobile viewport fit checker using Chrome DevTools Protocol (CDP) via native WebSocket.
 * Measures document scrollWidth vs visual viewport at common phone widths.
 * Requires Chrome installed at /Applications/Google Chrome.app/Contents/MacOS/Google Chrome
 */

import { spawn } from "child_process";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const HARNESS_URL = "file:///tmp/opencode/fitharness/index.html";
const WIDTHS = [320, 375, 390, 412, 430];
const HEIGHT = 844;
const DPR = 2;

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function launchChrome() {
  const port = 9222 + Math.floor(Math.random() * 1000);
  const args = [
    `--headless=new`,
    `--remote-debugging-port=${port}`,
    `--no-sandbox`,
    `--disable-dev-shm-usage`,
    `--disable-gpu`,
    `--window-size=390,844`,
    `about:blank`,
  ];
  const proc = spawn(CHROME, args, { detached: false, stdio: ["ignore", "ignore", "ignore"] });
  await sleep(800);
  return { proc, port };
}

async function getPageWsUrl(port) {
  const res = await fetch(`http://localhost:${port}/json`);
  const targets = await res.json();
  const page = targets.find(t => t.type === "page" && t.url !== "devtools://devtools/bundled/devtools_app.html");
  if (!page) throw new Error("No page target found");
  return page.webSocketDebuggerUrl;
}

async function wsConnect(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    ws.onopen = () => resolve(ws);
    ws.onerror = e => reject(e);
    ws.onclose = () => reject(new Error("WS closed"));
  });
}

let nextId = 1;
async function cdp(ws, method, params = {}) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    const handler = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.id === id) {
        ws.removeEventListener("message", handler);
        if (data.error) reject(new Error(data.error.message));
        else resolve(data.result);
      }
    };
    ws.addEventListener("message", handler);
    ws.send(JSON.stringify({ id, method, params }));
    setTimeout(() => { ws.removeEventListener("message", handler); reject(new Error(`CDP timeout on ${method}`)); }, 15000);
  });
}

async function measureAtWidth(session, width) {
  await session.cdp("Emulation.setDeviceMetricsOverride", {
    width, height: HEIGHT, deviceScaleFactor: DPR, mobile: true, screenOrientation: { angle: 0, type: "portraitPrimary" }
  });
  await session.cdp("Page.enable");
  
  let loadResolved = false;
  const loadPromise = new Promise((resolve) => {
    const handler = (msg) => {
      const data = JSON.parse(msg.data);
      if ((data.method === "Page.loadEventFired" || data.method === "Page.domContentEventFired") && !loadResolved) {
        loadResolved = true;
        session.sessionWs.removeEventListener("message", handler);
        resolve();
      }
    };
    session.sessionWs.addEventListener("message", handler);
    setTimeout(() => {
      if (!loadResolved) {
        session.sessionWs.removeEventListener("message", handler);
        resolve();
      }
    }, 15000);
  });
  
  await session.cdp("Page.navigate", { url: HARNESS_URL });
  await loadPromise;
  await sleep(500);

  const ready = await session.cdp("Runtime.evaluate", { expression: "document.readyState", returnByValue: true });
  console.log(`  readyState: ${ready.result?.value}`);

  const evalScript = `
    (() => {
      const doc = document.documentElement;
      const innerW = window.innerWidth;
      const visualViewportW = window.visualViewport ? window.visualViewport.width : innerW;
      const scrollW = doc.scrollWidth;
      const bodyW = document.body.scrollWidth;
      const offenders = [];
      const all = document.querySelectorAll("*");
      for (const el of all) {
        const r = el.getBoundingClientRect();
        if (r.right > innerW + 0.5) {
          // Check if element is inside an overflow-x-auto/scroll ancestor
          let inOverflowContainer = false;
          let parent = el.parentElement;
          while (parent) {
            const style = window.getComputedStyle(parent);
            if (style.overflowX === 'auto' || style.overflowX === 'scroll') {
              inOverflowContainer = true;
              break;
            }
            parent = parent.parentElement;
          }
          if (!inOverflowContainer) {
            const classes = el.className || "";
            const tag = el.tagName.toLowerCase();
            const txt = el.textContent?.slice(0, 80).replace(/\\s+/g, " ") || "";
            offenders.push({ tag, classes, right: Math.round(r.right), width: Math.round(r.width), text: txt });
          }
        }
      }
      return { innerW, visualViewportW, scrollW, bodyW, offenderCount: offenders.length, offenders };
    })()
  `;
  const { result } = await session.cdp("Runtime.evaluate", { expression: evalScript, returnByValue: true });
  return result.value;
}

async function main() {
  console.log("Launching Chrome...");
  const { proc, port } = await launchChrome();
  try {
    const pageWsUrl = await getPageWsUrl(port);
    console.log(`Connected to page CDP on port ${port}`);
    const pageWs = await wsConnect(pageWsUrl);
    console.log("Page WS connected");
    
    // Wrap CDP for page session
    let nextId = 1;
    async function pageCdp(method, params = {}) {
      const id = nextId++;
      return new Promise((resolve, reject) => {
        const handler = (msg) => {
          const data = JSON.parse(msg.data);
          if (data.id === id) {
            pageWs.removeEventListener("message", handler);
            if (data.error) reject(new Error(data.error.message));
            else resolve(data.result);
          }
        };
        pageWs.addEventListener("message", handler);
        pageWs.send(JSON.stringify({ id, method, params }));
        setTimeout(() => { pageWs.removeEventListener("message", handler); reject(new Error(`CDP timeout on ${method}`)); }, 15000);
      });
    }
    
    // Log all incoming messages for debugging
    pageWs.addEventListener("message", (msg) => {
      console.log("  <<", msg.data.slice(0, 300));
    });
    
    // test basic connectivity
    await new Promise(r => setTimeout(r, 500));
    const test = await pageCdp("Runtime.evaluate", { expression: "1+1", returnByValue: true });
    console.log(`  test eval: ${test.result?.value}`);
    
    const session = { sessionWs: pageWs, cdp: pageCdp };

    console.log("\n=== MOBILE FIT CHECK ===");
    console.log(`Harness: ${HARNESS_URL}`);
    console.log(`Widths: ${WIDTHS.join(", ")}px @ ${HEIGHT}px, DPR ${DPR}\n`);

    let allPass = true;
    const results = [];

    for (const w of WIDTHS) {
      console.log(`\n--- ${w}px ---`);
      const r = await measureAtWidth(session, w);
      const fits = r.scrollW <= r.innerW + 1;
      const status = fits ? "✅ PASS" : "❌ FAIL";
      console.log(`  viewport: ${r.innerW}px, visualViewport: ${r.visualViewportW}px, layout: ${r.scrollW}px, body: ${r.bodyW}px — ${status}`);
      if (!fits) allPass = false;
      if (r.offenderCount > 0) {
        console.log(`  Offenders (${r.offenderCount}):`);
        const uniq = new Map();
        for (const o of r.offenders) {
          const classesStr = typeof o.classes === 'string' ? o.classes : String(o.classes);
          const key = `${o.tag}.${classesStr.split(" ")[0] || ""}`;
          if (!uniq.has(key)) uniq.set(key, o);
        }
        for (const o of uniq.values()) {
          const classesStr = typeof o.classes === 'string' ? o.classes : String(o.classes);
          console.log(`    ${o.tag}.${classesStr.split(" ")[0]} — right:${o.right} w:${o.width} — "${o.text}"`);
        }
      }
      results.push({ width: w, ...r, fits });
    }

    session.sessionWs.close();
    proc.kill();

    console.log("\n=== SUMMARY ===");
    for (const r of results) {
      console.log(`  ${r.width}px: ${r.fits ? "OK" : "OVERFLOW"} (layout ${r.scrollW} > viewport ${r.innerW})`);
    }
    console.log(allPass ? "\n✅ ALL WIDTHS FIT" : "\n❌ OVERFLOW DETECTED — see offenders above");

    // JSON summary for CI parsing
    const jsonSummary = {
      pass: allPass,
      widths: results.map(r => ({
        width: r.width,
        fits: r.fits,
        innerWidth: r.innerW,
        visualViewportWidth: r.visualViewportW,
        scrollWidth: r.scrollW,
        bodyWidth: r.bodyW,
        offenderCount: r.offenderCount,
        offenders: r.offenders
      }))
    };
    console.log("\n=== JSON SUMMARY ===");
    console.log(JSON.stringify(jsonSummary, null, 2));

    process.exit(allPass ? 0 : 1);
  } catch (e) {
    proc.kill();
    console.error("Error:", e);
    process.exit(1);
  }
}

main();