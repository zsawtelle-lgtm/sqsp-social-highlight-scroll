# sqsp-social-highlight-scroll

An Instagram-style highlight carousel for **Squarespace 7.1**, built from native
Squarespace content. No third-party embed and no Instagram API.

- Avatar + account name header, `•••` menu
- Each post has its own swipeable photo / video gallery, with **dots** that move through
  that post's photos only
- **Middle arrows** move between posts
- Heart · comment · repost · share · save row with editable like/comment counts
- Heart fill + pop, odometer-style like count, count-up on scroll, double-tap heart burst
- Caption clipped to 2 lines with "…" (click to expand)
- Aspect ratios: **4:5 (default)**, 1:1, 16:9, 9:16, or the ratio set in Squarespace
- Any number of carousels per page: `#ig-carousel-1`, `#ig-carousel-2`, …
- Light, dark (Framer reference look) or the section's own colour theme

## Quick start

1. Paste [`snippets/code-injection-footer.html`](snippets/code-injection-footer.html) into
   **Settings → Advanced → Code Injection → Footer** and set your account name and avatar.
2. Add an **Auto Layout → Carousel** list section and give it the anchor link `ig-carousel-1`.
3. Each list item is a post. Put the caption and a `likes: 1,204` line in the Description.

Need multiple photos per post, gallery sections, or mixed photo + video posts?
See the full guide: **[docs/INSTALL.md](docs/INSTALL.md)**.

## Files

| Path | What |
|---|---|
| `src/ig-carousel.js` | The plugin (vanilla JS, no dependencies) |
| `src/ig-carousel.css` | Styles; every colour and size is a `--igc-*` variable |
| `snippets/` | Copy-paste snippets for Code Injection, the Code Block and Custom CSS |
| `docs/INSTALL.md` | Installation guide, options, testing checklist |
| `docs/HANDOFF-skill-update.md` | Paste into Claude chat to add this component to the squarespace-components skill |
| `demo/index.html` | Offline test page with mock Squarespace markup for all three setups |

## CDN

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/zsawtelle-lgtm/sqsp-social-highlight-scroll@1/src/ig-carousel.css">
<script defer src="https://cdn.jsdelivr.net/gh/zsawtelle-lgtm/sqsp-social-highlight-scroll@1/src/ig-carousel.js"></script>
```

`@1` follows the latest 1.x release (requires a `v1.x.x` tag on the repo). Never use `@latest`.

## Local demo

```bash
npx serve .      # then open http://localhost:3000/demo/
```
