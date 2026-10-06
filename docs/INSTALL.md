# IG Carousel — Squarespace Installation Guide

An Instagram-style post carousel built from **native Squarespace content**.
Each post gets an avatar, an account name, its own photo/video gallery with dots,
the heart · comment · repost · share · save row, an editable like count, and a
caption clipped to 2 lines.

Works on **Squarespace 7.1** (Fluid Engine and classic editor). Use as many
carousels per page as you like: give each one its own anchor id
(`ig-carousel-1`, `ig-carousel-2`, …).

## Contents
1. [Where the code goes](#1-where-the-code-goes)
2. [Install (one time per site)](#2-install-one-time-per-site)
3. [Pick a build method](#3-pick-a-build-method)
4. [Per-post details: likes, captions, links](#4-per-post-details-likes-captions-links)
5. [Options](#5-options)
6. [Styling with CSS](#6-styling-with-css)
7. [Testing checklist](#7-testing-checklist)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Where the code goes

| Scope | Location | What goes there |
|---|---|---|
| Whole site | **Settings → Developer Tools → Code Injection → Header** | The stylesheet, the script, and your default account name/avatar (`snippets/code-injection-header.html`) |
| One page only | **Page ⚙ → Advanced → Page Header Code Injection** | Same snippet, if you only want the carousel on one page |
| One carousel | **Section ⚙ → Anchor Link** | `ig-carousel-1`, `ig-carousel-2` … (one per carousel, numbered so each id is unique) |
| One carousel (mixed media) | **Code Block** in the section above the posts | `snippets/code-block.html` |
| Styling tweaks | **Design → Custom CSS** | `snippets/custom-css-examples.css` |

> Code Injection requires a Core plan or higher (the old Business plan also works).

## 2. Install (one time per site)

1. Open **Settings → Developer Tools → Code Injection**.
2. Paste the contents of [`snippets/code-injection-header.html`](../snippets/code-injection-header.html) into **Header**.
3. Change `account`, `avatar`, and `profile` to your own details.
4. Save.

**Getting an image URL for the avatar:** upload the image to any image block on a
page, open the page in a private window, right-click the image → *Copy image
address*. Delete the block afterwards. The URL looks like
`https://images.squarespace-cdn.com/content/v1/…/avatar.jpg`. You can also upload
it as a file: highlight any text → link → **File** → upload. That gives a
`/s/avatar.jpg` URL.

**Pin a version (recommended for client sites):** change `@main` in both URLs to
a release tag such as `@v1.0.0`. Later updates to the repo then won't change the
site until you update the tag.

## 3. Pick a build method

| Method | Best for | Photos per post | Video | Effort |
|---|---|---|---|---|
| **A. Auto Layout list** | Quick photo posts, everything editable in one panel | multiple (`+` items) | via `video:` line | ★ |
| **B. Anchor + gallery sections** | Photo galleries you already have | unlimited | — | ★★ |
| **C. Code block + blank sections** | **Mixed photo + video posts** | unlimited | ✅ native video blocks | ★★★ |

All three can be mixed on one page. The carousel replaces the original content on
the live site. **In the editor the original sections stay visible so you can edit
them.** Preview or open the live page to see the carousel.

### A. Auto Layout list section (native carousel)

1. **Add Section → Lists** → pick any **Carousel** layout.
2. Section ⚙ → **Anchor Link** → `ig-carousel-1`.
3. Each **list item = one post**:
   | List item field | Becomes |
   |---|---|
   | Image | The photo |
   | Description | The caption, plus optional `likes:` lines etc. ([§4](#4-per-post-details-likes-captions-links)) |
   | Title | Used as the caption only if Description is empty |
   | Button link | The comment icon links here (e.g. the real Instagram post) |
4. **More photos in one post:** add another list item directly *below* it and
   start its **Title with `+`** (just `+` is fine). Its image becomes photo 2, 3 …
   of the post above.
5. **Video:** add a line `video: https://…/clip.mp4` to the Description. The
   item's image becomes the poster frame. To host an MP4 on Squarespace,
   highlight text → link → **File** → upload (max 20 MB). That gives a `/s/clip.mp4`
   URL. YouTube and Vimeo links also work.
6. Image ratio: set `aspect: 'native'` and the carousel copies the ratio you
   chose in the list section's own **Design → Image ratio** setting.

### B. Anchor section + gallery sections

1. Add a section to hold the carousel (a heading here is fine), then give it the
   anchor `ig-carousel-2`.
2. Directly below it, add **Gallery sections**. Any gallery layout works.
   **Each gallery section = one post**, and each image in it is a swipeable photo.
3. The carousel collects every gallery section directly below the anchor and
   stops at the first section that isn't a gallery.
4. **Caption and likes:** turn on captions for the gallery and write them in the
   **first image's description**, for example:
   ```
   This is such a cool gallery! ❤️
   likes: 325
   ```

### C. Code block + blank sections (mixed photo + video)

The same pattern as Will Myers' Slider Pro: a code block tells the plugin how
many sections below it to pull in.

1. In the section that will hold the carousel, add a **Code Block**, stretch it
   to full width, and paste [`snippets/code-block.html`](../snippets/code-block.html).
2. Set `data-sections="3"` to the number of post sections below it.
3. Build each post as a **blank section** containing:
   - **Image blocks** → photos
   - **Video blocks** (uploaded or YouTube/Vimeo) → videos
   - **Code blocks** with `<video src="…mp4" muted loop playsinline></video>` → silent looping clips
   - **one Text block** → caption + `likes:` lines
   - (Gallery sections also work as posts here)
4. Slides follow the order you see on screen: top to bottom, then left to right.
5. Optional: give the section an anchor id too (`ig-carousel-3`) so you can
   target it with CSS or `carousels: {}` overrides.

## 4. Per-post details: likes, captions, links

Wherever a caption comes from (list Description, gallery caption, Text block),
lines in the form `key: value` are pulled out and the rest becomes the caption:

```
New brand identity for a local bakery — swipe for the process shots.
likes: 1,204
comments: 38
location: Portland, Oregon
```

| Key | Effect |
|---|---|
| `likes:` | Number next to the heart (`1204`, `1,204` and `12.5k` all work) |
| `comments:` | Number next to the comment icon |
| `link:` | Comment icon links here (list items use the Button link automatically) |
| `account:` / `avatar:` / `profile:` | Override the account for this post only |
| `location:` | Small line under the account name |
| `date:` | Small grey line under the caption |
| `video:` | (List mode) MP4 / YouTube / Vimeo URL for this post |
| `alt:` | Alt text for the image |

## 5. Options

Set options in one of three places. Later ones win:

1. `window.IGCarouselConfig = { … }` in Header injection → whole site
2. `IGCarouselConfig.carousels['ig-carousel-2'] = { … }` → one carousel
3. `data-*` attributes on the code block div (`data-per-view="2"`) → one carousel

**Shortcut:** add a ratio to the end of the anchor id: `ig-carousel-2-16x9`,
`ig-carousel-3-9x16`, `ig-carousel-4-1x1`.

| Option | Default | Values / notes |
|---|---|---|
| `account` | `''` | Account name shown top-left |
| `avatar` | `''` | Profile image URL (the first letter of the name shows if empty) |
| `profile` | `''` | URL the account name links to |
| `verified` | `false` | Blue check after the name |
| `avatarRing` | `false` | Instagram story-ring gradient |
| `location` | `''` | Line under the name for every post |
| `aspect` | `'4:5'` | `1:1`, `4:5`, `16:9`, `9:16`, `native`, or any `w:h` |
| `layout` | `'focus'` | `focus` = one centred post with faded neighbours (Framer look) · `row` = several side by side |
| `cardWidth` | `380px` | Card width in focus layout |
| `perView` / `perViewTablet` / `perViewMobile` | `3` / `2` / `1.12` | Row layout only (decimals let the next post peek in) |
| `theme` | `'light'` | `light`, `dark` (the Framer reference look), `section` (uses the section's colour theme) |
| `captionLines` | `2` | Lines shown before the caption is cut off with "…" |
| `captionExpand` | `true` | Click the caption to show all of it |
| `likesStyle` | `'inline'` | `inline` = number beside the heart · `line` = "1,204 likes" row |
| `heartAnimation` | `'pop'` | `pop` or `none`: heart fill + pop on like |
| `likeAnimation` | `'roll'` | `roll` or `none`: number flips up/down on like/unlike |
| `countUp` | `true` | Like counts count up from 0 when the carousel scrolls into view |
| `doubleTapLike` | `true` | Double-click / double-tap a photo to like it (big heart burst) |
| `rememberLikes` | `true` | Remembers each visitor's likes and saves in their browser |
| `showCounter` | `false` | "1/4" badge on multi-photo posts |
| `showLikes` / `showDate` | `true` | Hide the like count or the date line |
| `autoplayVideo` | `true` | Muted autoplay while a post is on screen (and centred) |
| `sections` | `'auto'` | Methods B/C: number of sections to pull in, or `auto` (all gallery sections directly below) |
| `hideSource` | `true` | Hide the original sections on the live site |
| `idPrefix` | `'ig-carousel'` | Change the anchor-id prefix |

Likes, saves and reposts are visual only. They don't connect to Instagram.

## 6. Styling with CSS

Every colour, size and spacing is a CSS variable. They're all listed at the top of
[`src/ig-carousel.css`](../src/ig-carousel.css). Override them in **Design → Custom
CSS**, targeting one carousel by its anchor id:

```css
#ig-carousel-2 .igc { --igc-card-width: 420px; --igc-heart: #e1306c; }
```

More examples: [`snippets/custom-css-examples.css`](../snippets/custom-css-examples.css).

## 7. Testing checklist

- [ ] Live page (logged out / private window) shows the carousel; the original list/gallery sections are gone.
- [ ] Editor shows the original sections, and they're editable.
- [ ] **Middle arrows** move between posts; **dots** change the photo without moving to another post.
- [ ] Swiping a photo on a phone changes photos; swiping the caption area changes posts.
- [ ] Heart click: fills red, pops, count +1 (and −1 when clicked again).
- [ ] Double-tap a photo: big heart burst, liked.
- [ ] Long captions end in "…" after 2 lines, and expand on click.
- [ ] Videos play muted only while their post is centred; the speaker button unmutes.
- [ ] Two or more carousels on one page each work independently.
- [ ] Phone width: no sideways page scrolling, and the neighbour post peeks in.

## 8. Troubleshooting

| Symptom | Fix |
|---|---|
| Nothing changes | Check the anchor id starts with `ig-carousel`, the header snippet is saved, and you're viewing the live page (not the editor). |
| Carousel shows the wrong sections | Method C: check `data-sections`. Method B: a non-gallery section between the anchor and the galleries stops the collection. |
| No account name / avatar | Set `account` / `avatar` in the header snippet or a `carousels` override. |
| Gallery post has no caption/likes (Method B) | Some gallery layouts don't output image captions. Switch that post to Method C (a blank section with image blocks + a text block). |
| Photo order wrong (Method C) | Blocks are read top to bottom, then left to right. Nudge the blocks in Fluid Engine. |
| Native video block looks cropped | Expected: videos fill the frame (`object-fit: cover`). Use a ratio that matches the video, e.g. `9:16` for reels. |
| Template restyles the icons | Add `.igc button { … }` overrides in Custom CSS, or report the template so the reset can be extended. |

---

Source & updates: <https://github.com/zsawtelle-lgtm/sqsp-social-highlight-scroll>
