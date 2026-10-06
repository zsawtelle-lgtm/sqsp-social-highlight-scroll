# IG Carousel

Instagram-style post carousels built from native Squarespace content.
Repo: <https://github.com/zsawtelle-lgtm/sqsp-social-highlight-scroll> · Version **1.0.0** · Status: **beta, not yet tested on a live site**

---

# Part 1 — Basic install

## Overview

Each post shows an avatar and account name, its own swipeable photo/video
gallery, the heart · comment · repost · share · save row with an editable like
count, and a caption clipped to 2 lines.

- **Middle arrows** (on the image) move between posts.
- **Dots** (bottom of the image) and swiping move between that post's photos only.
- Heart fill + pop, like-count roll, count-up on scroll, and double-tap heart burst.
- Aspect ratio 4:5 by default, or 1:1 / 16:9 / 9:16 / the ratio set in Squarespace.
- Any number of carousels per page. Each gets its own section anchor:
  `ig-carousel-1`, `ig-carousel-2`, …

Requires the **Core plan or higher** and **Fluid Engine**.

## Step 1 — Installation (once per site)

1. Settings → Advanced → Code Injection → **Footer**.
2. Paste [`snippets/code-injection-footer.html`](../snippets/code-injection-footer.html):

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/zsawtelle-lgtm/sqsp-social-highlight-scroll@1/src/ig-carousel.css">
<script>
  window.IGCarouselConfig = {
    account: 'your.account',
    avatar:  '',
    profile: 'https://www.instagram.com/your.account/',
    aspect:  '4:5',
    theme:   'light',
    layout:  'focus'
  };
</script>
<script defer src="https://cdn.jsdelivr.net/gh/zsawtelle-lgtm/sqsp-social-highlight-scroll@1/src/ig-carousel.js"></script>
```

3. Set `account`, `avatar` and `profile`. Keep `window.IGCarouselConfig` **above** the plugin script.
4. Save.

**Avatar URL:** upload the image to any image block, open the live page, right-click
the image → *Copy image address* (`https://images.squarespace-cdn.com/…`), then
delete the block. Alternatively, link any text → **File** → upload, which gives a
`/s/avatar.jpg` URL.

## Step 2 — Usage (once per carousel)

Pick a build method per carousel. All three can be used on the same page.

| Method | Best for | Photos per post | Video |
|---|---|---|---|
| **A. Auto Layout list** | Quick single-photo posts, all editing in one panel | several (`+` items) | `video:` line |
| **B. Anchor + gallery sections** | Existing photo galleries | unlimited | — |
| **C. Code block + blank sections** | **Mixed photo + video posts** | unlimited | native video blocks |

The original sections stay visible **in the editor** so they can be edited. The
carousel only renders on the live site.

### Method A — Auto Layout list section

1. Add Section → **Lists** → any **Carousel** layout.
2. Section settings → **Anchor Link** → `ig-carousel-1`.
3. **One list item = one post.**

| List item field | Becomes |
|---|---|
| Image | The photo |
| Description | Caption + optional `key: value` lines ([Post details](#post-details)) |
| Title | Caption, only if Description is empty |
| Button link | Where the comment icon links |

4. **More photos in one post:** add list items directly below it whose **Title
   starts with `+`**. Each one's image is added to the post above.
5. **Video:** add `video: https://…/clip.mp4` to the Description; the image
   becomes the poster. YouTube and Vimeo links also work.

### Method B — Anchor + gallery sections

1. Give the section that will hold the carousel the anchor `ig-carousel-2`. A
   heading block in it can stay.
2. Directly below, add **Gallery sections**. **One gallery section = one post.**
3. Collection stops at the first section below that isn't a gallery.
4. Caption and likes: write them in the **first image's description**, e.g.
   `This is such a cool gallery! ❤️` then a new line `likes: 325`.

### Method C — Code block + blank sections (mixed media)

Uses the Will Myers Slider Pro pattern: a code block pulls in the sections below it.

1. In the section that will hold the carousel, add a **Code Block**, stretch it full
   width, and paste:

```html
<div data-ig-carousel data-sections="3"></div>
```

2. `data-sections` = how many sections below become posts.
3. Build each post as a blank Fluid Engine section with:
   - **Image blocks** → photos
   - **Video blocks** → videos
   - **Code blocks** containing `<video src="…mp4" muted loop playsinline></video>` → silent loops
   - **one Text block** → caption + `key: value` lines
4. Slides follow on-screen order: top to bottom, then left to right.

### Post details

In any caption source, lines shaped `key: value` are pulled out and the rest is
the caption:

```
New brand identity for a local bakery — swipe for process shots.
likes: 1,204
comments: 38
```

| Key | Effect |
|---|---|
| `likes:` | Count beside the heart. `1204`, `1,204` and `12.5k` all work |
| `comments:` | Count beside the comment icon |
| `link:` | Where the comment icon links |
| `account:` · `avatar:` · `profile:` | Override the account for this post |
| `location:` | Line under the account name |
| `date:` | Grey line under the caption |
| `video:` | Method A: MP4 / YouTube / Vimeo URL |
| `alt:` | Image alt text |

## Customizations (per-instance attributes)

Per-instance settings override [global settings](#global-settings).

- **Method C:** put them as `data-*` attributes on the code block div, e.g.
  `<div data-ig-carousel data-sections="3" data-theme="dark" data-per-view="2"></div>`.
- **Methods A/B (no code block):** put them in the global object, keyed by anchor id:
  `carousels: { 'ig-carousel-2': { theme: 'dark', aspect: '1:1' } }`.
- **Ratio shortcut, any method:** end the anchor with the ratio, e.g. `ig-carousel-2-16x9`,
  `ig-carousel-3-9x16` or `ig-carousel-4-1x1`.

| Attribute | Default | Options | Description |
|---|---|---|---|
| `data-sections` | `auto` | number or `auto` | Sections below to turn into posts (`auto` = consecutive gallery sections) |
| `data-aspect` | `4:5` | `1:1` `4:5` `16:9` `9:16` `native` `w:h` | Media ratio. `native` copies the ratio from the Squarespace section |
| `data-layout` | `focus` | `focus` `row` | One centred post with faded neighbours, or several side by side |
| `data-card-width` | `380px` | any CSS length | Card width (focus layout) |
| `data-per-view` | `3` | number | Posts visible on desktop (row layout) |
| `data-per-view-tablet` | `2` | number | ≤1024px (row layout) |
| `data-per-view-mobile` | `1.12` | number | ≤640px; decimals let the next post peek (row layout) |
| `data-theme` | `light` | `light` `dark` `section` | `dark` = the Framer reference look; `section` = the section's colour theme |
| `data-account` | — | text | Account name |
| `data-avatar` | — | URL | Profile image |
| `data-profile` | — | URL | Account name link |
| `data-verified` | `false` | `true` `false` | Blue check |
| `data-avatar-ring` | `false` | `true` `false` | Story-ring gradient |
| `data-location` | — | text | Line under the name |
| `data-caption-lines` | `2` | number | Lines shown before "…" |
| `data-caption-expand` | `true` | `true` `false` | Click caption to expand |
| `data-likes-style` | `inline` | `inline` `line` | Count beside the heart, or a "1,204 likes" row |
| `data-heart-animation` | `pop` | `pop` `none` | Heart fill pop |
| `data-like-animation` | `roll` | `roll` `none` | Count flips on like/unlike |
| `data-count-up` | `true` | `true` `false` | Counts count up when the carousel enters view |
| `data-double-tap-like` | `true` | `true` `false` | Double-tap image to like (heart burst) |
| `data-remember-likes` | `true` | `true` `false` | Remember a visitor's likes/saves in their browser |
| `data-show-counter` | `false` | `true` `false` | "1/4" badge on multi-photo posts |
| `data-show-likes` | `true` | `true` `false` | Show like count |
| `data-show-date` | `true` | `true` `false` | Show `date:` line |
| `data-autoplay-video` | `true` | `true` `false` | Muted autoplay while centred |
| `data-hide-source` | `true` | `true` `false` | Hide the original sections on the live site |

## Per-site checklist

- [ ] Site is on Core plan or higher.
- [ ] Footer snippet saved; `account`, `avatar`, `profile` set.
- [ ] Each carousel has a unique anchor starting `ig-carousel`.
- [ ] Tested on the **live site** (`?noredirect`, plus `&password=…` on staging), not in the editor.
- [ ] Middle arrows change posts; dots change photos without changing post.
- [ ] Heart fills/pops, count +1/−1; double-tap shows the burst.
- [ ] Long captions end in "…" after 2 lines.
- [ ] Videos play muted only while centred; the speaker button unmutes.
- [ ] Phone width: no sideways page scroll.
- [ ] Handoff note tells the client which sections feed each carousel.

---

# Part 2 — Styling

## Optional styles

Every colour, size and spacing is a `--igc-*` variable (full list at the top of
[`src/ig-carousel.css`](../src/ig-carousel.css)). Add overrides as their own numbered
section in Custom CSS. A ready-made example is in
[`snippets/custom-css-examples.css`](../snippets/custom-css-examples.css).

Fonts follow **Site Styles** (`--igc-font: inherit`). Change fonts in the native
editor, not here. Avoid `calc()` with `var()` in Custom CSS (LESS will reject it).

| Variable | Default | Controls |
|---|---|---|
| `--igc-card-width` | `380px` | Focus-layout card width |
| `--igc-card-radius` | `20px` | Card corners |
| `--igc-card-bg` / `--igc-text` | theme | Card and text colour |
| `--igc-heart` | `#ff3040` | Liked heart colour |
| `--igc-dot` / `--igc-dot-active` | white 50% / white | Dot colours |
| `--igc-arrow-bg` / `--igc-arrow-color` | black 40% / white | Arrow colours |
| `--igc-peek-scale` / `--igc-peek-opacity` | `0.88` / `0.45` | Side posts in focus layout |
| `--igc-gap` | `24px` | Space between posts |
| `--igc-caption-lines` | `2` | Caption clamp |

## Targeting

Scope CSS to one carousel with its section anchor:

```css
#ig-carousel-2 .igc { --igc-heart: #e1306c; }
```

Method C carousels without an anchor: give the section an anchor anyway, or target
`[data-section-id="…"] .igc`.

---

# Part 3 — For developers

## Component HTML breakdown

```
.igc                       [data-layout] [data-theme]   ← inserted after the list / in the code block
└─ .igc-viewport           horizontal scroll-snap track (posts)
   └─ article.igc-post     .is-active on the centred post
      ├─ header.igc-head   .igc-avatar · .igc-who (.igc-account, .igc-location) · .igc-more
      ├─ .igc-media        aspect-ratio box
      │  ├─ .igc-media-track   scroll-snap track (photos) › .igc-slide (img | video | iframe | moved block)
      │  ├─ .igc-arrow--prev / --next   post navigation
      │  ├─ .igc-dots › .igc-dot[aria-current]   photo navigation
      │  ├─ .igc-counter · .igc-mute · .igc-burst
      ├─ .igc-actions      .igc-like(.is-liked) › .igc-count · .igc-comment · .igc-repost · .igc-share · .igc-save(.is-saved)
      └─ .igc-body         .igc-likes (line style) · .igc-caption(.is-open) · .igc-meta
```

Source sections get `.igc-source-hidden` (display none). Moved video blocks leave a
comment placeholder and are put back when the editor opens.

## Global settings

Set on `window.IGCarouselConfig` **above** the plugin script. It accepts every
attribute in [Customizations](#customizations-per-instance-attributes) (camelCase,
without `data-`), plus:

| Setting | Default | Options | Description |
|---|---|---|---|
| `carousels` | `{}` | `{ 'anchor-id': {…} }` | Per-carousel overrides for Methods A/B |
| `idPrefix` | `ig-carousel` | text | Anchor prefix the plugin looks for |

## Events and functions

| Name | Type | Description |
|---|---|---|
| `igc:ready` | event (bubbles from `.igc`) | `detail: { id, posts, options }` after each carousel builds |
| `IGCarousel.init()` | function | Build any carousels not yet built |
| `IGCarousel.destroy()` | function | Remove all carousels and restore the original sections |
| `IGCarousel.refresh()` | function | `destroy()` then `init()` |
| `IGCarousel.version` | string | `1.0.0` |

The plugin watches `body.class` for `sqs-edit-mode-active` and tears down or rebuilds automatically.

---

# Part 4 — Support

## Troubleshooting

| Symptom | Fix |
|---|---|
| Nothing changes | Check the anchor starts with `ig-carousel`, the Footer snippet is saved, and you're on the live site, not the editor. |
| 404 on the CDN files | `@1` needs a `v1.x.x` tag on the repo (see Open items). |
| Wrong sections pulled in | Method C: check `data-sections`. Method B: a non-gallery section between the anchor and the galleries stops collection. |
| No account name/avatar | Set `account`/`avatar` globally or per carousel. |
| Gallery post has no caption (B) | Some gallery layouts don't output captions. Rebuild that post with Method C. |
| Photo order wrong (C) | Blocks read top to bottom, then left to right. Nudge them in Fluid Engine. |
| Video looks cropped | Videos fill the frame. Use a matching ratio, e.g. `9:16` for reels. |

## Deployed on

| Site | Methods | Notes |
|---|---|---|
| swtldesignco.com/carousel-test-1 (staging) | A, B | Not yet installed |

## Open items

- **Not tested on a live Squarespace site yet.** Tested only against mock 7.1 markup
  (`demo/index.html`) in headless Chromium. These selectors are unverified:
  - list carousel: `.user-items-list`, `.user-items-list-carousel__slide`,
    `.list-item-content__title/__description/__button`, `.user-items-list-carousel__media-container`
  - gallery: `.gallery-section`, `.gallery-grid-item` (and masonry/slideshow/reel/strips variants), `figcaption` / `.gallery-caption`
  - blocks: `.sqs-block-image/-video/-code/-html`, `.fe-block`
  - editor: `body.sqs-edit-mode-active`
- Whether the section **Anchor Link** puts the `id` on the `<section>` itself (the plugin
  also accepts it on any element inside the section).
- Whether moving a **native Squarespace video block** into a slide keeps its player working.
- Video items inside **gallery sections** are not supported (read via `data-video-url` only).
- `aspect: 'native'` reads the rendered size of the first image container. Not verified
  against each list layout.
- **Release tag:** after merging to `main`, tag `v1.0.0` so the `@1` jsDelivr URLs resolve.
- Add this component to the `squarespace-components` skill (`references/INDEX.md` + this doc).
