/**
 * molify - widget udostępniania (social media share buttons)
 */

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
            catch (err) { console.log('Udostępnianie anulowane.'); }
          } else { alert('Twoja przeglądarka nie wspiera systemowego udostępniania.'); }
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
