/**
 * molique - every Phosphor icon against the shipped icon-anim module
 *
 * Run with:  npm run test:icon-catalog
 * Compile the CSS first (npm run build does not do it, see CLAUDE.md).
 *
 * tools/tests/icon-anim.test.js checks how the module behaves on a handful of
 * shapes. This one asks the opposite question: what happens to each of the 1512
 * icons. Both bugs that shaped it were invisible on a sample: the transform
 * attribute threw 57 icons out of their box and none of the 118 tested ones had
 * it, and a family rule silently added itself to presets it was never meant for.
 *
 * Needs a real browser (Playwright is not a dependency of this repo, without it
 * the test prints SKIP). The light weight comes from img/icons-anim-all.svg. The
 * other five come from the raw Phosphor files (MOLIQUE_PHOSPHOR_DIR, as in
 * tools/gen-icon-sprite.js); without them only light is checked.
 *
 *   MOLIQUE_TEST_CSS=<file>   run against another stylesheet (mutations, or the
 *                             CSS of an older version)
 *   --update-presets          rewrite the presets snapshot. Only for a change you
 *                             meant to make: this file is what stops a family
 *                             from leaking into a preset.
 *   --update-neutral          rewrite the list of neutral icons, after reading it.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), 'utf8');

const CSS_FILE = process.env.MOLIQUE_TEST_CSS || path.join(ROOT, 'css', 'molique-style-icon-anim.css');
const CSS = fs.readFileSync(CSS_FILE, 'utf8');
const JS = read('js', 'modules', 'molique-icon-anim.js');
const SNAPSHOT = path.join(ROOT, 'tools', 'tests', 'icon-anim-presets.snapshot.json');
const NEUTRAL = path.join(ROOT, 'tools', 'tests', 'icon-anim-neutral.txt');
const RAW = process.env.MOLIQUE_PHOSPHOR_DIR || 'C:/Praca/Materiały/Ikony/phosphor-icons/SVGs';
const UPDATE_PRESETS = process.argv.includes('--update-presets');
const UPDATE_NEUTRAL = process.argv.includes('--update-neutral');

let chromium;
try {
  ({ chromium } = createRequire(import.meta.url)('playwright'));
} catch {
  console.log('SKIP  playwright is not installed - npm i -D playwright to run this test');
  process.exit(0);
}

let failed = 0;
const check = (name, ok, detail = '') => {
  if (!ok) failed++;
  console.log((ok ? 'PASS  ' : 'FAIL  ') + name + (detail ? '   ' + detail : ''));
};

const names = JSON.parse(read('tools', 'icon-catalog.data.json')).map((icon) => icon.name);

/* ---------- the sprite: light from the repo, the rest from the raw files ---------- */

const symbolOf = (id, raw) => {
  const viewBox = /viewBox="([^"]+)"/.exec(raw)[1];
  const inner = raw
    .replace(/^<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
    .replace(/<rect[^>]*fill="none"[^>]*\/>/, '')
    .trim();
  return `<symbol id="${id}" viewBox="${viewBox}">${inner}</symbol>`;
};

function rawFile(name, weight) {
  const candidates = [`${name}-${weight}.svg`, `${name}.svg`];
  if (name === 'book-open-user') candidates.push(`book-user-${weight}.svg`, 'book-user.svg');
  for (const file of candidates) {
    const full = path.join(RAW, weight, file);
    if (fs.existsSync(full)) return fs.readFileSync(full, 'utf8');
  }
  throw new Error(`no source file for ${name} (${weight})`);
}

const OTHER_WEIGHTS = fs.existsSync(RAW) ? ['thin', 'regular', 'bold', 'duotone', 'fill'] : [];
const WEIGHTS = ['light', ...OTHER_WEIGHTS];
const STROKE_WEIGHTS = WEIGHTS.filter((w) => w !== 'fill');

const light = read('img', 'icons-anim-all.svg').replace(/id="ph-([a-z0-9-]+)"/g, 'id="ph-$1--light"');
const others = OTHER_WEIGHTS.flatMap((w) => names.map((n) => symbolOf(`ph-${n}--${w}`, rawFile(n, w))));
const SPRITE = light.replace('</svg>', others.join('') + '</svg>').replace(' style="display:none"', '');

const PAGE = `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style>
<style>body{margin:0}svg{width:32px;height:32px;fill:currentColor}</style></head><body>
${WEIGHTS.flatMap((w) => names.map((n) => `<svg class="icon-anim" data-w="${w}"><use href="sprite.svg#ph-${n}--${w}"></use></svg>`)).join('')}
</body></html>`;

/* ---------- which rule should win: the hard cases ---------- */

// Each of these got it wrong at some point of the design, or is one word away
// from a family it must not join.
const EXPECT = {
  fire: 'Flicker', 'fire-truck': 'Cart', 'fire-extinguisher': 'Pop',
  baseball: 'Bounce', 'baseball-cap': 'Pop', 'football-helmet': 'Pop',
  tree: 'Sway', 'tree-structure': 'Pop', 'tree-view': 'Pop',
  phone: 'Ring', 'phone-x': 'Pop', 'phone-disconnect': 'Pop', 'phone-pause': 'Pop',
  'bell-z': 'Pop', 'bell-slash': 'Axis',
  star: 'Tada', 'star-of-david': 'Pop', 'star-and-crescent': 'Pop',
  church: 'Pop', mosque: 'Pop', cross: 'Pop', 'hands-praying': 'Pop', skull: 'Pop', wheelchair: 'Pop',
  car: 'Cart', 'car-battery': 'Pop', cardholder: 'Pop', cards: 'Flip',
  'github-logo': 'Pop', 'x-logo': 'Pop', 'x-square': 'Press',
  shield: 'Pop', 'shield-check': 'Press',
  gear: 'Spin', 'sun-dim': 'Spin', 'sun-horizon': 'Float', windmill: 'Sway', globe: 'Flip',
  'cloud-rain': 'Drift', 'cloud-slash': 'Axis', 'eye-closed': 'Blink', 'eye-slash': 'Axis', eyedropper: 'Write',
  key: 'Ring', 'key-return': 'Nudge', keyboard: 'Press', keyhole: 'Pop',
  'file-arrow-up': 'Nudge', 'file-pdf': 'PageTurn', 'hand-arrow-up': 'Nudge', 'hand-waving': 'Wiggle',
  'user-plus': 'Bounce', 'user-focus': 'Zoom', 'person-simple-run': 'Nudge',
  'cube-focus': 'Zoom', 'cube-transparent': 'Pop',
  'arrows-in': 'Zoom', 'arrows-out': 'Zoom', 'arrows-left-right': 'Axis', 'caret-up-down': 'Axis',
  'hourglass-high': 'Turn', 'text-b': 'Pop', 'number-one': 'Pop',
};

/* ---------- pattern liveness: read straight from the shipped rules ---------- */

const pattern = (atom) => {
  const m = /^\[data-icon([|^$]?)=["']?([a-z0-9-]+)["']?\]$/.exec(atom.trim());
  if (!m) return null;
  const [, op, value] = m;
  if (op === '|') return (n) => n === value || n.startsWith(value + '-');
  if (op === '^') return (n) => n.startsWith(value);
  if (op === '$') return (n) => n.endsWith(value);
  return (n) => n === value;
};

function familyRules() {
  const rules = [];
  const re = /\.icon-anim:is\(([^{}]*?)\):not\(\[data-icon-anim\]\)\s*\{[^{}]*?--_icon-anim-name:\s*(\w+)/g;
  for (const m of CSS.matchAll(re)) rules.push({ atoms: m[1].split(','), name: m[2] });
  return rules;
}

/* ---------- run ---------- */

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('http://icons.test/**', (route) => {
    if (route.request().url().endsWith('/sprite.svg')) {
      return route.fulfill({ contentType: 'image/svg+xml; charset=utf-8', body: SPRITE });
    }
    return route.fulfill({ contentType: 'text/html; charset=utf-8', body: PAGE });
  });
  await page.goto('http://icons.test/', { waitUntil: 'domcontentloaded' });
  await page.addScriptTag({ content: JS });
  await page.evaluate(() => window.initIconAnim());
  await page.waitForFunction(() => document.querySelectorAll('use').length === 0, null, { timeout: 120000 });

  /* At rest, no trigger: variables, and whether every shape is still inside. */
  const rest = await page.evaluate(() =>
    [...document.querySelectorAll('svg.icon-anim')].map((svg) => {
      const style = getComputedStyle(svg);
      const box = svg.getBoundingClientRect();
      const out = [...svg.querySelectorAll('[data-part],[data-layer]')].filter((el) => {
        const r = el.getBoundingClientRect();
        return r.right < box.left || r.left > box.right || r.bottom < box.top || r.top > box.bottom;
      }).length;
      return {
        name: svg.dataset.icon,
        w: svg.dataset.w,
        anim: style.getPropertyValue('--_icon-anim-name').trim(),
        x: style.getPropertyValue('--_icon-anim-x').trim(),
        y: style.getPropertyValue('--_icon-anim-y').trim(),
        px: style.getPropertyValue('--_icon-anim-part-x').trim(),
        py: style.getPropertyValue('--_icon-anim-part-y').trim(),
        origin: style.getPropertyValue('--_icon-anim-origin').trim(),
        out,
      };
    })
  );

  /* Triggered: what actually moves. */
  await page.evaluate(() => document.body.classList.add('icon-anim-play', 'icon-anim-loop'));
  await page.waitForTimeout(150);
  const { moving, overwritten } = await page.evaluate((harmless) => {
    const byIcon = new Map();
    const overwritten = [];
    for (const a of document.getAnimations()) {
      const target = a.effect && a.effect.target;
      const icon = target && target.closest('.icon-anim');
      if (!icon) continue;
      if (!byIcon.has(icon)) byIcon.set(icon, []);
      byIcon.get(icon).push(`${target === icon ? 'root' : `${target.localName}#${target.dataset.part ?? 'layer'}`}:${a.animationName}`);
      if (target !== icon && target.hasAttribute('transform') && !harmless.includes(a.animationName)) {
        overwritten.push(`${icon.dataset.icon}/${icon.dataset.w}:${a.animationName}`);
      }
    }
    return { overwritten, moving: [...document.querySelectorAll('svg.icon-anim')].map((svg) => (byIcon.get(svg) || []).sort().join(' ')) };
  }, ['iconAnimPartDraw', 'iconAnimPartDrawLoop', 'iconAnimLayerFade', 'iconAnimPartFadeLoop', 'iconAnimPartBlink']);

  check('every icon was named and inlined', rest.every((r) => r.name), `${rest.length} icons, weights: ${WEIGHTS.join(' ')}`);
  check('no page errors', errors.length === 0, errors[0] || '');

  const dead = rest.filter((_, i) => !moving[i]).map((r) => `${r.name}/${r.w}`);
  check('every icon moves when triggered', dead.length === 0, `${dead.length} still: ${dead.slice(0, 6).join(' ')}`);

  const outside = rest.filter((r) => r.out > 0).map((r) => `${r.name}/${r.w}`);
  check('no shape lies outside its icon at rest', outside.length === 0, `${outside.length}: ${outside.slice(0, 6).join(' ')}`);

  // A keyframe that sets transform replaces the transform attribute of the shape,
  // and the shape jumps away for as long as the animation runs.
  check('no keyframe overwrites a transform attribute', overwritten.length === 0, `${overwritten.length}: ${overwritten.slice(0, 5).join(' ')}`);

  const lightRows = rest.filter((r) => r.w === 'light');
  const byName = new Map(lightRows.map((r) => [r.name, r]));

  /* ---------- the hard cases ---------- */
  // Read from the fill weight: it has no parts, so the whole-icon family stays
  // visible there. In a stroke weight many of these now say "none" and move a
  // part, which is right and tells nothing about the family.
  const families = new Map(rest.filter((r) => r.w === (WEIGHTS.includes('fill') ? 'fill' : 'light')).map((r) => [r.name, r]));
  const wrong = Object.entries(EXPECT)
    .filter(([name, anim]) => {
      const actual = families.get(name).anim;
      return actual !== `iconAnim${anim}` && (WEIGHTS.includes('fill') || actual !== 'none');
    })
    .map(([name, anim]) => `${name}: ${families.get(name).anim}, expected ${anim}`);
  check('the hard cases land in the right family', wrong.length === 0, wrong.slice(0, 4).join(' | '));

  check('a narrower family does not inherit the pivot of a wider one',
    byName.get('fire').origin === '50% 100%' && byName.get('fire-truck').origin === '50% 50%',
    `${byName.get('fire').origin} / ${byName.get('fire-truck').origin}`);

  /* ---------- directions follow the name ---------- */
  const sign = (v) => (parseFloat(v || '0') > 0 ? 1 : parseFloat(v || '0') < 0 ? -1 : 0);
  const SIDE = { left: -1, right: 1 };
  const LEVEL = { up: -1, down: 1 };
  const badDirection = [];
  for (const row of lightRows) {
    if (!/^(arrow|caret)-/.test(row.name)) continue;
    const inFrame = row.anim === 'none' && /^(arrow|caret)-(circle|square)-/.test(row.name);
    if (row.anim !== 'iconAnimNudge' && !inFrame) continue;
    if (/square-(in|out)$/.test(row.name)) continue;
    const tokens = row.name.split('-');
    const bent = /^arrow-(bend|elbow|u)-/.test(row.name);
    const last = tokens.at(-1);
    const before = tokens.at(-2);
    const x = SIDE[last] ?? 0;
    const y = bent ? (LEVEL[last] ?? 0) : (LEVEL[last] ?? LEVEL[before] ?? 0);
    const [actualX, actualY] = inFrame ? [row.px, row.py] : [row.x, row.y];
    if (sign(actualX) !== x || sign(actualY) !== y) badDirection.push(`${row.name} (${actualX}, ${actualY})`);
  }
  check('arrows and carets move the way their name says', badDirection.length === 0, badDirection.slice(0, 5).join(' '));

  /* ---------- no dead patterns ---------- */
  const rules = familyRules();
  const dead_patterns = [];
  for (const rule of rules) {
    for (const atom of rule.atoms) {
      const test = pattern(atom);
      if (!test) continue;
      const caught = names.filter(test);
      // "none" is a preset that moves only parts and switched its whole-icon rule off.
      if (!caught.some((n) => [rule.name, 'none'].includes(byName.get(n).anim))) dead_patterns.push(`${atom.trim()} -> ${rule.name}`);
    }
  }
  check('every pattern of every family still decides at least one icon', dead_patterns.length === 0, dead_patterns.slice(0, 5).join(' | '));

  /* ---------- presets stay exactly as they were ---------- */
  const presets = new Set();
  for (const m of read('css', 'scss', '_icon-anim.scss').matchAll(/_(?:preset|parts)\(([^)$]*)\)/g)) {
    for (const x of m[1].matchAll(/'([a-z0-9-]+)'/g)) presets.add(x[1]);
  }
  const current = {};
  rest.forEach((row, i) => {
    if (presets.has(row.name) && STROKE_WEIGHTS.includes(row.w)) (current[row.name] ||= {})[row.w] = moving[i];
  });
  if (UPDATE_PRESETS) {
    const sorted = Object.fromEntries(Object.keys(current).sort().map((k) => [k, current[k]]));
    fs.writeFileSync(SNAPSHOT, JSON.stringify(sorted, null, 1) + '\n', 'utf8');
    console.log(`wrote ${path.relative(ROOT, SNAPSHOT)}`);
  }
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const changed = [];
  for (const [name, weights] of Object.entries(snapshot)) {
    for (const [w, signature] of Object.entries(weights)) {
      if (current[name]?.[w] !== undefined && current[name][w] !== signature) changed.push(`${name}/${w}`);
    }
  }
  check(`the ${Object.keys(snapshot).length} presets move exactly as before`, changed.length === 0, `${changed.length}: ${changed.slice(0, 6).join(' ')}`);

  /* ---------- the neutral list is a decision, not a leftover ---------- */
  const neutral = lightRows.filter((r) => r.anim === 'iconAnimPop').map((r) => r.name).sort();
  if (UPDATE_NEUTRAL) fs.writeFileSync(NEUTRAL, neutral.join('\n') + '\n', 'utf8');
  const allowed = fs.readFileSync(NEUTRAL, 'utf8').split('\n').filter(Boolean);
  const gained = neutral.filter((n) => !allowed.includes(n));
  const lost = allowed.filter((n) => !neutral.includes(n));
  check('the neutral icons are exactly the listed ones', gained.length === 0 && lost.length === 0,
    `${neutral.length} neutral${gained.length ? `, newly neutral: ${gained.slice(0, 5).join(' ')}` : ''}${lost.length ? `, no longer: ${lost.slice(0, 5).join(' ')}` : ''}`);

  /* ---------- the score ---------- */
  const count = (w) => {
    const score = { parts: 0, whole: 0, pop: 0 };
    rest.forEach((row, i) => {
      if (row.w !== w) return;
      const kinds = moving[i].split(' ');
      if (kinds.some((k) => !k.startsWith('root:') && !k.includes('#layer'))) score.parts++;
      else if (kinds.some((k) => k.startsWith('root:') && k !== 'root:iconAnimPop')) score.whole++;
      else score.pop++;
    });
    return score;
  };
  console.log(`light: ${JSON.stringify(count('light'))}${WEIGHTS.includes('fill') ? `, fill: ${JSON.stringify(count('fill'))}` : ''}`);
} catch (err) {
  check('the run reached the end', false, err.message);
} finally {
  await Promise.race([browser.close(), new Promise((resolve) => setTimeout(resolve, 3000))]);
}

console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
