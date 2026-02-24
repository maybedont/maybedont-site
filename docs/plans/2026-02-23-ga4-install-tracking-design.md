# GA4 Install Action Tracking

**Date:** 2026-02-23

## Goal

Track download link clicks and install-command copy button clicks on the site via GA4 custom events, so we can see install intent over time in GA4 reports.

## Event Schema

**Event name:** `install_action`
**Event category:** `conversion`

| Action | `event_label` |
|--------|---------------|
| Copy Docker pull | `copy_docker_pull` |
| Copy Docker run | `copy_docker_run` |
| Copy Homebrew install | `copy_homebrew` |
| Download macOS ARM64 | `download_macos_arm64` |
| Download macOS x86_64 | `download_macos_x86_64` |
| Download Linux ARM64 | `download_linux_arm64` |
| Download Linux x86_64 | `download_linux_x86_64` |
| Download Linux i386 | `download_linux_i386` |
| Download Windows ARM64 | `download_windows_arm64` |
| Download Windows x86_64 | `download_windows_x86_64` |
| Download Windows i386 | `download_windows_i386` |

## Approach

### Download Links (binary downloads)

Add `data-ga="install_action"` and `data-ga-label="download_{os}_{arch}"` attributes to download `<a>` tags in the `list-files-for-version` shortcode. The existing delegated click listener in `head-end.html` already handles `a[data-ga]` elements.

### Copy Buttons (install commands)

Wrap tracked codeblocks in `<div data-ga="install_action" data-ga-label="copy_docker_pull">` (etc.) in the markdown content. Extend the click listener in `head-end.html` to detect `.hextra-code-copy-btn` clicks, walk up to find the nearest `[data-ga]` ancestor, and fire the event.

## Files to Change

1. **`layouts/partials/custom/head-end.html`** — Add copy-button tracking clause to click listener.
2. **`layouts/shortcodes/list-files-for-version.html`** — Add `data-ga` / `data-ga-label` to download links.
3. **`content/docs/get-started.md`** — Wrap Docker/Homebrew/package codeblocks in `<div>` with tracking attributes.

## GA4 Reporting

All actions appear under the single `install_action` event. Filter by `event_label` to distinguish Docker vs Homebrew vs binary downloads by platform. Time-series graphs work out of the box in GA4 Events report.
