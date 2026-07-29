/**
 * molique - obfuskacja adresu e-mail w stopce (ochrona przed spam-botami)
 *
 * Realny adres NIE wystepuje nigdzie w zrodle HTML jako "user@domena" -
 * boty skanujace strony pod katem adresow zazwyczaj przegladaja goly HTML
 * (regex na wzorzec e-mail), nie wykonuja JS. Link buduje sie dopiero w
 * przegladarce z dwoch osobnych atrybutow data-*, wiec statyczna kopia
 * strony nigdy nie ujawnia calego adresu naraz.
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
