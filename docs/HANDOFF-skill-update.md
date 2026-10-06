# Handoff: add IG Carousel to the `squarespace-components` skill

Paste this file into a Claude chat that can edit the **squarespace-components** skill.

## Task

Add the IG Carousel component to the `squarespace-components` skill.

1. **Create `references/ig-carousel.md`** with the full contents of the install doc:
   - Raw file (branch, until merged): https://raw.githubusercontent.com/zsawtelle-lgtm/sqsp-social-highlight-scroll/claude/ecstatic-allen-95wd16/docs/INSTALL.md
   - Raw file (after merge to `main`): https://raw.githubusercontent.com/zsawtelle-lgtm/sqsp-social-highlight-scroll/main/docs/INSTALL.md

   Copy it as-is. It already follows `_TEMPLATE.md` (Basic install → Styling →
   For developers → Support). In the copy, change the relative links
   (`../snippets/…`, `../src/…`) to full GitHub URLs:
   `https://github.com/zsawtelle-lgtm/sqsp-social-highlight-scroll/blob/main/…`

2. **Add this row to `references/INDEX.md`:**

   | Component | Repo | Doc | Status |
   |---|---|---|---|
   | IG Carousel (Instagram-style post carousel) | `zsawtelle-lgtm/sqsp-social-highlight-scroll` | `references/ig-carousel.md` | Beta: verified on staging markup, not yet installed on a client site |

3. **Add `ig-carousel` to the component list in the skill's `description`** so it triggers.
   Suggested wording, inserted with the other component names:
   `…, awards pill slider, sq-link-watch, ig-carousel (Instagram-style post carousel)`

## Component summary (for the INDEX or a quick reference)

- **What:** Instagram-style post carousel built from native Squarespace content. Each post
  has an avatar, an account name, its own photo/video gallery (dots), the
  heart/comment/repost/share/save row, an editable like count, and a 2-line caption.
- **Install:** Footer code injection, sitewide (`snippets/code-injection-footer.html`),
  with jsDelivr pinned to `@1`.
- **Per instance:** section anchor `ig-carousel-1`, `ig-carousel-2`, … on an Auto Layout
  carousel list, OR a code block `<div data-ig-carousel data-sections="3"></div>` above
  N gallery/blank sections (use this for mixed photo + video).
- **Global settings:** `window.IGCarouselConfig` above the script. Per-instance
  `data-*` attributes or `carousels['anchor-id']` override it.
- **Client handoff note:** the carousel reads content from native sections. Clients edit
  the list items / gallery sections / post sections directly, and only see the carousel
  on the live site, not in the editor.

## Before first client install

- [ ] Merge the `claude/ecstatic-allen-95wd16` branch into `main`.
- [ ] Create release tag `v1.0.0` on `main` (the `@1` CDN URLs return 404 until it exists).
- [ ] Install on swtldesignco.com staging and update "Deployed on" in the doc.
