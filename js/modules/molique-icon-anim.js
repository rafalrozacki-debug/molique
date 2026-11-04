/**
 * molique - animated Phosphor icons (opt-in module)
 *
 * Icons: Phosphor Icons by Helena Zhang and Tobias Fried
 * (https://phosphoricons.com, MIT License, (c) Phosphor Icons).
 * Styles: css/molique-style-icon-anim.css (link it yourself, it is opt-in).
 * This file is loaded by the autoloader in molique-script.js when the page
 * contains .icon-anim - never include it by hand.
 *
 * WHAT IT DOES, and nothing more:
 *
 * 1. INLINES the icon. <svg class="icon icon-anim"><use href="sprite.svg#ph-bell">
 *    renders the symbol in a closed shadow tree, out of reach of CSS. The
 *    module copies the symbol's shapes into the <svg> (from the same
 *    document, or the sprite file fetched once per URL) and removes <use>.
 *    Copying is a whitelist - only basic shapes and their geometry and paint
 *    attributes - so a sprite can never smuggle a <script>, an event
 *    attribute or a <foreignObject> into the page. A pasted inline SVG is
 *    handled the same way, minus the copying.
 *
 * 2. NAMES the icon: data-icon="bell" from the symbol id (ph-bell,
 *    ph-bell--bold) or, for Phosphor's web font, from the ph-bell class.
 *    Set data-icon yourself on a pasted SVG - the module cannot guess it.
 *
 * 3. NUMBERS the parts: data-part="1".."n" in source order, --icon-part
 *    (0-based, for staggering) and pathLength="1" on strokes (for drawing).
 *    The duotone background (an element with opacity and no stroke) is
 *    data-layer, outside the count, so numbering matches the other weights.
 *    data-icon-parts="stroke" tells the CSS the parts are there;
 *    "solid" (fill weight - no strokes at all) keeps part presets off.
 *
 * 4. TRIGGERS the CSS cannot express alone:
 *    .icon-anim-tap   adds .is-tapped on press and keeps it until the
 *                     animation has played to the end (a quick tap on a phone
 *                     would otherwise cut it after 100 ms); with a loop,
 *                     until release.
 *    .icon-anim-view  adds .is-in-view when it scrolls in. Once by default;
 *                     data-icon-anim-once="false" replays on every entry,
 *                     data-icon-anim-margin="0px 0px -20% 0px" is the
 *                     IntersectionObserver rootMargin.
 *    data-icon-anim-loop-delay="600"  (on the icon or an ancestor) pauses a
 *                     looping icon for that many ms after every lap.
 *    A looping icon outside the viewport gets .is-offscreen (paused).
 *
 * Icons added later (a toast, a modal filled by fetch) are picked up by a
 * MutationObserver. API: window.moliqueIconAnim.hydrate(root) and
 * .play(element) - the latter runs one lap, like adding .icon-anim-play and
 * removing it at the end.
 */

(() => {
  if (window.moliqueIconAnim) return;

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const SHAPES = new Set(['path', 'line', 'polyline', 'polygon', 'circle', 'ellipse', 'rect', 'g']);
  const ATTRS = [
    'd', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'rx', 'ry', 'width', 'height', 'points',
    'fill', 'fill-rule', 'clip-rule', 'opacity', 'fill-opacity', 'stroke', 'stroke-width',
    'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'transform'
  ];
  const WEIGHTS = new Set(['thin', 'light', 'regular', 'bold', 'fill', 'duotone']);
  const sprites = new Map(); // absolute sprite URL -> Promise<Document|null>

  /* ---------- helpers ---------- */

  // Phosphor puts an invisible 256x256 <rect fill="none"/> into every raw
  // icon as a bounding box - not a part, and it must not be counted.
  const isBoundingBox = (el) =>
    el.localName === 'rect' &&
    el.getAttribute('fill') === 'none' &&
    !el.hasAttribute('stroke');

  const hasStroke = (el) => {
    const s = el.getAttribute('stroke');
    return s !== null && s !== 'none';
  };

  function cleanCopy(src) {
    if (!SHAPES.has(src.localName)) return null;
    const el = document.createElementNS(SVG_NS, src.localName);
    for (const name of ATTRS) {
      const v = src.getAttribute(name);
      if (v !== null) el.setAttribute(name, v);
    }
    if (src.localName === 'g') {
      for (const child of src.children) {
        const c = cleanCopy(child);
        if (c) el.appendChild(c);
      }
    }
    return el;
  }

  function loadSprite(url) {
    if (!sprites.has(url)) {
      sprites.set(
        url,
        fetch(url, { credentials: 'same-origin' })
          .then((r) => (r.ok ? r.text() : null))
          .then((text) => (text ? new DOMParser().parseFromString(text, 'image/svg+xml') : null))
          .catch(() => null)
      );
    }
    return sprites.get(url);
  }

  // "ph-bell--bold" -> { name: "bell", weight: "bold" }
  function parseSymbolId(id) {
    const m = /^ph-([a-z0-9-]+?)(?:--([a-z]+))?$/.exec(id);
    return m ? { name: m[1], weight: m[2] || '' } : null;
  }

  /* ---------- 2 + 3: name and number ---------- */

  function numberParts(svg) {
    let index = 0;
    let strokes = 0;
    // A copy, not the live collection: removing the bounding box while
    // iterating svg.children would skip the element right after it.
    for (const el of [...svg.children]) {
      if (!SHAPES.has(el.localName)) continue;
      if (isBoundingBox(el)) {
        el.remove();
        continue;
      }
      const stroked = hasStroke(el) || [...el.querySelectorAll('*')].some(hasStroke);
      if (!stroked && el.hasAttribute('opacity')) {
        el.setAttribute('data-layer', '');
        continue;
      }
      if (stroked) {
        strokes++;
        if (el.localName !== 'g') el.setAttribute('pathLength', '1');
      }
      index++;
      el.setAttribute('data-part', String(index));
      el.style.setProperty('--icon-part', String(index - 1));
    }
    if (index) svg.setAttribute('data-icon-parts', strokes ? 'stroke' : 'solid');
  }

  function nameFromFont(el) {
    for (const c of el.classList) {
      const m = /^ph-([a-z0-9-]+)$/.exec(c);
      if (m && !WEIGHTS.has(m[1])) return m[1];
    }
    return '';
  }

  /* ---------- 1: inline ---------- */

  async function hydrate(icon) {
    if (icon.hasAttribute('data-icon-hydrated')) return;
    icon.setAttribute('data-icon-hydrated', '');

    if (icon.localName !== 'svg') {
      const name = nameFromFont(icon);
      if (name && !icon.dataset.icon) icon.dataset.icon = name;
      return;
    }

    const use = icon.querySelector(':scope > use');
    if (!use) {
      numberParts(icon);
      return;
    }

    const href = use.getAttribute('href') || use.getAttribute('xlink:href') || '';
    const hash = href.indexOf('#');
    if (hash < 0) return;
    const id = href.slice(hash + 1);
    const parsed = parseSymbolId(id);
    // Named before the fetch: the root animation works right away, even if
    // the sprite never arrives.
    if (parsed && !icon.dataset.icon) icon.dataset.icon = parsed.name;
    if (parsed && parsed.weight && !icon.dataset.iconWeight) icon.dataset.iconWeight = parsed.weight;

    let symbol = null;
    const file = href.slice(0, hash);
    if (!file) {
      symbol = document.getElementById(id);
    } else {
      const doc = await loadSprite(new URL(file, document.baseURI).href);
      symbol = doc ? doc.getElementById(id) : null;
    }
    if (!symbol || !use.isConnected) return;

    const frag = document.createDocumentFragment();
    for (const child of symbol.children) {
      const copy = cleanCopy(child);
      if (copy) frag.appendChild(copy);
    }
    if (!frag.childNodes.length) return;
    if (!icon.hasAttribute('viewBox') && symbol.hasAttribute('viewBox')) {
      icon.setAttribute('viewBox', symbol.getAttribute('viewBox'));
    }
    use.replaceWith(frag);
    numberParts(icon);
  }

  /* ---------- 4: triggers ---------- */

  const viewObservers = new Map(); // rootMargin -> IntersectionObserver

  function observeView(el) {
    if (!('IntersectionObserver' in window)) {
      el.classList.add('is-in-view');
      return;
    }
    const margin = el.dataset.iconAnimMargin || '0px';
    if (!viewObservers.has(margin)) {
      viewObservers.set(
        margin,
        new IntersectionObserver(
          (entries, io) => {
            for (const e of entries) {
              const once = e.target.dataset.iconAnimOnce !== 'false';
              if (e.isIntersecting) {
                e.target.classList.add('is-in-view');
                if (once) io.unobserve(e.target);
              } else if (!once) {
                e.target.classList.remove('is-in-view');
              }
            }
          },
          { rootMargin: margin }
        )
      );
    }
    viewObservers.get(margin).observe(el);
  }

  const offscreenObserver =
    'IntersectionObserver' in window
      ? new IntersectionObserver((entries) => {
          for (const e of entries) e.target.classList.toggle('is-offscreen', !e.isIntersecting);
        })
      : null;

  // The loop modifier may sit on the trigger, on the icon or in between,
  // so ask the icon itself what it inherited.
  const isLooping = (el) => {
    const icon = el.matches('.icon-anim') ? el : el.querySelector('.icon-anim');
    return !!icon && getComputedStyle(icon).getPropertyValue('--icon-anim-iterations').trim() === 'infinite';
  };

  // Restart even if the same trigger is still on: drop the class, let the
  // style flush (getBoundingClientRect works on SVG and HTML alike), put it
  // back - a fresh CSS animation, from frame 0.
  function restart(el, cls) {
    el.classList.remove(cls);
    el.getBoundingClientRect();
    el.classList.add(cls);
  }

  // Resolves when every icon animation under `el` has finished or been
  // cancelled. Only icon animations: a trigger can be a button with its own
  // endless spinner inside, which would never let the promise settle.
  function whenDone(el) {
    const running = el.getAnimations ? el.getAnimations({ subtree: true }) : [];
    const own = running.filter((a) => {
      const t = a.effect && a.effect.target;
      return t && t.closest && t.closest('.icon-anim');
    });
    return Promise.all(own.map((a) => a.finished.catch(() => null)));
  }

  function tap(el) {
    restart(el, 'is-tapped');
    const token = (el._iconAnimTap = (el._iconAnimTap || 0) + 1);
    if (isLooping(el)) return; // released by pointerup below
    whenDone(el).then(() => {
      if (el._iconAnimTap === token) el.classList.remove('is-tapped');
    });
  }

  function play(el) {
    restart(el, 'icon-anim-play');
    whenDone(el).then(() => el.classList.remove('icon-anim-play'));
  }

  function bindDocument() {
    document.addEventListener('pointerdown', (e) => {
      const t = e.target.closest && e.target.closest('.icon-anim-tap');
      if (t) tap(t);
    });
    const release = (e) => {
      const t = e.target.closest && e.target.closest('.icon-anim-tap.is-tapped');
      if (t && isLooping(t)) t.classList.remove('is-tapped');
    };
    document.addEventListener('pointerup', release);
    document.addEventListener('pointercancel', release);
    document.addEventListener('keydown', (e) => {
      if (e.repeat || (e.key !== 'Enter' && e.key !== ' ')) return;
      const t = e.target.closest && e.target.closest('.icon-anim-tap');
      if (t) tap(t);
    });

    // Pause between laps. The event lands on frame 0 of the next lap, and
    // frame 0 is not always the resting icon: a tick that draws itself is not
    // drawn yet, confetti is still folded up. Holding there would blank the
    // icon for the whole pause, so the animation is taken off the element
    // instead, which hands it back to its resting style. Nothing is kept to
    // revive later: when the pause ends, CSS starts a new animation, or does
    // not if the trigger is gone, so a stale one can never outlive its trigger.
    document.addEventListener('animationiteration', (e) => {
      const target = e.target;
      const holder = target.closest && target.closest('[data-icon-anim-loop-delay]');
      if (!holder || !target.closest('.icon-anim')) return;
      const delay = parseInt(holder.dataset.iconAnimLoopDelay, 10);
      if (!(delay > 0) || !target.getAnimations) return;
      const anim = target.getAnimations().find((a) => a.animationName === e.animationName);
      if (!anim) return;
      const lead = anim.effect.getComputedTiming().delay;
      target.style.animationName = 'none';
      setTimeout(() => nextLap(target, e.animationName, lead), delay);
    });
  }

  // `lead` is the stagger, already served before the first lap. Serving it
  // again on every lap would pull the parts of an icon further apart each time.
  function nextLap(target, name, lead) {
    target.style.removeProperty('animation-name');
    const fresh = target.getAnimations().find((a) => a.animationName === name);
    if (fresh) fresh.currentTime = lead;
  }

  /* ---------- setup ---------- */

  function setup(el) {
    hydrate(el);
    if (offscreenObserver && el.closest('.icon-anim-loop')) offscreenObserver.observe(el);
  }

  function scan(root) {
    if (root.nodeType !== 1) return;
    const icons = root.matches('.icon-anim') ? [root] : [];
    icons.push(...root.querySelectorAll('.icon-anim'));
    icons.forEach(setup);
    const views = root.matches('.icon-anim-view') ? [root] : [];
    views.push(...root.querySelectorAll('.icon-anim-view'));
    views.forEach((v) => {
      if (v.hasAttribute('data-icon-anim-watched')) return;
      v.setAttribute('data-icon-anim-watched', '');
      observeView(v);
    });
  }

  let bound = false;

  function initIconAnim(root = document.body) {
    if (!bound) {
      bound = true;
      bindDocument();
      new MutationObserver((records) => {
        for (const r of records) r.addedNodes.forEach(scan);
      }).observe(document.body, { childList: true, subtree: true });
    }
    scan(root);
  }

  window.moliqueIconAnim = { hydrate: scan, play };
  window.initIconAnim = () => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => initIconAnim());
    } else {
      initIconAnim();
    }
  };
})();
