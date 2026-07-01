// ============================================================
//  THE DRAFT ROOM — Electron desktop wrapper
//  Wild Card, Inc.™   |   loads https://wcdraftroom.com
//
//  Why Electron instead of Pake:
//  Electron bundles its own Chromium, so the app runs the exact
//  browser engine where the site already works — no WKWebView /
//  Safari-engine quirks, which is what kept blanking the Pake
//  build (cross-origin iframes, cookie handling, the Access
//  login redirect).
//
//  Session note:
//  We use Electron's DEFAULT session (no custom partition), which
//  persists cookies to disk. That means the Cloudflare Access
//  login cookie survives restarts — you sign in once, not every
//  launch.
// ============================================================

const { app, BrowserWindow, shell } = require("electron");

const APP_URL = "https://wcdraftroom.com";

// Hosts that stay INSIDE the app: everything Wild Card, the
// Cloudflare Access login domain, and the PO form on workers.dev.
// Anything else (QuickBooks, external sites) opens in the real browser.
const INTERNAL_HOSTS = [
  "wcdraftroom.com",
  "cloudflareaccess.com",
  "gray-sydney7.workers.dev",
];

function isInternal(targetUrl) {
  try {
    const host = new URL(targetUrl).hostname;
    return INTERNAL_HOSTS.some((d) => host === d || host.endsWith("." + d));
  } catch (e) {
    return false;
  }
}

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: "#0d1015",
    title: "Draft Room",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      // Default persistent session -> Access login cookie survives restarts.
    },
  });

  mainWindow.loadURL(APP_URL);

  // target="_blank" / window.open handling:
  // keep Wild Card + Access windows in-app, push anything external out.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isInternal(url)) {
      return {
        action: "allow",
        overrideBrowserWindowOptions: {
          backgroundColor: "#0d1015",
          width: 1200,
          height: 800,
          webPreferences: { contextIsolation: true, nodeIntegration: false },
        },
      };
    }
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Only one running copy at a time.
const gotLock = app.requestSingleInstanceLock();

if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    // Present as plain Chrome (strip the Electron / app tokens) so
    // Cloudflare Access, Chatbase, etc. treat it like a normal browser.
    app.userAgentFallback = app.userAgentFallback
      .replace(/\sElectron\/[\d.]+/, "")
      .replace(/\sDraft Room\/[\d.]+/, "");

    createWindow();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });
}
