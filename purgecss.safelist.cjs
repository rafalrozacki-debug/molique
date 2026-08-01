/**
 * molique - PurgeCSS safelist
 *
 * AUTO-GENERATED FILE - do not edit by hand.
 * Source: tools/gen-safelist.js   |   Regenerate with: node tools/gen-safelist.js
 * Generated: 2026-08-01
 *
 * WHY THIS EXISTS: some molique classes never appear in the HTML - they're
 * added by JS at runtime (states, carousel/lightbox/toast markup).
 * PurgeCSS can't see them and would strip them, breaking the components.
 *
 * USAGE (purgecss.config.js or postcss.config.js):
 *
 *   const molique = require('./purgecss.safelist.cjs');
 *
 *   safelist: molique.runtime        // MINIMUM - molique breaks without this
 *   safelist: molique.all            // runtime + every utility family
 *   safelist: molique.merge('colors', 'grid')   // runtime + selected families
 */

/* =========================================================================
   TIER 1 - RUNTIME (mandatory)
   Classes created/toggled by molique's own JS. Skipping this = broken components.
   ========================================================================= */

const runtime = {
  standard: [
    'admin-nav-submenu',
    'btn-hover-glow',
    'btn-hover-lift',
    'btn-hover-spring',
    'btn-outline-secondary',
    'btn-primary',
    'btn-sm',
    'carousel-bg-sync',
    'carousel-dot',
    'carousel-dots',
    'file-upload-name',
    'fw-bold',
    'icon',
    'js-resetting',
    'lang-suggest-actions',
    'lang-suggest-bar',
    'lang-suggest-text',
    'lightbox-close',
    'lightbox-content',
    'lightbox-counter',
    'lightbox-nav',
    'lightbox-next',
    'lightbox-overlay',
    'lightbox-prev',
    'lightbox-top-bar',
    'm-0',
    'mt-2',
    'onboarding-card',
    'onboarding-dialog',
    'onboarding-dot',
    'onboarding-dots',
    'onboarding-footer',
    'onboarding-nav',
    'onboarding-next',
    'onboarding-prev',
    'onboarding-skip',
    'onboarding-slide',
    'onboarding-slide-desc',
    'onboarding-slide-icon',
    'onboarding-slide-image',
    'onboarding-slide-media',
    'onboarding-slide-title',
    'onboarding-step-count',
    'opacity-50',
    'select-search',
    'select-search-menu',
    'sidebar-md',
    'sidebar-sm',
    'te-label',
    'text-4',
    'toast',
    'toast-bottom-center',
    'toast-bottom-left',
    'toast-bottom-right',
    'toast-container',
    'toast-danger',
    'toast-info',
    'toast-progress',
    'toast-success',
    'toast-top-center',
    'toast-top-left',
    'toast-top-right',
    'toast-warning',
    'tour-dialog',
    'tour-dot',
    'tour-dots',
    'tour-nav',
    'tour-next',
    'tour-prev',
    'tour-skip',
    'tour-spotlight',
    'tour-step-count',
    'tour-tooltip',
    'tour-tooltip-desc',
    'tour-tooltip-footer',
    'tour-tooltip-title',
  ],
  // molique's state-class convention. A pattern instead of a literal list,
  // since it also protects classes toggled by YOUR OWN code (e.g.
  // .step.is-completed).
  // Covers 16 .is-* classes in the CSS.
  greedy: [/^is-/],
  // Animation triggered from an inline style in JS - no CSS rule
  // references it, so the keyframes:true option would remove it.
  keyframes: [
    'toastProgressAnim',
  ],
};

/* =========================================================================
   TIER 2 - UTILITY FAMILIES (optional, pick your own)
   molique has NO WAY of knowing whether your backend assembles class names
   dynamically - e.g. class="opacity-<?= $x ?>" or a status from a database
   field. Such classes don't exist in any file, so PurgeCSS will strip
   them. Enable ONLY the groups you actually generate dynamically - every
   enabled group is a smaller win.
   ========================================================================= */

const families = {
  // .bg-*, .text-*, .border-* - colors/sizes driven from a CMS
  colors: [/^bg-/, /^text-/, /^border-/],
  // .col-span-*, .col-md-span-*, .offset-*, .grid-cols-* - layout from a CMS field
  grid: [/^col-/, /^offset-/, /^grid-cols-/],
  // margins/paddings/gaps assembled in a loop
  spacing: [/^m[trblxy]?-/, /^p[trblxy]?-/, /^gap-/],
  // statuses from a database enum: .badge-*, .status-*, .stock-bar-*, .opacity-*
  status: [/^badge-/, /^status-/, /^stock-bar-/, /^overlay-/, /^opacity-/],
};

/* ---------- Assembly ---------- */

function merge(...groups) {
  const greedy = [...runtime.greedy];
  for (const g of groups) {
    if (!families[g]) throw new Error('Unknown safelist group: ' + g);
    greedy.push(...families[g]);
  }
  return { standard: runtime.standard, greedy, keyframes: runtime.keyframes };
}

const all = merge(...Object.keys(families));

module.exports = { runtime, families, merge, all };
