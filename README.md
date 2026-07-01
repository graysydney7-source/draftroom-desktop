# The Draft Room — Desktop (Electron)

Native macOS wrapper around `https://wcdraftroom.com`, built on Electron so it
runs real Chromium (the same engine where the site already works) instead of the
macOS system WebView.

## What it does
- Loads the Draft Room shell in a persistent window.
- Keeps the Cloudflare Access login cookie on disk — you sign in **once**, not
  every launch.
- Keeps Wild Card + Access pages inside the app; sends genuinely external links
  (e.g. QuickBooks) out to your default browser.

## Deploy (no local tools needed)
1. Create a new GitHub repo (private is fine), e.g. `draftroom-desktop`.
2. Upload the contents of this folder to the repo — keep the folder structure
   (`.github/workflows/` and `build/` must stay intact). Commit to `main`.
3. The push triggers the **Build Draft Room (macOS)** workflow automatically.
   (Or: Actions tab → Build Draft Room (macOS) → Run workflow.)
4. When the run finishes green, open it → **Artifacts** → download
   **DraftRoom-macOS** → unzip → open `Draft Room.dmg` → drag to Applications.
5. First launch is blocked (unsigned): try to open it, then
   System Settings → Privacy & Security → **Open Anyway**.
6. Enter your Access code once. It'll stick after that.

## Changing the icon later
Replace `build/icon.png` with a 1024×1024 PNG and rebuild.

## Notes
- Universal binary — runs on both Apple Silicon and Intel Macs.
- Unsigned. To remove the Gatekeeper prompt entirely you'd need an Apple
  Developer account ($99/yr) for notarization; not required for it to work.
