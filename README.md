# Focus Guard 🛡️

A Safari extension that blocks distracting websites with a mindful pause before you proceed.

## How It Works

1. You add sites to your block list (facebook.com, reddit.com, etc.)
2. When you try to visit a blocked site, a **pause screen** appears
3. You must check **both** boxes to proceed:
   - "I'm not going to waste my time"
   - "There's an important reason for this"
4. A 2-second countdown prevents impulsive clicks
5. Only then can you actually visit the site

## Install on Safari (macOS)

### Quick Way (Xcode 14+)

```bash
git clone https://github.com/EdderTalmor/focus-blocker-extension.git
cd focus-blocker-extension/safari
open "Focus Guard.xcodeproj"
```

Press **⌘B** to build → Safari → Settings → Extensions → enable **Focus Guard**.

### Auto-Generate from Source

```bash
xcrun safari-web-extension-converter \
  --project-name "Focus Guard" \
  --bundle-identifier com.eddertalmor.focusguard \
  /path/to/focus-blocker-extension
```

## Features

- 🛡️ **Mindful Block** — Two-checkbox confirmation before proceeding
- ⏱️ **2s Delay** — Prevents impulsive clicks even after checking boxes
- 📋 **Site Manager** — Add/remove blocked sites via popup
- ⚡ **Preset List** — One-click block for popular distracting sites
- 🎯 **Pattern Match** — Blocks subdomains too (m.facebook.com, etc.)
- 💾 **Sync Storage** — Settings sync across Safari instances

## Default Blocked Sites

facebook.com, twitter.com, x.com, instagram.com, tiktok.com, reddit.com, youtube.com, netflix.com, twitch.tv

## Tech

- Manifest V3 (Safari Web Extension)
- `webNavigation.onBeforeNavigate` for interception
- `chrome.storage.sync` for settings
- Pure HTML/CSS/JS (no frameworks)

## License

MIT — Made with 🛡️ by Edder
