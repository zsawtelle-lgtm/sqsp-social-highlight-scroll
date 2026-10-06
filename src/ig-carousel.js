/* ==========================================================================
   IG Carousel for Squarespace 7.1 — v1.0.0
   Instagram-style post carousel built from native Squarespace content.
   https://github.com/zsawtelle-lgtm/sqsp-social-highlight-scroll

   Three ways to feed it (mix freely on one page):

   1. LIST MODE     A native "Auto Layout → Carousel" list section whose
                    section anchor id starts with "ig-carousel"
                    (#ig-carousel-1, #ig-carousel-2 …). One list item = one
                    post. Item titles starting with "+" add extra photos to
                    the post above them.

   2. SECTION MODE  A section whose anchor id starts with "ig-carousel" but
                    has no list in it. The gallery sections directly below it
                    become the posts (one gallery section = one post).

   3. CODE BLOCK    <div data-ig-carousel data-sections="3"></div> in a Code
                    Block. The next 3 sections become posts. Each can be a
                    gallery section OR a blank (Fluid Engine) section holding
                    image blocks, video blocks and one text block for the
                    caption — this is the mode for mixed photo + video posts.

   Options are read (lowest → highest priority) from: defaults,
   window.IGCarouselConfig, IGCarouselConfig.carousels["<anchor id>"],
   ratio tokens in the anchor id (ig-carousel-2-16x9), data-* attributes on
   the Code Block div. Per-post "key: value" lines (likes: 1,204) in captions
   override everything for that post.
   ========================================================================== */
(function () {
  'use strict';

  if (window.IGCarousel && window.IGCarousel.version) return; // loaded twice

  var VERSION = '1.0.0';

  var DEFAULTS = {
    idPrefix: 'ig-carousel',
    account: '',            // account name shown top-left
    avatar: '',             // image URL for the profile picture
    profile: '',            // URL the account name links to
    verified: false,        // blue check after the account name
    avatarRing: true,       // Instagram story-ring gradient around avatar
    location: '',           // small line under the account name
    aspect: '4:5',          // 1:1 | 4:5 | 16:9 | 9:16 | native | any "w:h"
    perView: 3,             // posts visible on desktop
    perViewTablet: 2,
    perViewMobile: 1.12,
    theme: 'light',         // light | dark | section
    captionLines: 2,        // lines shown before the caption is clipped "…"
    captionExpand: true,    // click caption to read the whole thing
    likeAnimation: 'roll',  // roll | none   (number flip when liking)
    heartAnimation: 'pop',  // pop | none    (heart icon pop when liking)
    countUp: true,          // like counts count up when scrolled into view
    doubleTapLike: true,    // double-click / double-tap image to like
    rememberLikes: true,    // keep a visitor's likes/saves in their browser
    showCounter: true,      // "1/3" badge on multi-image posts
    showLikes: true,
    showDate: true,
    autoplayVideo: true,    // muted autoplay while the post is on screen
    sections: 'auto',       // section/code-block mode: how many sections to pull
    hideSource: true        // hide the original sections after building
  };

  var META_KEYS = ['likes', 'comments', 'account', 'avatar', 'profile', 'link', 'video', 'location', 'date', 'alt'];
  var STORE_PREFIX = 'igc:';
  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ------------------------------------------------------------ Icons */
  var ICON = {
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M16.79 3.5c-1.98 0-3.42 1.2-4.79 2.86C10.63 4.7 9.19 3.5 7.21 3.5 4.3 3.5 2 5.88 2 8.97c0 4.52 4.58 8.21 10 11.53 5.42-3.32 10-7.01 10-11.53 0-3.09-2.3-5.47-5.21-5.47z"/></svg>',
    comment: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M20.66 17.01A9.99 9.99 0 1 0 17.07 20.62L22 22z"/></svg>',
    repost: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 11V9.5A3.5 3.5 0 0 1 7.5 6H19"/><path d="m16 3 3 3-3 3"/><path d="M20 13v1.5a3.5 3.5 0 0 1-3.5 3.5H5"/><path d="m8 21-3-3 3-3"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M22 3 9.22 10.08"/><path d="M11.7 20.33 22 3H2l7.22 7.08z"/></svg>',
    save: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M20 21 12 13.44 4 21V3h16z"/></svg>',
    more: '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>',
    prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
    burst: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.79 3.5c-1.98 0-3.42 1.2-4.79 2.86C10.63 4.7 9.19 3.5 7.21 3.5 4.3 3.5 2 5.88 2 8.97c0 4.52 4.58 8.21 10 11.53 5.42-3.32 10-7.01 10-11.53 0-3.09-2.3-5.47-5.21-5.47z"/></svg>',
    verified: '<svg class="igc-verified" viewBox="0 0 40 40" aria-label="Verified"><path fill="#0095f6" d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Z"/><path fill="#fff" d="m17.42 26.53-6.06-6.06 2.12-2.12 3.94 3.94 8.68-8.68 2.12 2.12z"/></svg>',
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
      if (f.length === 2) img.style.objectPosition = (parseFloat(f[0]) * 100) + '% ' + (parseFloat(f[1]) * 100) + '%';
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

  /* "likes: 1,204" lines become meta; everything else is the caption. */
  function parseText(node) {
    var meta = {};
    var lines = [];
    if (!node) return { caption: '', meta: meta };
    var blocks = $$('p, h1, h2, h3, h4, li, blockquote', node);
    var parts = blocks.length ? blocks.map(function (b) { return b.innerText || b.textContent; }) : [(node.innerText || node.textContent)];
    parts.join('\n').split(/\n+/).forEach(function (line) {
      var m = /^\s*([a-z]+)\s*:\s*(.+?)\s*$/i.exec(line);
      if (m && META_KEYS.indexOf(m[1].toLowerCase()) > -1) meta[m[1].toLowerCase()] = m[2];
      else if (line.trim()) lines.push(line.trim());
    });
    return { caption: lines.join('\n'), meta: meta };
  }

  function parseCount(v) {
    if (v == null || v === '') return null;
    var s = String(v).trim().toLowerCase().replace(/,/g, '');
    var m = /^([\d.]+)\s*([km])?/.exec(s);
    if (!m) return null;
    var n = parseFloat(m[1]);
    if (m[2] === 'k') n *= 1e3;
    if (m[2] === 'm') n *= 1e6;
    return { n: Math.round(n), compact: !!m[2] };
  }
  function formatCount(n, compact) {
    if (compact && n >= 10000) {
      try { return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n).toLowerCase(); } catch (e) {}
    }
    try { return n.toLocaleString('en-US'); } catch (e2) { return String(n); }
  }

  function ratioOf(aspect) {
    var m = /^(\d+(?:\.\d+)?)\s*[:x/]\s*(\d+(?:\.\d+)?)$/.exec(String(aspect || '').trim());
    return m ? m[1] + ' / ' + m[2] : null;
  }
  function measureRatio(node) {
    if (!node) return null;
    var r = node.getBoundingClientRect();
    return r.width > 10 && r.height > 10 ? (Math.round(r.width) + ' / ' + Math.round(r.height)) : null;
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
    if (block.classList.contains('sqs-block-video') || block.classList.contains('sqs-block-embed')) {
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

  function galleryItems(root) {
    var seen = {};
    var out = [];
    var items = $$('figure, .gallery-grid-item, .gallery-masonry-item, .gallery-slideshow-item, .gallery-reel-item, .gallery-fullscreen-slideshow-item, .gallery-strips-item, .slide', root);
    if (!items.length) items = [root];
    items.forEach(function (item) {
      var img = $('img', item);
      var url = imageUrl(img);
      if (!url) return;
      var key = url.split('?')[0];
      if (seen[key]) return;   // slideshows clone slides for looping
      seen[key] = true;
      var cap = $('figcaption, .gallery-caption, .gallery-caption-content, .image-caption', item);
      var vEl = item.hasAttribute && item.hasAttribute('data-video-url') ? item : $('[data-video-url]', item);
      var videoLink = vEl ? vEl.getAttribute('data-video-url') : '';
      out.push({ type: 'image', url: url, alt: img.alt, focal: img.getAttribute('data-image-focal-point'), caption: cap, videoUrl: videoLink });
    });
    return out;
  }

  function isGallerySection(section) {
    if (section.classList.contains('gallery-section')) return true;
    return !$('.sqs-block', section) && !!$('[class*="gallery-grid"], [class*="gallery-masonry"], [class*="gallery-slideshow"], [class*="gallery-reel"], [class*="gallery-strips"], [class*="gallery-fullscreen"]', section);
  }

  function postFromSection(section) {
    var post = { slides: [], caption: '', meta: {} };
    if (isGallerySection(section)) {
      galleryItems(section).forEach(function (it, i) {
        if (i === 0 && it.caption) {
          var t = parseText(it.caption);
          post.caption = t.caption;
          post.meta = t.meta;
        }
        post.slides.push(it.videoUrl ? { type: isVideoUrl(it.videoUrl) ? 'video' : 'embed', url: it.videoUrl, poster: it.url } : it);
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
        texts.push(parseText($('.sqs-block-content', b) || b));
        return;
      }
      mediaFromBlock(b).forEach(function (m) { post.slides.push(m); });
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
  function Carousel(opts, posts, mount, key) {
    this.o = opts;
    this.posts = posts;
    this.key = key;
    this.countTargets = [];
    this.root = el('div', 'igc');
    this.build();
    mount(this.root);
  }

  Carousel.prototype.build = function () {
    var o = this.o, root = this.root, self = this;
    root.setAttribute('role', 'region');
    root.setAttribute('aria-roledescription', 'carousel');
    root.setAttribute('aria-label', (o.account ? o.account + ' ' : '') + 'posts');
    root.setAttribute('data-theme', o.theme);
    root.setAttribute('data-heart-animation', reduceMotion ? 'none' : o.heartAnimation);
    root.setAttribute('data-caption-expand', String(!!o.captionExpand));
    root.style.setProperty('--igc-ratio', o._ratio || '4 / 5');
    root.style.setProperty('--igc-per-view', o.perView);
    root.style.setProperty('--igc-per-view-tablet', o.perViewTablet);
    root.style.setProperty('--igc-per-view-mobile', o.perViewMobile);
    root.style.setProperty('--igc-caption-lines', o.captionLines);
    if (this.posts.length < o.perView) root.setAttribute('data-centered', 'true');

    var vp = this.viewport = el('div', 'igc-viewport');
    vp.tabIndex = 0;
    this.posts.forEach(function (p, i) { vp.appendChild(self.renderPost(p, i)); });
    root.appendChild(vp);

    this.prevBtn = el('button', 'igc-arrow igc-arrow--prev', ICON.prev);
    this.nextBtn = el('button', 'igc-arrow igc-arrow--next', ICON.next);
    this.prevBtn.type = this.nextBtn.type = 'button';
    this.prevBtn.setAttribute('aria-label', 'Previous post');
    this.nextBtn.setAttribute('aria-label', 'Next post');
    this.prevBtn.addEventListener('click', function () { self.step(-1); });
    this.nextBtn.addEventListener('click', function () { self.step(1); });
    root.appendChild(this.prevBtn);
    root.appendChild(this.nextBtn);

    vp.addEventListener('scroll', function () { self.queue(); }, { passive: true });
    window.addEventListener('resize', function () { self.queue(); });
    vp.addEventListener('keydown', function (e) {
      if (e.target !== vp) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); self.step(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); self.step(-1); }
    });
    this.observe();
    setTimeout(function () { self.update(); }, 0);
  };

  Carousel.prototype.queue = function () {
    var self = this;
    if (this._raf) return;
    this._raf = requestAnimationFrame(function () { self._raf = 0; self.update(); });
  };

  Carousel.prototype.update = function () {
    var vp = this.viewport;
    var max = vp.scrollWidth - vp.clientWidth;
    this.prevBtn.disabled = vp.scrollLeft <= 2;
    this.nextBtn.disabled = vp.scrollLeft >= max - 2;
  };

  Carousel.prototype.step = function (dir) {
    var vp = this.viewport;
    var card = vp.children[0];
    if (!card) return;
    var gap = parseFloat(getComputedStyle(vp).columnGap) || 0;
    vp.scrollBy({ left: dir * (card.getBoundingClientRect().width + gap), behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  Carousel.prototype.renderPost = function (p, index) {
    var o = this.o, self = this;
    var m = p.meta || {};
    var account = m.account || o.account || '';
    var avatar = m.avatar || o.avatar || '';
    var profile = m.profile || o.profile || '';
    var loc = m.location || o.location || '';
    var postKey = this.key + ':' + hash((p.slides[0] && p.slides[0].url) || p.caption || String(index));

    var art = el('article', 'igc-post');
    art.setAttribute('aria-roledescription', 'slide');
    art.setAttribute('aria-label', 'Post ' + (index + 1) + ' of ' + this.posts.length);

    /* header */
    var head = el('header', 'igc-head');
    var av = el('div', 'igc-avatar');
    av.setAttribute('data-ring', String(!!o.avatarRing));
    av.innerHTML = avatar ? '<img src="' + esc(avatar) + '" alt="" loading="lazy">' : '<span>' + esc(account.charAt(0) || '•') + '</span>';
    var who = el('div', 'igc-who');
    var nameTag = profile ? 'a' : 'span';
    who.innerHTML = '<' + nameTag + ' class="igc-account"' + (profile ? ' href="' + esc(profile) + '" target="_blank" rel="noopener"' : '') + '>' +
      esc(account) + (o.verified ? ICON.verified : '') + '</' + nameTag + '>' +
      (loc ? '<span class="igc-location">' + esc(loc) + '</span>' : '');
    var more = el('button', 'igc-more', ICON.more);
    more.type = 'button';
    more.setAttribute('aria-label', 'More options');
    more.tabIndex = -1;
    head.appendChild(av);
    head.appendChild(who);
    head.appendChild(more);
    art.appendChild(head);

    /* media */
    var media = el('div', 'igc-media');
    var track = el('div', 'igc-media-track');
    var hasVideo = false;
    p.slides.forEach(function (s, i) {
      var slide = el('div', 'igc-slide');
      slide.setAttribute('aria-label', (i + 1) + ' of ' + p.slides.length);
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

    var counter = null, dots = null, innerPrev = null, innerNext = null;
    if (n > 1) {
      if (o.showCounter) { counter = el('span', 'igc-counter', '1/' + n); media.appendChild(counter); }
      innerPrev = el('button', 'igc-inner-arrow igc-inner-arrow--prev', ICON.prev);
      innerNext = el('button', 'igc-inner-arrow igc-inner-arrow--next', ICON.next);
      innerPrev.type = innerNext.type = 'button';
      innerPrev.setAttribute('aria-label', 'Previous photo');
      innerNext.setAttribute('aria-label', 'Next photo');
      media.appendChild(innerPrev);
      media.appendChild(innerNext);
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
    var burst = el('div', 'igc-burst', ICON.burst);
    media.appendChild(burst);
    art.appendChild(media);

    /* actions */
    var actions = el('div', 'igc-actions');
    var like = el('button', 'igc-action igc-like', ICON.heart);
    like.type = 'button';
    like.setAttribute('aria-label', 'Like');
    like.setAttribute('aria-pressed', 'false');
    var comment = el(m.link ? 'a' : 'button', 'igc-action igc-comment', ICON.comment);
    if (m.link) { comment.href = m.link; comment.target = '_blank'; comment.rel = 'noopener'; } else comment.type = 'button';
    comment.setAttribute('aria-label', 'Comment');
    if (m.comments) comment.insertAdjacentHTML('beforeend', '<span>' + esc(m.comments) + '</span>');
    var repost = el('button', 'igc-action igc-repost', ICON.repost);
    repost.type = 'button';
    repost.setAttribute('aria-label', 'Repost');
    var share = el('button', 'igc-action igc-share', ICON.share);
    share.type = 'button';
    share.setAttribute('aria-label', 'Share');
    var save = el('button', 'igc-action igc-save', ICON.save);
    save.type = 'button';
    save.setAttribute('aria-label', 'Save');
    save.setAttribute('aria-pressed', 'false');
    [like, comment, repost, share].forEach(function (b) { actions.appendChild(b); });

    if (n > 1) {
      dots = el('div', 'igc-dots');
      dots.setAttribute('role', 'tablist');
      for (var d = 0; d < n; d++) {
        var dot = el('button', 'igc-dot');
        dot.type = 'button';
        dot.setAttribute('aria-label', 'Show photo ' + (d + 1) + ' of ' + n);
        dot.setAttribute('aria-current', d === 0 ? 'true' : 'false');
        (function (i) { dot.addEventListener('click', function () { goSlide(i); }); })(d);
        dots.appendChild(dot);
      }
      actions.appendChild(dots);
    }
    actions.appendChild(save);
    art.appendChild(actions);

    /* body */
    var body = el('div', 'igc-body');
    var count = parseCount(m.likes);
    var countEl = null;
    if (o.showLikes && count) {
      var likesRow = el('div', 'igc-likes');
      countEl = el('span', 'igc-count');
      countEl.innerHTML = '<span>' + formatCount(o.countUp && !reduceMotion ? 0 : count.n, count.compact) + '</span>';
      countEl.setAttribute('data-target', count.n);
      likesRow.appendChild(countEl);
      likesRow.appendChild(document.createTextNode(count.n === 1 ? ' like' : ' likes'));
      body.appendChild(likesRow);
      if (o.countUp && !reduceMotion) this.countTargets.push({ el: countEl, n: count.n, compact: count.compact });
    }
    if (p.caption) {
      var cap = el('p', 'igc-caption');
      cap.innerHTML = (account ? '<b>' + esc(account) + '</b>' : '') + esc(p.caption).replace(/\n/g, ' ');
      if (o.captionExpand) cap.addEventListener('click', function () { cap.classList.toggle('is-open'); });
      body.appendChild(cap);
    }
    if (o.showDate && m.date) body.appendChild(el('div', 'igc-meta', esc(m.date)));
    art.appendChild(body);

    /* ---- behaviour ---- */
    var current = 0;
    function goSlide(i) {
      i = Math.max(0, Math.min(n - 1, i));
      track.scrollTo({ left: i * track.clientWidth, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
    function syncSlide() {
      var i = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
      if (i === current && track._igcSynced) return;
      track._igcSynced = true;
      current = i;
      if (counter) counter.textContent = (i + 1) + '/' + n;
      if (dots) $$('.igc-dot', dots).forEach(function (dd, k) {
        dd.setAttribute('aria-current', k === i ? 'true' : 'false');
        dd.setAttribute('data-far', Math.abs(k - i) > 2 ? 'true' : 'false');
      });
      if (innerPrev) innerPrev.disabled = i === 0;
      if (innerNext) innerNext.disabled = i === n - 1;
      self.playVisible(track);
    }
    var raf = 0;
    track.addEventListener('scroll', function () {
      if (raf) return;
      raf = requestAnimationFrame(function () { raf = 0; syncSlide(); });
    }, { passive: true });
    if (innerPrev) innerPrev.addEventListener('click', function () { goSlide(current - 1); });
    if (innerNext) innerNext.addEventListener('click', function () { goSlide(current + 1); });
    setTimeout(syncSlide, 0);

    var liked = o.rememberLikes && store(postKey + ':like') === '1';
    function setLiked(on, animate) {
      if (on === liked && animate) return;
      var was = liked;
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
      if (countEl && was !== on) {
        var target = +countEl.getAttribute('data-target') + (on ? 1 : -1);
        countEl.setAttribute('data-target', target);
        self.setCount(countEl, target, count.compact, animate ? (on ? 'up' : 'down') : null);
      }
    }
    if (liked) {
      liked = false;
      setLiked(true, false);
    }
    like.addEventListener('click', function () { setLiked(!liked, true); });

    if (o.doubleTapLike) {
      var lastTap = 0;
      media.addEventListener('dblclick', function (e) { e.preventDefault(); heartBurst(); });
      media.addEventListener('touchend', function (e) {
        if (e.target.closest('button, a')) return;
        var now = Date.now();
        if (now - lastTap < 300) { e.preventDefault(); heartBurst(); lastTap = 0; } else lastTap = now;
      });
    }
    function heartBurst() {
      setLiked(true, true);
      if (reduceMotion) return;
      burst.classList.remove('is-on');
      void burst.offsetWidth;
      burst.classList.add('is-on');
    }

    var saved = o.rememberLikes && store(postKey + ':save') === '1';
    function setSaved(on) {
      saved = on;
      save.classList.toggle('is-saved', on);
      save.setAttribute('aria-pressed', String(on));
      if (o.rememberLikes) store(postKey + ':save', on ? '1' : null);
    }
    if (saved) setSaved(true);
    save.addEventListener('click', function () { setSaved(!saved); });
    repost.addEventListener('click', function () { repost.classList.toggle('is-reposted'); });
    share.addEventListener('click', function () {
      var url = m.link ? new URL(m.link, location.href).href : location.href.split('#')[0] + (self.o._anchor ? '#' + self.o._anchor : '');
      if (navigator.share) { navigator.share({ title: account, text: p.caption, url: url }).catch(function () {}); return; }
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () {
        share.setAttribute('aria-label', 'Link copied');
        share.style.opacity = '0.5';
        setTimeout(function () { share.style.opacity = ''; share.setAttribute('aria-label', 'Share'); }, 1200);
      });
    });

    return art;
  };

  Carousel.prototype.setCount = function (countEl, n, compact, dir) {
    var txt = formatCount(n, compact);
    var oldSpan = countEl.lastElementChild;
    if (!dir || this.o.likeAnimation !== 'roll' || reduceMotion) {
      countEl.innerHTML = '<span>' + txt + '</span>';
      return;
    }
    $$('span', countEl).forEach(function (s) { if (s !== oldSpan) s.remove(); });
    var neu = el('span', 'is-in-' + dir, txt);
    oldSpan.className = 'is-out-' + dir;
    countEl.appendChild(neu);
    setTimeout(function () { if (oldSpan.parentNode) oldSpan.remove(); neu.className = ''; }, 380);
  };

  Carousel.prototype.observe = function () {
    var self = this;
    if (!('IntersectionObserver' in window)) {
      this.countTargets.forEach(function (t) { t.el.innerHTML = '<span>' + formatCount(t.n, t.compact) + '</span>'; });
      $$('.igc-media-track', this.root).forEach(function (t) { self.playVisible(t); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var track = $('.igc-media-track', e.target);
        if (e.isIntersecting) {
          self.playVisible(track);
          var countEl = $('.igc-count', e.target);
          self.countTargets.forEach(function (t) {
            if (t.el !== countEl || t.done) return;
            t.done = true;
            self.countUp(t);
          });
        } else {
          $$('video', track).forEach(function (v) { v.pause(); });
        }
      });
    }, { threshold: 0.35 });
    $$('.igc-post', this.root).forEach(function (p) { io.observe(p); });
  };

  Carousel.prototype.countUp = function (t) {
    var start = null, dur = 1400;
    function frame(ts) {
      if (!start) start = ts;
      var k = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - k, 3);
      var target = +t.el.getAttribute('data-target');
      t.el.innerHTML = '<span>' + formatCount(Math.round(target * eased), t.compact) + '</span>';
      if (k < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  };

  Carousel.prototype.playVisible = function (track) {
    if (!track || !this.o.autoplayVideo) return;
    var w = Math.max(1, track.clientWidth);
    var i = Math.round(track.scrollLeft / w);
    var post = track.closest('.igc-post');
    var onScreen = post && (function () {
      var r = post.getBoundingClientRect(), vr = this.viewport.getBoundingClientRect();
      return r.right > vr.left + 20 && r.left < vr.right - 20 && r.bottom > 0 && r.top < window.innerHeight;
    }).call(this);
    $$('.igc-slide', track).forEach(function (s, k) {
      $$('video', s).forEach(function (v) {
        if (k === i && onScreen) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
        else v.pause();
      });
    });
  };

  /* --------------------------------------------------------- Bootstrap */
  var instances = [];

  function globalConfig() { return window.IGCarouselConfig || {}; }

  function optionsFor(anchorId, codeNode) {
    var g = globalConfig();
    var o = extend({}, DEFAULTS, g);
    if (anchorId && g.carousels && g.carousels[anchorId]) extend(o, g.carousels[anchorId]);
    var tok = anchorId && /-(\d+(?:\.\d+)?x\d+(?:\.\d+)?)$/.exec(anchorId);
    if (tok) o.aspect = tok[1].replace('x', ':');
    extend(o, dataOptions(codeNode));
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

  function buildTarget(t) {
    var section = t.section;
    var anchorId = anchorIdOf(section);
    var o = optionsFor(anchorId, t.code);
    var list = !t.code && $('.user-items-list', section);
    var posts, mount, measureNode, hidden = [];

    if (list) {
      measureNode = $('.user-items-list-carousel__media-container, .list-image, .user-items-list-simple__media, .list-item img', list);
      if (o.aspect === 'native') o._ratio = measureRatio(measureNode);
      posts = postsFromList(list);
      mount = function (node) { list.parentNode.insertBefore(node, list.nextSibling); };
      hidden.push(list);
    } else {
      var count = o.sections === 'auto' ? 'auto' : Math.max(1, parseInt(o.sections, 10) || 1);
      var sources = nextSections(section, count);
      if (!sources.length) return;
      if (o.aspect === 'native') o._ratio = measureRatio($('.gallery-grid-item, .gallery-masonry-item, .sqs-block-image .image-block-wrapper, figure', sources[0]));
      posts = sources.map(postFromSection).filter(function (p) { return p.slides.length; });
      if (t.code) {
        mount = function (node) { t.code.parentNode.insertBefore(node, t.code.nextSibling); };
      } else {
        var content = $('.content-wrapper > .content', section) || $('.content-wrapper', section) || section;
        mount = function (node) {
          node.style.marginTop = 'var(--igc-section-spacing, 2rem)';
          content.appendChild(node);
        };
      }
      if (o.hideSource) hidden = hidden.concat(sources);
    }
    if (!posts.length) return;
    if (!o._ratio) o._ratio = ratioOf(o.aspect) || '4 / 5';

    var carousel = new Carousel(o, posts, mount, anchorId || ('igc-' + instances.length));
    hidden.forEach(function (h) { h.classList.add('igc-source-hidden'); });
    instances.push({ carousel: carousel, hidden: hidden, section: section });
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
