/**
 * molique - footer email address obfuscation (spam-bot protection)
 *
 * The real address does NOT appear anywhere in the HTML source as
 * "user@domain" - bots scanning pages for addresses typically read the
 * raw HTML (a regex on the email pattern), they don't execute JS. The
 * link is only assembled in the browser from two separate data-*
 * attributes, so a static copy of the page never exposes the whole
 * address at once.
 */
function initMailObfuscate() {
  document.querySelectorAll('[data-obfuscate-mail]').forEach((el) => {
    const user = el.dataset.mailUser;
    const domain = el.dataset.mailDomain;
    if (!user || !domain) return;
    el.href = 'mailto:' + user + '@' + domain;
  });
}

window.initMailObfuscate = initMailObfuscate;
