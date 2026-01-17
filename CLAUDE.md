# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This project uses Hugo to generate static content. The generated content will be served at https://maybedont.ai.

## Working Guidelines

1. **Build a spec first for larger tasks.** Before starting significant work, create a specification document so we can iterate on the approach before implementation begins.

2. **Wait for answers before proceeding.** If you ask clarifying questions, wait for a response before starting work.

3. **Maintain UI consistency.** Be consistent with colors, layout, spacing, and all UI-related decisions across the site.

4. **Use consistent terminology in docs.** When writing or editing documentation, maintain consistent terminology throughout.

5. **Honor the existing color palette.** When making changes, use the colors defined in `layouts/partials/custom/head-end.html` (CSS variables in `:root`). Do not introduce new colors without discussion.

6. **Verify completion** When asked to modify a width, or a layout change, do your best to verify changes by rendering the page before you mark the task complete.

## Essential Commands

### Image manipulation

- Prefer the use of `magick` for image manipulation tasks. If the user does not have it installed, ask them to install it. If the user is using macOS they can use `brew install imagemagick` to install it. 

### Build and Development

- `hugo` - Build the content and outputs to public/ w/out a server.
- `hugo server` - Starts a local development server @ http://localhost:1313 This is useful to develop and test changes locally before commiting changes.