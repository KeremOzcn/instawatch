# InstaWatch

> Track your Instagram followers over time — see who unfollowed you, who you unfollowed, and mutual changes between snapshots.

[![Version](https://img.shields.io/badge/version-1.2.0-blue)](https://github.com/KeremOzcn/instawatch/releases)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Tampermonkey](https://img.shields.io/badge/Tampermonkey-compatible-orange)](https://www.tampermonkey.net/)

---

## Features

- **Follower & Following Scan** — fetches both lists directly from Instagram's API
- **Snapshot History** — every scan is saved; compare any two snapshots side by side
- **Change Categories** — new followers, lost followers, who you unfollowed, and mutual unfollows
- **Statistics Page** — per-scan table with deltas and a lifetime growth overview
- **Export** — download your following list, followers list, or full snapshot history as JSON or CSV
- **Whitelist** — star accounts to exclude them from unfollow selection
- **Bulk Unfollow** — select multiple users and unfollow them in one click with rate-limit protection
- **Sidebar Navigation** — Dashboard / Geçmiş / İstatistikler / Dışa Aktar

---

## Installation

### Requirements

- [Tampermonkey](https://www.tampermonkey.net/) browser extension (Chrome, Firefox, Edge, Safari)

### Steps

1. Install Tampermonkey from your browser's extension store
2. Click the link below to install InstaWatch directly:

   **[→ Install instawatch.user.js](https://raw.githubusercontent.com/KeremOzcn/instawatch/master/instawatch.user.js)**

3. Tampermonkey will open a confirmation page — click **Install**
4. Go to [instagram.com](https://www.instagram.com) and log in
5. The InstaWatch dashboard will appear automatically

### Updating

Tampermonkey checks for updates automatically via the `@updateURL` header. You can also force a manual check from Tampermonkey dashboard → Scripts → InstaWatch → Check for updates.

---

## Usage

### Scanning

Click **Start Scan** on the initial screen. InstaWatch fetches your following list and followers list in two phases. A progress bar in the header tracks both phases. When complete, results appear in the Dashboard tab.

### Dashboard

- Filter by category: Non-Followers, Followers, Verified, Private
- Select users via checkboxes, or use **+ Verified** / **+ Private** quick-select
- Star (☆) an avatar or row to toggle whitelist status
- Click **UNFOLLOW (n)** to bulk-unfollow selected users with automatic rate-limit delays

### History

Every completed scan is saved as a snapshot. Select any two snapshots to diff them — new followers, lost followers, users you unfollowed, and mutual unfollows.

### Statistics

Overview cards show current follower count, following count, and lifetime growth. The table lists every scan with per-snapshot deltas.

### Export

| Data | Formats |
|------|---------|
| Following list | JSON, CSV |
| Followers list | JSON, CSV |
| Full snapshot history | JSON |

---

## Development

### Requirements

- Node.js 16+
- npm

### Setup

```bash
git clone https://github.com/KeremOzcn/instawatch.git
cd instawatch
npm install
```

### Build

```bash
# Production build + generate instawatch.user.js
npm run build-userscript

# Watch mode (webpack only)
npm run webpack-dev
```

Build pipeline:
1. **webpack** compiles `src/main.tsx` → `dist/dist.js`
2. `scripts/build-userscript.js` prepends the Tampermonkey `==UserScript==` header → `instawatch.user.js`

### Stack

- Preact (React-compatible, small footprint)
- TypeScript
- SCSS (`iw-*` namespace, dark luxury design tokens)
- Webpack 5

---

## Disclaimer

This is an independent project not affiliated with, endorsed by, or connected to Instagram or Meta Platforms, Inc. Use at your own risk. Excessive API calls may trigger temporary rate limits on your account.

---

## License

MIT © 2026 [Kerem Özcan](https://github.com/KeremOzcn)

See [LICENSE](LICENSE) for the full text.
