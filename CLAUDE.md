# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This project uses Hugo to generate static content. The generated content will be served at https://maybedont.ai.

Hugo documentation: https://gohugo.io/documentation/

## Working Guidelines

1. **Build a spec first for larger tasks.** Before starting significant work, create a specification document so we can iterate on the approach before implementation begins.

2. **Wait for answers before proceeding.** If you ask clarifying questions, wait for a response before starting work.

3. **Maintain UI consistency.** Be consistent with colors, layout, spacing, and all UI-related decisions across the site.

4. **Use consistent terminology in docs.** When writing or editing documentation, maintain consistent terminology throughout.

5. **Honor the existing color palette.** When making changes, use the colors defined in `assets/css/custom.css` (CSS variables in `:root`). Do not introduce new colors without discussion.

6. **Verify completion** When asked to modify a width, or a layout change, do your best to verify changes by rendering the page before you mark the task complete.

## Styling Strategy

This site uses the Hextra Hugo theme but treats it as our own - we prioritize maintainability over easy theme upgrades.

### CSS Organization

- **`assets/css/custom.css`** - All custom CSS lives here. Hextra auto-loads this file last in the cascade.
- **`layouts/partials/custom/head-end.html`** - Only for Font Awesome, Google Analytics, and JavaScript. No CSS.

### Customization Approach

1. **Custom component classes** (`.cta-primary`, `.pricing-card`, `.blog-post-grid`, etc.) go in `custom.css`. These don't conflict with Hextra.

2. **Hextra overrides** - When Hextra's Tailwind utility classes (like `hx:text-sm`) conflict with our design, **override the template** rather than fighting with CSS specificity:
   - Copy the Hextra template to `layouts/` (same path)
   - Modify or remove the conflicting utility classes
   - This is cleaner than using `!important` in CSS

3. **Avoid `!important`** - It creates maintenance problems. If you need `!important` to make something work, consider overriding the template instead.

### Reference Site

Compare local changes against production: https://maybedont.ai/

## Git Workflow

**Keep the root working directory on `main` at all times.** Do not check out feature branches in the root directory.

For all feature work, use git worktrees in the `.worktrees/` directory. Before creating a worktree, ask the user what the branch should be named. Branch names follow the convention `<owner>/<descriptive-name>` (e.g., `alice/featureA`), but this may vary by developer. The worktree directory name and branch name must match:

```bash
git worktree add .worktrees/<branch-name> -b <branch-name>
```

This keeps worktrees co-located with the repo instead of scattered as sibling directories. The `.worktrees/` directory is gitignored.

## Essential Commands

### Image manipulation

- Prefer the use of `magick` for image manipulation tasks. If the user does not have it installed, ask them to install it. If the user is using macOS they can use `brew install imagemagick` to install it. 

### Build and Development

- `hugo` - Build the content and outputs to public/ w/out a server.
- `hugo server` - Starts a local development server @ http://localhost:1313 This is useful to develop and test changes locally before commiting changes.

### Integration Tests

- `./tests/test-get-started.sh` - Runs the get-started doc through all installation paths (binary download, Docker, Homebrew) in an isolated `/tmp` environment. Also validates download links and SHA256 checksums.

**When editing `content/docs/get-started.md` or related pages** (installation instructions, first-run steps, configuration examples), evaluate whether `tests/test-get-started.sh` needs updating to match. The test validates that documented commands and workflows actually work.

- `./tests/test-mobile-nav.sh` - Playwright-based test that verifies the mobile hamburger menu and desktop nav links behave correctly at 390px, 1023px, and 1024px breakpoints. **Run this before opening PRs that touch navigation, sidebar, or CSS files.**