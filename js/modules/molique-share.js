/**
 * molique - widget udostępniania (social media share buttons)
 *
 * The one message this module can show follows <html lang> (since 1.7.52).
 * It is a blocking alert(), so getting it wrong is not a subtle failure -
 * it stops the page in a language the reader may not have.
 */

// Split on '-' and fall back to English - see the note in molique-script.js.
const SHARE_TEXT = {
  pl: { unsupported: 'Twoja przeglądarka nie wspiera systemowego udostępniania.' },
  de: { unsupported: 'Ihr Browser unterstützt die System-Teilen-Funktion nicht.' },
  en: { unsupported: 'Your browser does not support the system share dialog.' },
};
const shareText = () =>
  SHARE_TEXT[String(document.documentElement.lang || '').split('-')[0]] || SHARE_TEXT.en;

function initShare() {
  const shareButtons = document.querySelectorAll('.share-btn');
  if (shareButtons.length > 0) {
    shareButtons.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const network = btn.getAttribute('data-network');
        const currentUrl = encodeURIComponent(window.location.href);
        const currentTitle = encodeURIComponent(document.title);
        
        if (network === 'native') {
          if (navigator.share) {
            try { await navigator.share({ title: document.title, url: window.location.href }); } 
            catch (err) { console.log('[molique-share] sharing cancelled by the user'); }
          } else { alert(shareText().unsupported); }
          return;
        }

        let shareUrl = '';
        switch (network) {
          case 'facebook': shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`; break;
          case 'twitter': shareUrl = `https://twitter.com/intent/tweet?url=${currentUrl}&text=${currentTitle}`; break;
          case 'linkedin': shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}`; break;
          case 'whatsapp': shareUrl = `https://api.whatsapp.com/send?text=${currentTitle}%20${currentUrl}`; break;
        }
        if (shareUrl) window.open(shareUrl, 'share-popup', 'width=600,height=400,scrollbars=no');
      });
    });
  }
}

window.initShare = initShare;
