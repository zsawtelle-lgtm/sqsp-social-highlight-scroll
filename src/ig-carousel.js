/* ==========================================================================
   IG Carousel for Squarespace 7.1 — v1.2.0
   Instagram-style post carousel built from native Squarespace content.
   https://github.com/zsawtelle-lgtm/sqsp-social-highlight-scroll

   Three ways to feed it (mix freely on one page):

   1. LIST MODE     A native "Auto Layout → Carousel" list section whose
                    section anchor id starts with "ig-carousel"
                    (#ig-carousel-1, #ig-carousel-2 …). One list item = one
                    post. Item titles starting with "+" add extra photos to
                    the post above them.

   2. SECTION MODE  A section whose anchor id starts with "ig-carousel" but
                    has no list in it. The Grid gallery sections directly below
                    it become the posts (one gallery section = one post).

   3. CODE BLOCK    <div data-ig-carousel data-sections="3" hidden>
                      <p>Caption for post 1</p> <p>Caption for post 2</p> …
                    </div>
                    The next 3 sections become posts. Each can be a Grid
                    gallery section OR a blank (Fluid Engine) section holding
                    image blocks, video blocks and one text block for the
                    caption. data-avatar="first-image" turns each gallery's
                    first image into that post's profile picture, and its alt
                    text into the account name.

   Options are read (lowest → highest priority) from: defaults,
   window.IGCarouselConfig, IGCarouselConfig.carousels["<anchor id>"],
   ratio tokens in the anchor id (ig-carousel-2-16x9), CSS custom properties
   (--igc-layout, --igc-account …), data-* attributes on the Code Block div.
   Per-post "key: value" lines (location: Boston) override everything for
   that post.
   ========================================================================== */
(function () {
  'use strict';

  if (window.IGCarousel && window.IGCarousel.version) return; // loaded twice

  var VERSION = '1.2.0';

  var DEFAULTS = {
    idPrefix: 'ig-carousel',
    account: '',            // account name shown top-left
    avatar: '',             // profile picture URL, or "first-image" (gallery posts:
                            // first image = avatar, its alt text = account name)
    profile: '',            // URL the account name links to
    verified: false,        // blue check after the account name
    avatarRing: false,      // Instagram story-ring gradient around avatar
    location: '',           // small line under the account name
    aspect: '4:5',          // 1:1 | 4:5 | 16:9 | 9:16 | native | any "w:h"
    layout: 'focus',        // focus = one centred post, neighbours peek (Framer look)
                            // row   = several posts side by side
    cardWidth: '',          // focus layout card width, e.g. "420px" (default 380px)
    perView: 3,             // row layout: posts visible on desktop
    perViewTablet: 2,
    perViewMobile: 1.12,
    theme: 'light',         // light | dark | section
    captionLines: 2,        // lines shown before the caption is clipped "…"
    captionExpand: true,    // click caption to read the whole thing
    heartAnimation: 'pop',  // pop | none    (heart icon pop when liking)
    doubleTapLike: true,    // double-click / double-tap image to like
    rememberLikes: true,    // keep a visitor's likes/saves in their browser
    showCounter: false,     // "1/3" badge on multi-image posts
    showDate: true,
    autoplayVideo: true,    // muted autoplay while the post is on screen
    sections: 'auto',       // section/code-block mode: how many sections to pull
    hideSource: true        // hide the original sections after building
  };

  var META_KEYS = ['account', 'avatar', 'profile', 'link', 'video', 'location', 'date', 'alt'];
  var STORE_PREFIX = 'igc:';
  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ------------------------------------------------------------ Icons */
  var ICON = {
    heart: '<svg class="igc-heart-off" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z"/></svg>' +
           '<svg class="igc-heart-on" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.792 1.904a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z"/></svg>',
    comment: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z"/></svg>',
    repost: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.998 9.497a1 1 0 0 0-1 1v4.228a3.274 3.274 0 0 1-3.27 3.27h-5.313l1.791-1.787a1 1 0 0 0-1.412-1.416L7.29 18.287a1.004 1.004 0 0 0-.294.707v.001c0 .023.012.042.013.065a.923.923 0 0 0 .281.643l3.502 3.504a1 1 0 0 0 1.414-1.414l-1.797-1.798h5.318a5.276 5.276 0 0 0 5.27-5.27v-4.228a1 1 0 0 0-1-1Zm-6.41-3.496-1.795 1.795a1 1 0 1 0 1.414 1.414l3.5-3.5a1.003 1.003 0 0 0 0-1.417l-3.5-3.5a1 1 0 0 0-1.414 1.414l1.794 1.794H8.27A5.277 5.277 0 0 0 3 9.271V13.5a1 1 0 0 0 2 0V9.271a3.275 3.275 0 0 1 3.271-3.27Z"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13.973 20.046 21.77 6.928C22.8 5.195 21.55 3 19.535 3H4.466C2.138 3 .984 5.825 2.646 7.456l4.842 4.752 1.723 7.121c.548 2.266 3.571 2.721 4.762.717Z"/><line x1="7.488" x2="15.515" y1="12.208" y2="7.641"/></svg>',
    save: '<svg class="igc-save-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="20 21 12 13.44 4 21 4 3 20 3 20 21"/></svg>' +
          '<svg class="igc-save-on" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><polygon points="20 21 12 13.44 4 21 4 3 20 3 20 21"/></svg>',
    more: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/><circle cx="5" cy="12" r="1.5"/></svg>',
    prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>',
    burst: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.792 1.904a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z"/></svg>',
    verified: '<svg class="igc-verified" viewBox="0 0 40 40" role="img" aria-label="Verified"><path fill="#0095f6" d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Z"/><path fill="#fff" d="m17.42 26.53-6.06-6.06 2.12-2.12 3.94 3.94 8.68-8.68 2.12 2.12z"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.52.85l10.4-6.5a1 1 0 0 0 0-1.7L9.52 4.65A1 1 0 0 0 8 5.5z"/></svg>',
    soundOff: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9H3z"/><path d="m16 9 5 6m0-6-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    soundOn: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9H3z"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  };

  /* ---------------------------------------------------------- Helpers */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function extend(target) {
    for (var i = 1; i < arguments.length; i++) {
      var src = arguments[i];
      if (!src) continue;
      for (var k in src) if (Object.prototype.hasOwnProperty.call(src, k) && src[k] !== undefined && k !== 'carousels') target[k] = src[k];
    }
    return target;
  }
  function camel(s) { return s.replace(/-([a-z])/g, function (_, c) { return c.toUpperCase(); }); }
  function coerce(v) {
    if (v === 'true') return true;
    if (v === 'false') return false;
    if (v !== '' && !isNaN(v) && /^-?[\d.]+$/.test(v)) return parseFloat(v);
    return v;
  }
  function dataOptions(node) {
    var out = {};
    if (!node) return out;
    for (var i = 0; i < node.attributes.length; i++) {
      var a = node.attributes[i];
      if (a.name.indexOf('data-') !== 0 || a.name === 'data-ig-carousel') continue;
      out[camel(a.name.slice(5))] = coerce(a.value);
    }
    return out;
  }
  function store(key, val) {
    try {
      if (val === undefined) return window.localStorage.getItem(STORE_PREFIX + key);
      if (val === null) window.localStorage.removeItem(STORE_PREFIX + key);
      else window.localStorage.setItem(STORE_PREFIX + key, val);
    } catch (e) { /* private mode / blocked storage */ }
    return null;
  }
  function hash(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36);
  }

  /* Squarespace lazy-loads images: the real URL lives in data-src / data-image. */
  function imageUrl(img) {
    if (!img) return '';
    var url = img.getAttribute('data-src') || img.getAttribute('data-image') || img.currentSrc || img.getAttribute('src') || '';
    if (!url && img.getAttribute('srcset')) url = img.getAttribute('srcset').split(',').pop().trim().split(' ')[0];
    if (/^data:/.test(url)) url = img.getAttribute('data-src') || img.getAttribute('data-image') || '';
    return url;
  }
  function isSqspCdn(url) { return /images\.squarespace-cdn\.com|static1\.squarespace\.com/.test(url); }
  function sized(url, w) { return isSqspCdn(url) ? url.split('?')[0] + '?format=' + w + 'w' : url; }
  function buildImg(url, alt, focal) {
    var img = el('img');
    img.alt = alt || '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.draggable = false;
    if (isSqspCdn(url)) {
      img.src = sized(url, 1000);
      img.srcset = [500, 750, 1000, 1500, 2500].map(function (w) { return sized(url, w) + ' ' + w + 'w'; }).join(', ');
      img.sizes = '(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 420px';
    } else {
      img.src = url;
    }
    if (focal) {
      var f = String(focal).split(',');
      if (f.length === 2 && !isNaN(parseFloat(f[0])) && !isNaN(parseFloat(f[1]))) img.style.objectPosition = (parseFloat(f[0]) * 100) + '% ' + (parseFloat(f[1]) * 100) + '%';
    }
    return img;
  }
  function isVideoUrl(url) { return /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url || ''); }
  function embedUrl(url) {
    var m = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/.exec(url);
    if (m) return 'https://www.youtube.com/embed/' + m[1] + '?autoplay=1&mute=1&loop=1&playlist=' + m[1] + '&controls=0&playsinline=1';
    m = /vimeo\.com\/(?:video\/)?(\d+)/.exec(url);
    if (m) return 'https://player.vimeo.com/video/' + m[1] + '?autoplay=1&muted=1&loop=1&background=1';
    return '';
  }

  /* textContent, but <br> becomes a line break (works inside hidden elements too). */
  function textWithBreaks(n) {
    var c = n.cloneNode(true);
    $$('br', c).forEach(function (br) { br.parentNode.replaceChild(document.createTextNode('\n'), br); });
    return c.textContent;
  }

  /* Formatted post text (text blocks, video descriptions, code-block lines):
       bold          → account name
       link          → where the comment icon links
     The rest is the caption ("key: value" lines still work). */
  function parseRich(node) {
    if (!node) return parseText(null);
    var c = node.cloneNode(true);
    var meta = {};
    var bold = $('strong, b', c);
    if (bold) { meta.account = bold.textContent.trim(); bold.remove(); }
    $$('a[href]', c).forEach(function (a) {
      if (!meta.link) meta.link = a.getAttribute('href');
      a.remove();
    });
    var t = parseText(c);
    Object.keys(meta).forEach(function (k) { if (meta[k] && !t.meta[k]) t.meta[k] = meta[k]; });
    return t;
  }

  /* "location: Boston" lines become meta; everything else is the caption. */
  function parseText(node) {
    var meta = {};
    var lines = [];
    if (!node) return { caption: '', meta: meta };
    var blocks = $$('p, h1, h2, h3, h4, li, blockquote', node);
    var parts = (blocks.length ? blocks : [node]).map(textWithBreaks);
    parts.join('\n').split(/\n+/).forEach(function (line) {
      var m = /^\s*([a-z]+)\s*:\s*(.+?)\s*$/i.exec(line);
      if (m && META_KEYS.indexOf(m[1].toLowerCase()) > -1) meta[m[1].toLowerCase()] = m[2];
      else if (line.trim()) lines.push(line.trim());
    });
    return { caption: lines.join('\n'), meta: meta };
  }

  function ratioOf(aspect) {
    var m = /^(\d+(?:\.\d+)?)\s*[:x/]\s*(\d+(?:\.\d+)?)$/.exec(String(aspect || '').trim());
    return m ? m[1] + ' / ' + m[2] : null;
  }
  /* Measured sizes snap to the nearest standard ratio (586×587 → 1 / 1). */
  var STANDARD_RATIOS = [[1, 1], [4, 5], [3, 4], [2, 3], [9, 16], [5, 4], [4, 3], [3, 2], [16, 9]];
  function measureRatio(node) {
    if (!node) return null;
    var r = node.getBoundingClientRect();
    if (r.width < 10 || r.height < 10) return null;
    var k = r.width / r.height;
    for (var i = 0; i < STANDARD_RATIOS.length; i++) {
      var sr = STANDARD_RATIOS[i];
      if (Math.abs(k / (sr[0] / sr[1]) - 1) < 0.03) return sr[0] + ' / ' + sr[1];
    }
    return Math.round(r.width) + ' / ' + Math.round(r.height);
  }

  /* Read a --igc-* setting from Custom CSS (strips quotes and url()). */
  function cssSetting(node, name) {
    var v = getComputedStyle(node).getPropertyValue(name).trim();
    if (!v) return '';
    var u = /^url\((['"]?)(.*)\1\)$/.exec(v);
    if (u) return u[2];
    return v.replace(/^(['"])(.*)\1$/, '$2');
  }

  /* Squarespace leaves the file name as alt text when none was typed. */
  function looksLikeFileName(s) {
    return !s || /\.(png|jpe?g|gif|webp|avif|heic|svg)$/i.test(s) || /^(img|dsc|image)[-_ ]?\d+/i.test(s);
  }

  function isEditMode() {
    var b = document.body;
    return !!b && (b.classList.contains('sqs-edit-mode-active') || b.classList.contains('sqs-is-page-editing'));
  }

  /* ----------------------------------------------------- Source readers */
  var moved = [];   // [node, placeholder] — restored when the editor opens

  function moveNode(node) {
    var ph = document.createComment('igc');
    node.parentNode.insertBefore(ph, node);
    moved.push([node, ph]);
    return node;
  }

  function mediaFromBlock(block) {
    if (block.classList.contains('sqs-block-image')) {
      var img = $('img', block);
      var url = imageUrl(img);
      if (!url) return [];
      return [{ type: 'image', url: url, alt: img.alt, focal: img.getAttribute('data-image-focal-point'), rect: block }];
    }
    if (block.classList.contains('sqs-block-gallery')) {
      return galleryItems(block);
    }
    var native = block.classList.contains('sqs-block-video') && $('.sqs-native-video[data-config-video]', block);
    if (native) {
      var cfg = {};
      try { cfg = JSON.parse(native.getAttribute('data-config-video')); } catch (e) { cfg = {}; }
      if (cfg.alexandriaUrl) {
        // The block's custom thumbnail (Video block → Thumbnail) is the post's
        // profile picture; the video keeps its own first-frame poster.
        var thumb = {};
        try { thumb = JSON.parse(native.getAttribute('data-config-thumbnail') || '{}'); } catch (e) { thumb = {}; }
        var fp = thumb.mediaFocalPoint;
        return [{
          type: 'hls',
          url: cfg.alexandriaUrl.replace('{variant}', 'playlist.m3u8'),
          poster: cfg.alexandriaUrl.replace('{variant}', 'thumbnail'),
          avatar: thumb.assetUrl || '',
          avatarFocal: fp ? fp.x + ',' + fp.y : '',
          text: $('.video-caption', block)
        }];
      }
    }
    if (block.classList.contains('sqs-block-video') || block.classList.contains('sqs-block-embed')) {
      var html = block.innerHTML.replace(/&amp;/g, '&');
      var yt = /(?:youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?v=|shorts\/|v\/)|youtu\.be\/)([\w-]{11})/.exec(html);
      var vm = !yt && /(?:player\.)?vimeo\.com\/(?:video\/)?(\d{6,})/.exec(html);
      if (yt || vm) {
        return [{
          type: 'player',
          url: yt ? 'https://www.youtube.com/embed/' + yt[1] + '?playsinline=1&rel=0&modestbranding=1'
                  : 'https://player.vimeo.com/video/' + vm[1] + '?playsinline=1&title=0&byline=0&portrait=0',
          text: $('.video-caption', block)
        }];
      }
      return [{ type: 'block', node: $('.sqs-block-content', block) || block, video: true }];
    }
    if (block.classList.contains('sqs-block-code')) {
      if ($('[data-ig-carousel]', block)) return [];
      var v = $('video, iframe', block);
      if (!v) return [];
      if (v.tagName === 'VIDEO') {
        var src = v.getAttribute('src') || ($('source', v) && $('source', v).getAttribute('src'));
        return [{ type: 'video', url: src, poster: v.getAttribute('poster') }];
      }
      return [{ type: 'block', node: $('.sqs-block-content', block) || block, video: true }];
    }
    return [];
  }

  /* Gallery sections: the Grid layout only (.gallery-grid-item). */
  function galleryItems(root) {
    var items = $$('.gallery-grid-item', root);
    if (!items.length) items = $$('figure', root);   // gallery blocks inside Fluid Engine
    var out = [];
    items.forEach(function (item) {
      var img = $('img', item);
      var url = imageUrl(img);
      if (!url) return;
      out.push({
        type: 'image', url: url, alt: img.alt,
        focal: img.getAttribute('data-image-focal-point'),
        caption: $('figcaption, .gallery-caption, .gallery-caption-content', item)
      });
    });
    return out;
  }

  function isGallerySection(section) {
    if (!section.classList.contains('gallery-section')) return false;
    if ($('.gallery-grid', section)) return true;
    if (window.console) console.warn('[IG Carousel] Only Grid gallery layouts are supported. Skipping', section);
    return false;
  }

  function postFromSection(section, o) {
    var post = { slides: [], caption: '', meta: {} };
    if (isGallerySection(section)) {
      var items = galleryItems(section);
      if (o.avatar === 'first-image' && items.length > 1) {
        var face = items.shift();
        post.meta.avatar = face.url;
        if (!looksLikeFileName(face.alt)) post.meta.account = face.alt;
        post.profileImage = true;
      }
      items.forEach(function (it, i) {
        if (i === 0 && it.caption) {
          var t = parseText(it.caption);
          post.caption = t.caption;
          post.meta = t.meta;
        }
        post.slides.push(it);
      });
      return post;
    }

    /* Fluid Engine / classic section: order blocks the way they look on screen */
    var blocks = $$('.sqs-block', section).map(function (b) {
      var r = b.getBoundingClientRect();
      return { b: b, top: Math.round(r.top), left: Math.round(r.left) };
    });
    blocks.sort(function (a, c) { return Math.abs(a.top - c.top) > 8 ? a.top - c.top : a.left - c.left; });
    var texts = [];
    blocks.forEach(function (o) {
      var b = o.b;
      if (b.classList.contains('sqs-block-html') || b.classList.contains('sqs-block-markdown')) {
        texts.push(parseRich($('.sqs-block-content', b) || b));
        return;
      }
      mediaFromBlock(b).forEach(function (m) {
        if (m.text) texts.push(parseRich(m.text));   // video block description
        if (m.avatar && !post.meta.avatar) { post.meta.avatar = m.avatar; post.meta.avatarFocal = m.avatarFocal; }
        post.slides.push(m);
      });
    });
    texts.forEach(function (t) {
      if (t.caption) post.caption += (post.caption ? '\n' : '') + t.caption;
      extend(post.meta, t.meta);
    });
    return post;
  }

  function postsFromList(listRoot) {
    var posts = [];
    var items = $$('.user-items-list-carousel__slide, .user-items-list-simple__item, .user-items-list-banner-slideshow__slide, li.list-item, .list-item', listRoot);
    var seen = [];
    items = items.filter(function (it) {   // nested selectors can double-match
      for (var i = 0; i < seen.length; i++) if (seen[i] === it || seen[i].contains(it)) return false;
      seen.push(it);
      return true;
    });
    items.forEach(function (item) {
      var titleEl = $('.list-item-content__title, h2, h3', item);
      var title = titleEl ? (titleEl.textContent || '').trim() : '';
      var desc = parseText($('.list-item-content__description', item));
      var img = $('img', item);
      var url = imageUrl(img);
      var btn = $('.list-item-content__button, a.sqs-button-element--primary, .list-item-content__button-container a', item);
      var slide = null;
      var videoUrl = desc.meta.video || (btn && isVideoUrl(btn.getAttribute('href')) ? btn.getAttribute('href') : '');
      if (videoUrl) slide = { type: isVideoUrl(videoUrl) ? 'video' : 'embed', url: videoUrl, poster: url };
      else if (url) slide = { type: 'image', url: url, alt: (desc.meta.alt || (img && img.alt) || title), focal: img && img.getAttribute('data-image-focal-point') };

      if (/^\+/.test(title) && posts.length) {        // extra photo for the post above
        if (slide) posts[posts.length - 1].slides.push(slide);
        return;
      }
      var meta = desc.meta;
      if (!meta.link && btn && btn.getAttribute('href') && !isVideoUrl(btn.getAttribute('href'))) meta.link = btn.getAttribute('href');
      posts.push({ slides: slide ? [slide] : [], caption: desc.caption || title, meta: meta, title: title });
    });
    return posts;
  }

  function nextSections(section, count) {
    var out = [];
    var n = section.nextElementSibling;
    while (n) {
      if (n.tagName === 'SECTION' || n.classList.contains('page-section')) {
        if (count === 'auto') {
          if (!isGallerySection(n)) break;
        }
        out.push(n);
        if (count !== 'auto' && out.length >= count) break;
      }
      n = n.nextElementSibling;
    }
    return out;
  }

  /* --------------------------------------------------------- Rendering */
  function Carousel(opts, posts, root, key) {
    this.o = opts;
    this.posts = posts;
    this.key = key;
    this.active = 0;
    this.root = root;   // already in the page, so CSS settings could be read
    this.build();
  }

  Carousel.prototype.build = function () {
    var o = this.o, root = this.root, self = this;
    var focus = o.layout !== 'row';
    root.setAttribute('role', 'region');
    root.setAttribute('aria-roledescription', 'carousel');
    root.setAttribute('aria-label', (o.account ? o.account + ' ' : '') + 'posts');
    root.setAttribute('data-layout', focus ? 'focus' : 'row');
    root.setAttribute('data-theme', o.theme);
    root.setAttribute('data-heart-animation', reduceMotion ? 'none' : o.heartAnimation);
    root.setAttribute('data-caption-expand', String(!!o.captionExpand));
    root.style.setProperty('--igc-ratio-js', o._ratio || '4 / 5');
    if (o._gap) root.style.setProperty('--igc-gap-native', o._gap);
    root.style.setProperty('--igc-caption-lines', o.captionLines);
    if (o.cardWidth) root.style.setProperty('--igc-card-width', /^\d+$/.test(String(o.cardWidth)) ? o.cardWidth + 'px' : o.cardWidth);
    root.style.setProperty('--igc-per-view', o.perView);
    root.style.setProperty('--igc-per-view-tablet', o.perViewTablet);
    root.style.setProperty('--igc-per-view-mobile', o.perViewMobile);
    if (this.posts.length < o.perView) root.setAttribute('data-centered', 'true');

    var vp = this.viewport = el('div', 'igc-viewport');
    vp.tabIndex = 0;
    vp.setAttribute('aria-label', 'Use left and right arrow keys to change post');
    vp.style.position = 'relative';      // so post.offsetLeft is measured from the track
    root.appendChild(vp);
    this.cards = this.posts.map(function (p, i) {
      var card = self.renderPost(p, i);
      vp.appendChild(card);
      return card;
    });

    if (!focus) {   // row layout: arrows on the carousel edges
      this.prevBtn = this.arrow('prev', 'igc-arrow--edge');
      this.nextBtn = this.arrow('next', 'igc-arrow--edge');
      this.prevBtn.style.left = '-20px';
      this.nextBtn.style.right = '-20px';
      root.appendChild(this.prevBtn);
      root.appendChild(this.nextBtn);
    }

    vp.addEventListener('scroll', function () { self.queue(); }, { passive: true });
    window.addEventListener('resize', function () { self.queue(); });
    vp.addEventListener('keydown', function (e) {
      if (e.target !== vp) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); self.step(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); self.step(-1); }
    });
    // focus layout: tapping a faded side post brings it to the centre
    vp.addEventListener('click', function (e) {
      if (!focus) return;
      var card = e.target.closest('.igc-post');
      if (card && !card.classList.contains('is-active')) {
        e.preventDefault();
        e.stopPropagation();   // only centre it: don't also count as a tap on its video
        self.goTo(self.cards.indexOf(card));
      }
    }, true);
    this.observe();
    this.update();
  };

  Carousel.prototype.arrow = function (dir, extra) {
    var self = this;
    var b = el('button', 'igc-arrow igc-arrow--' + dir + (extra ? ' ' + extra : ''), ICON[dir]);
    b.type = 'button';
    b.setAttribute('aria-label', dir === 'prev' ? 'Previous post' : 'Next post');
    b.addEventListener('click', function (e) { e.stopPropagation(); self.step(dir === 'prev' ? -1 : 1); });
    return b;
  };

  Carousel.prototype.queue = function () {
    var self = this;
    if (this._raf) return;
    this._raf = requestAnimationFrame(function () { self._raf = 0; self.update(); });
  };

  /* Which post is "current": the one nearest the centre (focus) or the left edge (row). */
  Carousel.prototype.update = function () {
    var vp = this.viewport;
    var focus = this.o.layout !== 'row';
    var ref = focus ? vp.scrollLeft + vp.clientWidth / 2 : vp.scrollLeft;
    var best = 0, bestD = Infinity;
    this.cards.forEach(function (c, i) {
      var pos = focus ? c.offsetLeft + c.offsetWidth / 2 : c.offsetLeft;
      var d = Math.abs(pos - ref);
      if (d < bestD) { bestD = d; best = i; }
    });
    if (best !== this.active || !this._updated) {
      this._updated = true;
      this.active = best;
      this.cards.forEach(function (c, i) {
        c.classList.toggle('is-active', i === best);
        c.setAttribute('aria-hidden', focus && i !== best ? 'true' : 'false');
      });
      var self = this;
      this.cards.forEach(function (c) { self.playVisible($('.igc-media-track', c)); });
    }
    if (this.prevBtn) {
      var max = vp.scrollWidth - vp.clientWidth;
      this.prevBtn.disabled = vp.scrollLeft <= 2;
      this.nextBtn.disabled = vp.scrollLeft >= max - 2;
    }
  };

  Carousel.prototype.goTo = function (i) {
    var vp = this.viewport;
    var card = this.cards[Math.max(0, Math.min(this.cards.length - 1, i))];
    if (!card) return;
    var left = this.o.layout === 'row' ? card.offsetLeft : card.offsetLeft - (vp.clientWidth - card.offsetWidth) / 2;
    vp.scrollTo({ left: left, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  Carousel.prototype.step = function (dir) { this.goTo(this.active + dir); };

  Carousel.prototype.renderPost = function (p, index) {
    var o = this.o, self = this;
    var m = p.meta || {};
    var total = this.posts.length;
    var account = m.account || o.account || '';
    var avatar = m.avatar || (o.avatar === 'first-image' ? '' : o.avatar) || '';
    var profile = m.profile || o.profile || '';
    var loc = m.location || o.location || '';
    var postKey = this.key + ':' + hash((p.slides[0] && p.slides[0].url) || p.caption || String(index));

    var art = el('article', 'igc-post');
    art.setAttribute('aria-roledescription', 'slide');
    art.setAttribute('aria-label', 'Post ' + (index + 1) + ' of ' + total);

    /* ---- header: avatar + account name ---- */
    var head = el('header', 'igc-head');
    var av = el('div', 'igc-avatar');
    av.setAttribute('data-ring', String(!!o.avatarRing));
    av.innerHTML = avatar ? '<img src="' + esc(sized(avatar, 300)) + '" alt="" loading="lazy">' : '<span>' + esc(account.charAt(0) || '•') + '</span>';
    var af = String(m.avatarFocal || '').split(',');
    if (avatar && af.length === 2 && !isNaN(parseFloat(af[0]))) $('img', av).style.objectPosition = (parseFloat(af[0]) * 100) + '% ' + (parseFloat(af[1]) * 100) + '%';
    var who = el('div', 'igc-who');
    var nameTag = profile ? 'a' : 'span';
    who.innerHTML = '<' + nameTag + ' class="igc-account"' + (profile ? ' href="' + esc(profile) + '" target="_blank" rel="noopener"' : '') + '>' +
      esc(account) + (o.verified ? ICON.verified : '') + '</' + nameTag + '>' +
      (loc ? '<span class="igc-location">' + esc(loc) + '</span>' : '');
    var more = el('button', 'igc-more', ICON.more);
    more.type = 'button';
    more.tabIndex = -1;
    more.setAttribute('aria-hidden', 'true');
    head.appendChild(av);
    head.appendChild(who);
    head.appendChild(more);
    art.appendChild(head);

    /* ---- media: this post's own photo/video gallery ---- */
    var media = el('div', 'igc-media');
    var track = el('div', 'igc-media-track');
    var hasVideo = false;
    p.slides.forEach(function (s, i) {
      var slide = el('div', 'igc-slide');
      slide.setAttribute('aria-label', 'Photo ' + (i + 1) + ' of ' + p.slides.length);
      if (s.type === 'image') {
        slide.appendChild(buildImg(s.url, s.alt, s.focal));
      } else if (s.type === 'video') {
        var v = el('video');
        v.src = s.url;
        v.muted = true;
        v.loop = true;
        v.playsInline = true;
        v.setAttribute('playsinline', '');
        v.setAttribute('muted', '');
        v.preload = 'metadata';
        if (s.poster) v.poster = sized(s.poster, 1000);
        slide.appendChild(v);
        hasVideo = true;
      } else if (s.type === 'hls') {
        var hv = el('video');
        hv.muted = true;
        hv.loop = true;
        hv.playsInline = true;
        hv.setAttribute('playsinline', '');
        hv.setAttribute('muted', '');
        hv.preload = 'none';
        hv.poster = s.poster;
        hv.setAttribute('data-hls', s.url);   // stream attached on first play
        slide.appendChild(hv);
        hasVideo = true;
      } else if (s.type === 'player') {   // YouTube / Vimeo with their own play controls
        var pf = el('iframe');
        pf.src = s.url;
        pf.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
        pf.allowFullscreen = true;
        pf.loading = 'lazy';
        pf.title = 'Video';
        slide.classList.add('igc-slide--player');
        slide.appendChild(pf);
      } else if (s.type === 'embed') {
        var src = embedUrl(s.url);
        if (src) {
          var f = el('iframe');
          f.src = src;
          f.allow = 'autoplay; fullscreen; picture-in-picture';
          f.loading = 'lazy';
          f.title = 'Video';
          slide.appendChild(f);
        } else if (s.poster) slide.appendChild(buildImg(s.poster, ''));
      } else if (s.type === 'block' && s.node) {
        slide.classList.add('igc-slide--block');
        slide.appendChild(moveNode(s.node));
        if ($('video', s.node)) hasVideo = true;
      }
      track.appendChild(slide);
    });
    if (!p.slides.length) track.appendChild(el('div', 'igc-slide'));
    media.appendChild(track);
    var n = p.slides.length;

    /* mid-image arrows switch POSTS (focus layout) */
    if (o.layout !== 'row' && total > 1) {
      var pa = this.arrow('prev'), na = this.arrow('next');
      if (index === 0) pa.hidden = true;
      if (index === total - 1) na.hidden = true;
      media.appendChild(pa);
      media.appendChild(na);
    }

    /* dots switch PHOTOS inside this post — never the carousel */
    var counter = null, dots = null;
    if (n > 1) {
      if (o.showCounter) { counter = el('span', 'igc-counter', '1/' + n); media.appendChild(counter); }
      dots = el('div', 'igc-dots');
      for (var d = 0; d < n; d++) {
        var dot = el('button', 'igc-dot');
        dot.type = 'button';
        dot.setAttribute('aria-label', 'Show photo ' + (d + 1) + ' of ' + n);
        dot.setAttribute('aria-current', d === 0 ? 'true' : 'false');
        (function (i) { dot.addEventListener('click', function (e) { e.stopPropagation(); goSlide(i); }); })(d);
        dots.appendChild(dot);
      }
      media.appendChild(dots);
    }
    if (hasVideo) {
      media.setAttribute('data-video', 'true');
      var mute = el('button', 'igc-mute', ICON.soundOff);
      mute.type = 'button';
      mute.setAttribute('aria-label', 'Unmute');
      mute.addEventListener('click', function (e) {
        e.stopPropagation();
        var vids = $$('video', track);
        var on = vids.length && vids[0].muted;
        vids.forEach(function (v) { v.muted = !on; });
        mute.innerHTML = on ? ICON.soundOn : ICON.soundOff;
        mute.setAttribute('aria-label', on ? 'Mute' : 'Unmute');
      });
      media.appendChild(mute);
    }
    if (hasVideo) {
      media.setAttribute('data-playing', 'false');
      var playIcon = el('div', 'igc-play', ICON.play);
      playIcon.setAttribute('aria-hidden', 'true');
      media.appendChild(playIcon);
      $$('video', track).forEach(function (v) {
        v.addEventListener('play', function () { media.setAttribute('data-playing', 'true'); });
        v.addEventListener('pause', function () { media.setAttribute('data-playing', 'false'); });
      });
    }
    var burst = el('div', 'igc-burst', ICON.burst);
    media.appendChild(burst);
    art.appendChild(media);

    /* ---- action row: heart · comment · repost · share ......... save ---- */
    var actions = el('div', 'igc-actions');
    var like = el('button', 'igc-action igc-like', ICON.heart);
    like.type = 'button';
    like.setAttribute('aria-label', 'Like');
    like.setAttribute('aria-pressed', 'false');
    var comment = el(m.link ? 'a' : 'button', 'igc-action igc-comment', ICON.comment);
    if (m.link) { comment.href = m.link; comment.target = '_blank'; comment.rel = 'noopener'; } else comment.type = 'button';
    comment.setAttribute('aria-label', 'Comment');
    var repost = el('button', 'igc-action igc-repost', ICON.repost);
    repost.type = 'button';
    repost.setAttribute('aria-label', 'Repost');
    repost.setAttribute('aria-pressed', 'false');
    var share = el('button', 'igc-action igc-share', ICON.share);
    share.type = 'button';
    share.setAttribute('aria-label', 'Share');
    var save = el('button', 'igc-action igc-save', ICON.save);
    save.type = 'button';
    save.setAttribute('aria-label', 'Save');
    save.setAttribute('aria-pressed', 'false');
    [like, comment, repost, share, save].forEach(function (b) { actions.appendChild(b); });
    art.appendChild(actions);

    /* ---- text: clipped caption ---- */
    var body = el('div', 'igc-body');
    if (p.caption) {
      var cap = el('p', 'igc-caption');
      cap.innerHTML = (account ? '<b>' + esc(account) + '</b>' : '') + esc(p.caption).replace(/\n/g, ' ');
      if (o.captionExpand) cap.addEventListener('click', function () { cap.classList.toggle('is-open'); });
      body.appendChild(cap);
    }
    if (o.showDate && m.date) body.appendChild(el('div', 'igc-meta', esc(m.date)));
    if (body.children.length) art.appendChild(body);
    else actions.style.paddingBottom = '14px';

    /* ---- behaviour ---- */
    var current = -1;
    function goSlide(i) {
      i = Math.max(0, Math.min(n - 1, i));
      track.scrollTo({ left: i * track.clientWidth, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
    function syncSlide() {
      var i = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
      if (i === current) return;
      current = i;
      if (counter) counter.textContent = (i + 1) + '/' + n;
      if (dots) $$('.igc-dot', dots).forEach(function (dd, k) {
        dd.setAttribute('aria-current', k === i ? 'true' : 'false');
        dd.setAttribute('data-far', Math.abs(k - i) > 2 ? 'true' : 'false');
      });
      self.playVisible(track);
    }
    var raf = 0;
    track.addEventListener('scroll', function () {
      if (raf) return;
      raf = requestAnimationFrame(function () { raf = 0; syncSlide(); });
    }, { passive: true });
    syncSlide();

    var liked = false;
    function setLiked(on, animate) {
      if (on === liked) return;
      liked = on;
      like.classList.toggle('is-liked', on);
      like.setAttribute('aria-pressed', String(on));
      like.setAttribute('aria-label', on ? 'Unlike' : 'Like');
      if (o.rememberLikes) store(postKey + ':like', on ? '1' : null);
      if (animate && on) {
        like.classList.remove('is-pop');
        void like.offsetWidth;
        like.classList.add('is-pop');
      }
    }
    if (o.rememberLikes && store(postKey + ':like') === '1') setLiked(true, false);
    like.addEventListener('click', function () { setLiked(!liked, true); });

    /* single tap on a video = play / pause (waits briefly so a double-tap can still like) */
    var tapTimer = 0;
    media.addEventListener('click', function (e) {
      if (e.target.closest('button, a')) return;
      var v = $$('.igc-slide', track)[current];
      v = v && $('video', v);
      if (!v) return;
      clearTimeout(tapTimer);
      tapTimer = setTimeout(function () {
        if (v.paused) {
          v._igcUserPaused = false;
          attachStream(v).then(function () { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); });
        } else {
          v._igcUserPaused = true;
          v.pause();
        }
      }, o.doubleTapLike ? 260 : 0);
    });

    if (o.doubleTapLike) {
      var lastTap = 0;
      media.addEventListener('dblclick', function (e) {
        if (e.target.closest('button')) return;
        e.preventDefault();
        clearTimeout(tapTimer);
        heartBurst();
      });
      media.addEventListener('touchend', function (e) {
        if (e.target.closest('button, a')) return;
        var now = Date.now();
        if (now - lastTap < 300) { e.preventDefault(); clearTimeout(tapTimer); heartBurst(); lastTap = 0; } else lastTap = now;
      });
    }
    function heartBurst() {
      setLiked(true, true);
      if (reduceMotion) return;
      burst.classList.remove('is-on');
      void burst.offsetWidth;
      burst.classList.add('is-on');
    }

    var saved = false;
    function setSaved(on) {
      saved = on;
      save.classList.toggle('is-saved', on);
      save.setAttribute('aria-pressed', String(on));
      if (o.rememberLikes) store(postKey + ':save', on ? '1' : null);
    }
    if (o.rememberLikes && store(postKey + ':save') === '1') setSaved(true);
    save.addEventListener('click', function () { setSaved(!saved); });
    repost.addEventListener('click', function () {
      var on = !repost.classList.contains('is-reposted');
      repost.classList.toggle('is-reposted', on);
      repost.setAttribute('aria-pressed', String(on));
    });
    share.addEventListener('click', function () {
      var url = m.link ? new URL(m.link, window.location.href).href : window.location.href.split('#')[0] + (o._anchor ? '#' + o._anchor : '');
      if (navigator.share) { navigator.share({ title: account, text: p.caption, url: url }).catch(function () {}); return; }
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () {
        share.setAttribute('aria-label', 'Link copied');
        share.style.opacity = '0.5';
        setTimeout(function () { share.style.opacity = ''; share.setAttribute('aria-label', 'Share'); }, 1200);
      });
    });

    return art;
  };

  Carousel.prototype.observe = function () {
    var self = this;
    if (!('IntersectionObserver' in window)) {
      $$('.igc-media-track', this.root).forEach(function (t) { self.playVisible(t); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var track = $('.igc-media-track', e.target);
        if (e.isIntersecting) self.playVisible(track);
        else $$('video', track).forEach(function (v) { v.pause(); });
      });
    }, { threshold: 0.35 });
    $$('.igc-post', this.root).forEach(function (p) { io.observe(p); });
  };

  Carousel.prototype.playVisible = function (track) {
    if (!track || !this.o.autoplayVideo) return;
    var w = Math.max(1, track.clientWidth);
    var i = Math.round(track.scrollLeft / w);
    var post = track.closest('.igc-post');
    var onScreen = false;
    if (post && (this.o.layout === 'row' || post.classList.contains('is-active'))) {
      var r = post.getBoundingClientRect(), vr = this.viewport.getBoundingClientRect();
      onScreen = r.right > vr.left + 20 && r.left < vr.right - 20 && r.bottom > 0 && r.top < window.innerHeight;
    }
    $$('.igc-slide', track).forEach(function (s, k) {
      $$('video', s).forEach(function (v) {
        if (k === i && onScreen) {
          if (v._igcUserPaused) return;
          attachStream(v).then(function () { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); });
        }
        else v.pause();
      });
    });
  };

  /* Squarespace-hosted videos are encrypted HLS streams, played with hls.js
     (loaded from jsDelivr only when a page has one). */
  var HLS_SRC = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
  var hlsLoading = null;
  function loadHls() {
    if (window.Hls) return Promise.resolve(window.Hls);
    if (!hlsLoading) {
      hlsLoading = new Promise(function (resolve, reject) {
        var sc = document.createElement('script');
        sc.src = HLS_SRC;
        sc.async = true;
        sc.onload = function () { resolve(window.Hls); };
        sc.onerror = reject;
        document.head.appendChild(sc);
      });
    }
    return hlsLoading;
  }
  function attachStream(v) {
    var url = v.getAttribute('data-hls');
    if (!url) return Promise.resolve();
    if (v._igcStream) return v._igcStream;
    // Prefer hls.js: Chrome now *claims* native HLS support but fails on
    // Squarespace's encrypted streams. Native is the fallback for browsers
    // without MediaSource (older iPhones).
    var native = function () { if (v.canPlayType('application/vnd.apple.mpegurl')) v.src = url; };
    if (window.MediaSource || window.ManagedMediaSource) {
      v._igcStream = loadHls().then(function (Hls) {
        if (!Hls || !Hls.isSupported()) { native(); return; }
        var hls = new Hls({ capLevelToPlayerSize: true });
        hls.loadSource(url);
        hls.attachMedia(v);
        v._igcHls = hls;
      }).catch(native);
    } else {
      native();
      v._igcStream = Promise.resolve();
    }
    return v._igcStream;
  }

  /* --------------------------------------------------------- Bootstrap */
  var instances = [];

  function globalConfig() { return window.IGCarouselConfig || {}; }

  function optionsFor(anchorId, codeNode) {
    var g = globalConfig();
    var o = extend({}, DEFAULTS, g);
    if (anchorId && g.carousels && g.carousels[anchorId]) extend(o, g.carousels[anchorId]);
    var tok = anchorId && /-(\d+(?:\.\d+)?x\d+(?:\.\d+)?)$/.exec(anchorId);
    if (tok) o.aspect = tok[1].replace('x', ':');
    o._data = dataOptions(codeNode);
    extend(o, o._data);
    o._anchor = anchorId || '';
    return o;
  }

  function sectionOf(node) {
    return node.closest('section, .page-section') || node;
  }

  function anchorIdOf(section) {
    if (section.id) return section.id;
    var inner = section.querySelector('[id^="' + (globalConfig().idPrefix || DEFAULTS.idPrefix) + '"]');
    return inner ? inner.id : '';
  }

  function findTargets() {
    var prefix = globalConfig().idPrefix || DEFAULTS.idPrefix;
    var targets = [];
    var used = [];
    $$('[data-ig-carousel]').forEach(function (code) {
      if (code.closest('.igc')) return;
      var section = sectionOf(code);
      if (used.indexOf(section) > -1) return;
      used.push(section);
      targets.push({ section: section, code: code });
    });
    $$('[id^="' + prefix + '"]').forEach(function (n) {
      if (n.closest('.igc')) return;
      var section = sectionOf(n);
      if (used.indexOf(section) > -1) return;
      used.push(section);
      targets.push({ section: section, code: null });
    });
    return targets;
  }

  /* "Space between items" from the list / gallery design panel. */
  /* Custom CSS can set layout / theme / account / avatar per carousel, e.g.
     #ig-carousel-2 { --igc-layout: row; --igc-account: "swtl.design"; }
     Code-block data-* attributes still win over CSS. */
  function applyCssSettings(o, root) {
    var data = o._data || {};
    [['layout', '--igc-layout'], ['theme', '--igc-theme'], ['account', '--igc-account'], ['avatar', '--igc-avatar'], ['profile', '--igc-profile']].forEach(function (pair) {
      if (data[pair[0]] !== undefined) return;
      var v = cssSetting(root, pair[1]);
      if (v) o[pair[0]] = v;
    });
  }

  function nativeGap(node) {
    if (!node) return '';
    var g = parseFloat(getComputedStyle(node).columnGap);
    return g > 0 ? g + 'px' : '';
  }

  /* Grid galleries publish their spacing slider as data-gutter before their own
     script applies it (gutter 48 renders as 2.4vw, i.e. gutter / 20 vw). */
  function galleryGutter(grid) {
    var g = grid && parseFloat(grid.getAttribute('data-gutter'));
    return g > 0 ? (g / 20) + 'vw' : '';
  }

  function buildTarget(t) {
    var section = t.section;
    var anchorId = anchorIdOf(section);
    var o = optionsFor(anchorId, t.code);
    var list = !t.code && $('.user-items-list', section);
    var root = el('div', 'igc');
    var posts, measureNode, hidden = [];
    if (list) {
      list.parentNode.insertBefore(root, list.nextSibling);
    } else if (t.code) {
      t.code.parentNode.insertBefore(root, t.code.nextSibling);
    } else {
      root.style.marginTop = 'var(--igc-section-spacing, 2rem)';
      ($('.content-wrapper > .content', section) || $('.content-wrapper', section) || section).appendChild(root);
    }
    applyCssSettings(o, root);

    if (list) {
      measureNode = $('.user-items-list-carousel__media-container, .list-image, .user-items-list-simple__media, .list-item img', list);
      if (o.aspect === 'native') {
        var nativeRatio = $('[data-media-aspect-ratio]', list);   // the list section's Image ratio setting
        o._ratio = (nativeRatio && ratioOf(nativeRatio.getAttribute('data-media-aspect-ratio'))) || measureRatio(measureNode);
      }
      o._gap = nativeGap($('.user-items-list-carousel__slides, .user-items-list-simple, .user-items-list-banner-slideshow__slides', list));
      posts = postsFromList(list);
      hidden.push(list);
    } else {
      var count = o.sections === 'auto' ? 'auto' : Math.max(1, parseInt(o.sections, 10) || 1);
      var sources = nextSections(section, count);
      if (!sources.length) { root.remove(); return; }
      if (o.aspect === 'native') {   // measure a real photo, not the profile image
        var tiles = $$('.gallery-grid-item, .sqs-block-image .image-block-wrapper', sources[0]);
        o._ratio = measureRatio(tiles[o.avatar === 'first-image' && tiles.length > 1 ? 1 : 0]);
      }
      o._gap = nativeGap($('.gallery-grid-wrapper', sources[0])) || galleryGutter($('.gallery-grid[data-gutter]', sources[0]));
      var captions = t.code ? $$('p, li', t.code).map(function (n) { return parseRich(n); }) : [];
      posts = sources.map(function (src, i) {
        var post = postFromSection(src, o);
        var c = captions[i];
        if (c) {
          if (c.caption) post.caption = c.caption;
          extend(post.meta, c.meta);
        }
        return post;
      }).filter(function (p) { return p.slides.length; });
      if (o.hideSource) hidden = hidden.concat(sources);
    }
    if (!posts.length) { root.remove(); return; }
    if (!o._ratio) o._ratio = ratioOf(o.aspect) || '4 / 5';

    var carousel = new Carousel(o, posts, root, anchorId || ('igc-' + instances.length));
    hidden.forEach(function (h) { h.classList.add('igc-source-hidden'); });
    instances.push({ carousel: carousel, hidden: hidden, section: section });
    carousel.root.dispatchEvent(new CustomEvent('igc:ready', { bubbles: true, detail: { id: anchorId, posts: posts.length, options: o } }));
  }

  function init() {
    if (isEditMode()) return;
    findTargets().forEach(function (t) {
      try { buildTarget(t); } catch (e) { if (window.console) console.warn('[IG Carousel]', e); }
    });
  }

  /* Opening the Squarespace editor: put every original section back so it can be edited. */
  function destroy() {
    instances.forEach(function (inst) {
      inst.hidden.forEach(function (h) { h.classList.remove('igc-source-hidden'); });
      $$('video', inst.carousel.root).forEach(function (v) { if (v._igcHls) v._igcHls.destroy(); });
      if (inst.carousel.root.parentNode) inst.carousel.root.parentNode.removeChild(inst.carousel.root);
    });
    moved.forEach(function (pair) {
      if (pair[1].parentNode) { pair[1].parentNode.insertBefore(pair[0], pair[1]); pair[1].parentNode.removeChild(pair[1]); }
    });
    instances = [];
    moved = [];
  }

  function watchEditor() {
    if (!window.MutationObserver || !document.body) return;
    var editing = isEditMode();
    new MutationObserver(function () {
      var now = isEditMode();
      if (now === editing) return;
      editing = now;
      if (now) destroy(); else init();
    }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  function start() {
    init();
    watchEditor();
  }

  window.IGCarousel = { version: VERSION, init: init, destroy: destroy, refresh: function () { destroy(); init(); } };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
