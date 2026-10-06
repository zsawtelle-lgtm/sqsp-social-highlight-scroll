# IG Carousel

Instagram-style post carousels built from native Squarespace content.
Repo: <https://github.com/zsawtelle-lgtm/sqsp-social-highlight-scroll> · Version **1.1.0** · Status: **beta: installed on swtldesignco.com staging**

---

# Part 1 — Basic install

## Overview

Each post shows a profile picture and account name, its own swipeable photo/video
gallery, the heart · comment · repost · share · save row, and a caption clipped
to 2 lines.

- **Middle arrows** (on the image) move between posts.
- **Dots** (bottom of the image) and swiping move between that post's photos only.
- Heart fill + pop on like, double-tap heart burst.
- Aspect ratio 4:5 by default, or 1:1 / 16:9 / 9:16 / the ratio set in Squarespace.
- Card spacing follows Squarespace's own "space between items" unless set in CSS.
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
    profile: 'https://www.instagram.com/your.account/'
  };
</script>
<script defer src="https://cdn.jsdelivr.net/gh/zsawtelle-lgtm/sqsp-social-highlight-scroll@1/src/ig-carousel.js"></script>
```

3. Set `account`, `avatar` and `profile` (see [Profiles](#profiles-one-account-or-one-per-post)).
   Keep `window.IGCarouselConfig` **above** the plugin script.
4. Save.

Layout, aspect ratio, theme, spacing and fonts are set per carousel in
**Design → Custom CSS** ([Part 2](#part-2--styling)).

## Profiles: one account or one per post

| Setup | Use when | Where the name and picture come from |
|---|---|---|
| **Single profile** | Client site showing their own account | Footer `account` + `avatar`, or per carousel in CSS: `--igc-account` + `--igc-avatar` |
| **Profile per post** | Staging/showcase with a different account on each post (Grid gallery posts) | Each gallery's **first image** = profile picture, its **alt text** = account name |

**Profile per post setup:**

1. Add `data-avatar="first-image"` to the code block ([Method C](#method-c--code-block--sections-below)).
2. In each gallery section, make the **first image** the profile picture. Use a
   square (1:1) image, because it is cropped to a circle.
3. Give that first image the account name as its **alt text**. That's the image
   text field that shows up as the image's alt text on the live page.
4. **Only the first image's alt text is read.** Don't put account names on any other
   image. Other images can keep their default file-name alt text, or use normal
   descriptive alt text, which is never shown as a name.
5. If a gallery's first image has no name typed (alt text is just the file name),
   that post falls back to the Footer `account`. The first image is still used as
   the picture.

**Avatar URL** (single profile): upload the image to any image block, open the live
page, right-click the image → *Copy image address*
(`https://images.squarespace-cdn.com/…`), then delete the block.

## Step 2 — Usage (once per carousel)

| Method | Best for | Photos per post | Caption from | Video |
|---|---|---|---|---|
| **A. Auto Layout list** | Single-photo posts, all editing in one panel | several (`+` items) | Item description | `video:` line |
| **B. Anchor + Grid galleries** | Quick photo galleries, no captions | unlimited | — | — |
| **C. Code block + sections below** | **Galleries with captions, profile per post, mixed photo + video** | unlimited | Code block lines or a text block | native video blocks |

The original sections stay visible **in the editor** so they can be edited. The
carousel only renders on the live site.

### Method A — Auto Layout list section

1. Add Section → **Lists** → any **Carousel** layout.
2. Section settings → **Anchor Link** → `ig-carousel-1`.
3. **One list item = one post.**

| List item field | Becomes |
|---|---|
| Image | The photo |
| Description | Caption, plus optional `key: value` lines ([Post details](#post-details)) |
| Title | Caption, only if Description is empty |
| Button link | Where the comment icon links |

4. **More photos in one post:** add list items directly below it whose **Title
   starts with `+`**. Each one's image is added to the post above.
5. **Video:** add `video: https://…/clip.mp4` to the Description; the image
   becomes the poster. YouTube and Vimeo links also work.

### Method B — Anchor + Grid gallery sections

1. Give the section that will hold the carousel the anchor `ig-carousel-2`.
2. Directly below, add **Gallery sections** in the **Grid** layout. **One gallery
   section = one post.** Other gallery layouts are skipped.
3. Collection stops at the first section below that isn't a Grid gallery.
4. Grid galleries don't publish image descriptions, so **there is no caption**. Use
   Method C when posts need captions.

### Method C — Code block + sections below

Uses the Will Myers Slider Pro pattern: a code block pulls in the sections below it.

1. In the section that will hold the carousel, add a **Code Block**, stretch it full
   width, and paste [`snippets/code-block.html`](../snippets/code-block.html):

```html
<div data-ig-carousel data-sections="3" data-avatar="first-image" hidden>
  <p>Caption for post 1</p>
  <p>Caption for post 2</p>
  <p>Caption for post 3<br>location: Boston, MA</p>
</div>
```

2. `data-sections` = how many sections below become posts.
3. **One `<p>` per post, in order.** It becomes that post's caption. Use `<br>` to
   add `key: value` lines to the same post. Keep `hidden` on the div so the captions
   don't flash on the page.
4. `data-avatar="first-image"` turns on [profile per post](#profiles-one-account-or-one-per-post).
   Remove it for a single profile.
5. Each section below can be:
   - a **Grid gallery section** → photos (first image = profile when `first-image` is on)
   - a **blank Fluid Engine section** with **image blocks**, **video blocks**, code blocks
     with `<video src="…mp4" muted loop playsinline></video>`, and optionally a
     **text block** for the post text. Blocks are read top to bottom, then left to right.
6. **Video posts:** a blank section holding just a **Video block** is a video post.
   Its **description** is the post text (formatting rules below), unless the code
   block has a `<p>` line for that post. Keep one `<p>` per post, video posts included.
   - **Uploaded video** (recommended): plays muted and looping while the post is
     centred, with the video's thumbnail as the poster. **Tap** pauses/plays (a play
     icon shows while paused), **double-tap** likes, and the speaker button unmutes. The
     video block's own autoplay/controls settings are ignored.
   - **YouTube / Vimeo:** shown with that player's own controls (tap its play button).
     It doesn't autoplay, and swiping or double-tapping on the video goes to the
     player, so use the arrows to move on.

### Post text formatting (text blocks, video descriptions, code-block lines)

| Write it as | Becomes |
|---|---|
| **Bold** text | Account name for this post |
| A link to an image (Squarespace image or video-thumbnail URL, or `.jpg/.png/.webp`) | Profile picture for this post. The link text is not shown |
| Any other link | Where the comment icon links. The link text is not shown |
| Everything else | Caption |

Only the first bold text is used. For a line under the account name, add a
`location: Boston, MA` line.

**Profile picture link, step by step:** in the description, type any word (e.g. "avatar"),
select it → **Link** → paste the image URL. Two easy sources for the URL:
- **An image already on the site:** open the live page, right-click the image →
  *Copy image address* (`https://images.squarespace-cdn.com/…`).
- **Upload it as a file:** select the word → Link → **File** → upload the image.
  This gives a `/s/name.png` link, which also works.

### Post details

In any caption (list description, code block line, text block, video description),
lines shaped `key: value` are pulled out and the rest is the caption. List item
descriptions don't use the bold / image-link rules above.

| Key | Effect |
|---|---|
| `location:` | Line under the account name |
| `link:` | Where the comment icon links |
| `account:` · `avatar:` · `profile:` | Override the account for this post |
| `date:` | Grey line under the caption |
| `video:` | Method A: MP4 / YouTube / Vimeo URL |
| `alt:` | Image alt text |

## Customizations (per-instance attributes)

Priority, lowest to highest: Footer `IGCarouselConfig` → Footer `carousels['anchor-id']`
→ **Custom CSS** settings → code block `data-*` attributes.

| Attribute | Default | Options | Description |
|---|---|---|---|
| `data-sections` | `auto` | number or `auto` | Sections below to turn into posts (`auto` = consecutive Grid galleries) |
| `data-avatar` | — | URL or `first-image` | Profile picture, or each gallery's first image |
| `data-account` | — | text | Account name |
| `data-profile` | — | URL | Account name link |
| `data-aspect` | `4:5` | `1:1` `4:5` `16:9` `9:16` `native` `w:h` | Media ratio. `native` = the list's Image ratio setting, or the measured gallery tile |
| `data-layout` | `focus` | `focus` `row` | One centred post with faded neighbours, or several side by side |
| `data-theme` | `light` | `light` `dark` `section` | `dark` = Framer reference look; `section` = the section's colour theme |
| `data-card-width` | `380px` | CSS length | Card width (focus layout) |
| `data-per-view` | `3` | number | Posts visible on desktop (row layout) |
| `data-per-view-tablet` | `2` | number | ≤1024px (row layout) |
| `data-per-view-mobile` | `1.12` | number | ≤640px; decimals let the next post peek (row layout) |
| `data-verified` | `false` | `true` `false` | Blue check |
| `data-avatar-ring` | `false` | `true` `false` | Story-ring gradient |
| `data-location` | — | text | Line under the name |
| `data-caption-lines` | `2` | number | Lines shown before "…" |
| `data-caption-expand` | `true` | `true` `false` | Click caption to expand |
| `data-heart-animation` | `pop` | `pop` `none` | Heart fill pop |
| `data-double-tap-like` | `true` | `true` `false` | Double-tap image to like (heart burst) |
| `data-remember-likes` | `true` | `true` `false` | Remember a visitor's likes/saves in their browser |
| `data-show-counter` | `false` | `true` `false` | "1/4" badge on multi-photo posts |
| `data-show-date` | `true` | `true` `false` | Show `date:` line |
| `data-autoplay-video` | `true` | `true` `false` | Muted autoplay while centred |
| `data-hide-source` | `true` | `true` `false` | Hide the original sections on the live site |

Ratio shortcut, any method: end the anchor with the ratio, e.g. `ig-carousel-2-16x9`.

## Per-site checklist

- [ ] Site is on Core plan or higher.
- [ ] Footer snippet saved; `account`, `avatar`, `profile` set (single profile).
- [ ] Each carousel has a unique anchor starting `ig-carousel`.
- [ ] Profile per post: each gallery's first image is square and only it has a name as alt text.
- [ ] Code block: one `<p>` per post, `hidden` kept on the div.
- [ ] Tested on the **live site** (`?noredirect`, plus `&password=…` on staging), not in the editor.
- [ ] Middle arrows change posts; dots change photos without changing post.
- [ ] Heart fills/pops; double-tap shows the burst.
- [ ] Long captions end in "…" after 2 lines.
- [ ] Videos play muted only while centred; the speaker button unmutes.
- [ ] Phone width: no sideways page scroll.
- [ ] Handoff note tells the client which sections feed each carousel.

---

# Part 2 — Styling

## Optional styles

Add these as their own numbered section in **Design → Custom CSS**. A ready-made
example is in [`snippets/custom-css-examples.css`](../snippets/custom-css-examples.css).

**Settings** go on the section anchor (or `.igc` for every carousel):

```css
#ig-carousel-2 {
  --igc-layout: focus;            /* focus | row */
  --igc-aspect: 4 / 5;            /* 1 / 1, 16 / 9, 9 / 16 … */
  --igc-theme: light;             /* light | dark | section */
  --igc-account: "swtl.design";   /* single profile name */
  --igc-avatar: url("https://images.squarespace-cdn.com/…/avatar.jpg");
  --igc-gap: 24px;                /* space between posts */
}
```

| Setting | Default | Controls |
|---|---|---|
| `--igc-layout` | `focus` | Layout |
| `--igc-aspect` | `4 / 5` | Media ratio (Squarespace's CSS may rewrite `4 / 5` as `0.8`, which is the same thing) |
| `--igc-theme` | `light` | Colour theme |
| `--igc-account` / `--igc-avatar` / `--igc-profile` | — | Single-profile name, picture, link (`--igc-avatar: first-image` also works) |
| `--igc-gap` | Squarespace spacing, else `24px` | Space between posts. Unset = the list's "space between items" or the gallery's spacing slider |

**Typography.** Fonts follow **Site Styles**. Letter-spacing is reset to `normal`
because Squarespace paragraph styles often add loose tracking.

| Variable | Default | Controls |
|---|---|---|
| `--igc-letter-spacing` | `normal` | Name + caption tracking (`inherit` = follow paragraph style) |
| `--igc-name-letter-spacing` / `--igc-caption-letter-spacing` | `--igc-letter-spacing` | Tracking for one of them |
| `--igc-font` | inherit | Font for the whole card |
| `--igc-name-font` / `--igc-caption-font` | inherit | Font for one of them, e.g. `var(--body-font-font-family)` |
| `--igc-font-size` | `14px` | Base size |
| `--igc-name-size` / `--igc-caption-size` | `--igc-font-size` | Size for one of them |
| `--igc-name-weight` | `600` | Account name weight |
| `--igc-caption-weight` | inherit | Caption weight |
| `--igc-caption-line-height` | `1.35` | Caption line height |
| `--igc-caption-lines` | `2` | Lines before "…" |

**Colours and shapes** (override on `#anchor .igc`):

| Variable | Default | Controls |
|---|---|---|
| `--igc-card-width` | `380px` | Focus-layout card width |
| `--igc-card-radius` | `20px` | Card corners |
| `--igc-card-bg` / `--igc-text` | theme | Card and text colour |
| `--igc-heart` | `#ff3040` | Liked heart colour |
| `--igc-dot` / `--igc-dot-active` | white 50% / white | Dot colours |
| `--igc-arrow-bg` / `--igc-arrow-color` | black 40% / white | Arrow colours |
| `--igc-peek-scale` / `--igc-peek-opacity` | `0.88` / `0.45` | Side posts in focus layout |

Avoid `calc()` with `var()` in Custom CSS (Squarespace's LESS compiler rejects it).

## Targeting

Settings: `#ig-carousel-2 { … }`. Colours, sizes and fonts: `#ig-carousel-2 .igc { … }`.
Method C carousels can take an anchor too: give the code block's section one.

---

# Part 3 — For developers

## Component HTML breakdown

```
.igc                       [data-layout] [data-theme]   ← after the list / after the code block div
└─ .igc-viewport           horizontal scroll-snap track (posts)
   └─ article.igc-post     .is-active on the centred post
      ├─ header.igc-head   .igc-avatar · .igc-who (.igc-account, .igc-location) · .igc-more
      ├─ .igc-media        aspect-ratio box
      │  ├─ .igc-media-track   scroll-snap track (photos) › .igc-slide (img | video | iframe | moved block)
      │  ├─ .igc-arrow--prev / --next   post navigation
      │  ├─ .igc-dots › .igc-dot[aria-current]   photo navigation
      │  ├─ .igc-counter · .igc-mute · .igc-burst
      ├─ .igc-actions      .igc-like(.is-liked) · .igc-comment · .igc-repost · .igc-share · .igc-save(.is-saved)
      └─ .igc-body         .igc-caption(.is-open) · .igc-meta
```

Source sections get `.igc-source-hidden` (display none). Moved video blocks leave a
comment placeholder and are put back when the editor opens. The plugin sets
`--igc-ratio-js` and `--igc-gap-native` inline as fallbacks; CSS settings win over both.

## Global settings

Set on `window.IGCarouselConfig` **above** the plugin script. It accepts every
attribute in [Customizations](#customizations-per-instance-attributes) (camelCase,
without `data-`), plus:

| Setting | Default | Options | Description |
|---|---|---|---|
| `carousels` | `{}` | `{ 'anchor-id': {…} }` | Per-carousel overrides |
| `idPrefix` | `ig-carousel` | text | Anchor prefix the plugin looks for |

## Events and functions

| Name | Type | Description |
|---|---|---|
| `igc:ready` | event (bubbles from `.igc`) | `detail: { id, posts, options }` after each carousel builds |
| `IGCarousel.init()` | function | Build any carousels not yet built |
| `IGCarousel.destroy()` | function | Remove all carousels and restore the original sections |
| `IGCarousel.refresh()` | function | `destroy()` then `init()` |
| `IGCarousel.version` | string | `1.1.0` |

The plugin watches `body.class` for `sqs-edit-mode-active` and tears down or rebuilds automatically.

---

# Part 4 — Support

## Troubleshooting

| Symptom | Fix |
|---|---|
| Nothing changes | Check the anchor starts with `ig-carousel`, the Footer snippet is saved, and you're on the live site, not the editor. |
| Wrong sections pulled in | Method C: check `data-sections`. Method B: a non-gallery section between the anchor and the galleries stops collection. |
| Name shows `your.account` | Single profile: set `account` in the Footer. Profile per post: type the name as the first image's alt text. |
| Profile picture is a regular photo | `data-avatar="first-image"` is on, so the first image is used. Put the square profile image first, or remove the attribute. |
| Captions on the wrong posts | Code block `<p>` lines are matched to posts in order. One `<p>` per post; empty `<p></p>` to skip one. |
| Caption text shows on the page above the carousel | Add `hidden` to the code block div. |
| A gallery section is ignored | Only the **Grid** gallery layout is supported (the browser console logs a warning). |
| Text looks too spaced out | Set `--igc-letter-spacing: normal` (default). If a template rule still wins, add it on `#anchor .igc`. |
| Photo order wrong (blank sections) | Blocks read top to bottom, then left to right. Nudge them in Fluid Engine. |
| Video looks cropped | Videos fill the frame. Use a matching ratio, e.g. `9:16` for reels. |
| Video shows only its poster | Tap it to start it. If it still won't play, check the browser console: uploaded videos load hls.js from cdn.jsdelivr.net, so a blocker on that domain stops playback. |
| YouTube post shows the description text instead of a video | The YouTube address couldn't be found in the block. Re-add the video by URL in the Video block. |
| Bold words in a caption became the account name | In text blocks, video descriptions and code-block lines, the first bold text is the account name. Don't use bold for emphasis there. |

## Deployed on

| Site | Methods | Notes |
|---|---|---|
| swtldesignco.com/carousel-test-1 (staging) | A, C | v1.0 installed. Video-block post (v1.1): bold + image-link description → name + avatar; uploaded video plays in Chrome 154 (hls.js). Earlier: v1.1 tested by injecting it into the live page: list → 4 posts (20px native gap); code block + 3 Grid galleries with `first-image` → 3 posts with their own profile (SWTL Design Co, Physiq, fallback), captions from the code block, 30.72px native gap. No errors. |

## Open items

- **Verified on live 7.1 markup:** the section anchor `id` is on the `<section>`;
  list classes `.user-items-list`, `.user-items-list-carousel__slide.list-item`,
  `.list-item-content__title/__description/__button`, `[data-media-aspect-ratio]`;
  `.user-items-list-carousel__slides` gap; gallery `.gallery-section`, `.gallery-grid`,
  `.gallery-grid-item`, `data-gutter`; image `data-src`/`data-image`/`alt`.
- **Grid galleries don't publish image descriptions** (not in the HTML or the page
  JSON), so gallery captions come from the code block, and names from alt text.
- `data-gutter` → spacing uses `gutter / 20` vw, taken from one observation (48 → 2.4vw).
- **Still unverified:** `.sqs-block-video` / `.sqs-block-image` inside blank-section posts,
  the editor class `body.sqs-edit-mode-active`, and which gallery editor field writes
  the alt text.
- **Native video blocks** (website-component `.sqs-native-video[data-config-video]`) are rebuilt
  as a plain `<video>` on the block's HLS stream (`…/playlist.m3u8`, poster `…/thumbnail`).
  Squarespace serves no MP4 for them, and the stream is AES-128 encrypted. hls.js is used
  whenever MediaSource exists. Chrome 154 reports native HLS support (`canPlayType` →
  "maybe") but fails on these streams with MEDIA_ERR 4, so native HLS is only the
  fallback. **Verified playing in Chrome 154** on staging (autoplay, tap pause/play,
  pause off-screen). Safari/iOS not yet checked.
- YouTube/Vimeo blocks: the video id is found anywhere in the block's markup and shown in
  the provider's own player. Tested on mock markup only; the live website-component
  YouTube markup hasn't been seen yet.
- `aspect: 'native'` on gallery posts measures the first photo tile (skips the profile image).
- **Release:** v1.1.0 needs a `v1.1.0` release tag on `main` for `@1` to pick it up.
