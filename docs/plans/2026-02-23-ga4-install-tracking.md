# GA4 Install Action Tracking — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Track download link clicks and install-command copy button clicks via GA4 `install_action` events.

**Architecture:** Extend the existing delegated click listener in `head-end.html` to (a) support a `data-ga-label` attribute and (b) detect copy-button clicks by walking up from `.hextra-code-copy-btn` to find a `[data-ga]` ancestor. Add `data-ga` attributes to download links in the shortcode, and wrap tracked codeblocks in get-started.md with `<div data-ga>` wrappers.

**Tech Stack:** Hugo templates, vanilla JS (GA4 gtag), HTML data attributes.

---

### Task 1: Create worktree

**Step 1: Ask for branch name and create worktree**

```bash
git worktree add .worktrees/degroff/ga4-install-tracking -b degroff/ga4-install-tracking
```

**Step 2: Verify worktree**

```bash
cd .worktrees/degroff/ga4-install-tracking && git branch --show-current
```

Expected: `degroff/ga4-install-tracking`

---

### Task 2: Extend click listener in head-end.html

**Files:**
- Modify: `layouts/partials/custom/head-end.html:14-36`

**Step 1: Update the `a[data-ga]` handler to support `data-ga-label`**

The existing handler on line 20 uses `tracked.dataset.gaLocation` for the event label. Add fallback to `dataset.gaLabel`:

```javascript
'event_label': tracked.dataset.gaLabel || tracked.dataset.gaLocation || '',
```

This keeps backward compatibility with existing `data-ga-location` attributes (book_demo CTAs) while supporting the new `data-ga-label` attribute for install tracking.

**Step 2: Add copy-button tracking clause**

After the `a[data-ga]` block (line 24) and before the cal.com fallback (line 26), add a new clause:

```javascript
  // Track copy-button clicks on install codeblocks
  var copyBtn = e.target.closest('.hextra-code-copy-btn');
  if (copyBtn) {
    var wrapper = copyBtn.closest('[data-ga]');
    if (wrapper) {
      gtag('event', wrapper.dataset.ga, {
        'event_category': 'conversion',
        'event_label': wrapper.dataset.gaLabel || ''
      });
    }
    return;
  }
```

**How it works:** When a Hextra copy button is clicked, the event bubbles up to the document listener. We check if the click target is inside a `.hextra-code-copy-btn`, then walk up to find the nearest `[data-ga]` ancestor. If the codeblock isn't wrapped in a tracking div (most code blocks on the site), `closest('[data-ga]')` returns null and we skip silently.

**Step 3: Build to verify**

```bash
hugo
```

Expected: Clean build, no errors.

**Step 4: Commit**

```bash
git add layouts/partials/custom/head-end.html
git commit -m "Extend GA4 click listener for install action tracking

Add data-ga-label support alongside existing data-ga-location.
Add copy-button click detection: walks up from .hextra-code-copy-btn
to find nearest [data-ga] ancestor wrapper."
```

---

### Task 3: Add tracking attributes to download links

**Files:**
- Modify: `layouts/shortcodes/list-files-for-version.html`

**Step 1: Add data-ga to static "All platforms" download links**

In the `{{ range $platforms }}` loop (line 50-56), add tracking attributes to the download `<a>` tag. The OS and arch are available as `.os` and `.arch` in the loop:

Change line 53 from:
```html
<a href="{{ $baseURL }}/{{ $filename }}" class="download-list-link">{{ $filename }}</a>
```
to:
```html
<a href="{{ $baseURL }}/{{ $filename }}" class="download-list-link" data-ga="install_action" data-ga-label="download_{{ .os }}_{{ .arch }}">{{ $filename }}</a>
```

Note: `.os` uses Hugo's OS names (`darwin`, `linux`, `windows`). The design doc uses `macos` in labels. Map `darwin` → `macos` for consistency. Use a Hugo conditional or just accept `darwin` in the label. Recommendation: use the raw values (`download_darwin_arm64`) since they're internal analytics labels, not user-facing. Update the design doc accordingly.

**Step 2: Add data-ga to detected download buttons via JavaScript**

In the `updateDownloadLink()` function:

For macOS dual buttons (inside the `if (os === 'darwin')` block, after setting hrefs):
```javascript
if (armLink) { armLink.dataset.ga = 'install_action'; armLink.dataset.gaLabel = 'download_darwin_arm64'; }
if (x86Link) { x86Link.dataset.ga = 'install_action'; x86Link.dataset.gaLabel = 'download_darwin_x86_64'; }
```

For single-platform button (inside the `else` block, after setting href):
```javascript
if (linkEl) { linkEl.dataset.ga = 'install_action'; linkEl.dataset.gaLabel = 'download_' + os + '_' + arch; }
```

**Step 3: Build to verify**

```bash
hugo
```

Expected: Clean build, no errors.

**Step 4: Commit**

```bash
git add layouts/shortcodes/list-files-for-version.html
git commit -m "Add GA4 install_action tracking to download links

Static links in All Platforms list get data-ga attributes from Hugo template.
Detected platform buttons get attributes set dynamically in JS."
```

---

### Task 4: Wrap install codeblocks in get-started.md

**Files:**
- Modify: `content/docs/get-started.md`

**Step 1: Wrap Docker pull codeblock (lines 17-19)**

Change:
```
{{</* codeblock lang="bash" */>}}
docker pull ghcr.io/maybedont/maybe-dont:{version}
{{</* /codeblock */>}}
```

To:
```
<div data-ga="install_action" data-ga-label="copy_docker_pull">
{{</* codeblock lang="bash" */>}}
docker pull ghcr.io/maybedont/maybe-dont:{version}
{{</* /codeblock */>}}
</div>
```

**Step 2: Wrap Homebrew install (lines 25-27)**

The Homebrew command uses a fenced code block, not the codeblock shortcode. Convert it to the shortcode for consistency (copy button behavior is identical), then wrap:

Change:
````
```bash
brew install maybedont/tap/maybe-dont
```
````

To:
```
<div data-ga="install_action" data-ga-label="copy_homebrew">
{{</* codeblock lang="bash" */>}}
brew install maybedont/tap/maybe-dont
{{</* /codeblock */>}}
</div>
```

**Step 3: Wrap Docker first-run codeblock (lines 47-55)**

Change:
```
{{</* codeblock lang="bash" */>}}
# Run once to bootstrap defaults
docker run --rm \
...
{{</* /codeblock */>}}
```

To:
```
<div data-ga="install_action" data-ga-label="copy_docker_run">
{{</* codeblock lang="bash" */>}}
# Run once to bootstrap defaults
docker run --rm \
...
{{</* /codeblock */>}}
</div>
```

**Step 4: Wrap Docker start codeblock (lines 115-126)**

Change:
```
{{</* codeblock lang="bash" */>}}
export OPENAI_API_KEY="your-api-key-here"

docker run \
...
{{</* /codeblock */>}}
```

To:
```
<div data-ga="install_action" data-ga-label="copy_docker_run">
{{</* codeblock lang="bash" */>}}
export OPENAI_API_KEY="your-api-key-here"

docker run \
...
{{</* /codeblock */>}}
</div>
```

**Step 5: Build to verify**

```bash
hugo
```

Expected: Clean build, no errors. The `<div>` wrappers should not affect the rendered output visually.

**Step 6: Commit**

```bash
git add content/docs/get-started.md
git commit -m "Wrap install codeblocks with GA4 tracking divs

Docker pull, Homebrew install, and Docker run commands on
get-started page now wrapped in data-ga divs for install_action
event tracking when copy buttons are clicked."
```

---

### Task 5: Verify end-to-end

**Step 1: Start dev server**

```bash
hugo server
```

**Step 2: Open browser to get-started page**

Navigate to `http://localhost:1313/docs/get-started/`

**Step 3: Verify tracking attributes in DOM**

Open DevTools → Elements tab. Confirm:
- Docker pull codeblock is inside `<div data-ga="install_action" data-ga-label="copy_docker_pull">`
- Homebrew codeblock is inside `<div data-ga="install_action" data-ga-label="copy_homebrew">`
- Docker run codeblocks are inside `<div data-ga="install_action" data-ga-label="copy_docker_run">`
- Detected download button has `data-ga="install_action"` and appropriate `data-ga-label`
- "All platforms" download links have `data-ga="install_action"` and `data-ga-label="download_{os}_{arch}"`

**Step 4: Verify events fire**

Open DevTools → Console. Type: `gtag = function() { console.log('GA4:', arguments); }`

Click a download link and a copy button. Confirm both log `install_action` with the expected label.

**Step 5: Verify no visual changes**

The wrapper divs should not affect layout. Confirm the get-started page looks identical.

---

### Task 6: Run mobile nav test

**Step 1: Run test**

```bash
./tests/test-mobile-nav.sh
```

Expected: All tests pass. We modified `head-end.html` which contains nav JS, so this confirms no regressions.

**Step 2: Final commit if any fixups needed**

---

### Task 7: Open PR

```bash
git push -u origin degroff/ga4-install-tracking
gh pr create --title "Add GA4 install_action tracking for downloads and copy buttons" --body "$(cat <<'EOF'
## Summary
- Extend GA4 click listener to track install-related actions under a single `install_action` event
- Track binary download link clicks with platform/arch labels (e.g., `download_darwin_arm64`)
- Track copy-button clicks on Docker pull, Docker run, and Homebrew install commands
- Uses existing `data-ga` attribute pattern extended with `data-ga-label`

## Files changed
- `layouts/partials/custom/head-end.html` — Extended click listener with copy-button detection and `data-ga-label` support
- `layouts/shortcodes/list-files-for-version.html` — Added tracking attributes to download links
- `content/docs/get-started.md` — Wrapped install codeblocks with tracking divs

## Test plan
- [ ] `hugo` builds clean
- [ ] Download links have `data-ga` attributes in DOM
- [ ] Copy buttons on install codeblocks fire `install_action` events
- [ ] Non-tracked code blocks do NOT fire events
- [ ] Existing `book_demo` tracking still works
- [ ] `./tests/test-mobile-nav.sh` passes
- [ ] No visual regressions on get-started page

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```
