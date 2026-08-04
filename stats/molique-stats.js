/**
 * Molique Stats — lekki, bezcookiesowy tracker.
 *
 * Wysyła dwa rodzaje zdarzeń przez navigator.sendBeacon:
 *   - "pageview" przy załadowaniu strony,
 *   - "download" przy kliknięciu w link do pliku (albo z atrybutem data-stat-download).
 *
 * Zero cookies, zero localStorage, zero danych osobowych po stronie klienta.
 * Błędy są cicho ignorowane — statystyki nigdy nie mogą zepsuć strony.
 */
(function () {
    'use strict';

    var ENDPOINT = '/stats/collect.php';
    var DOWNLOAD_EXT = /\.(zip|rar|7z|tar|gz|pdf|docx?|xlsx?|pptx?|csv|txt|svg|png|jpe?g|webp|gif|mp4|webm|mp3|wav|json|css|js|map|woff2?|ttf|otf|eot|exe|dmg|apk)$/i;

    function send(payload) {
        try {
            var body = new Blob([JSON.stringify(payload)], { type: 'application/json' });
            if (navigator.sendBeacon) {
                navigator.sendBeacon(ENDPOINT, body);
            } else {
                fetch(ENDPOINT, {
                    method: 'POST',
                    body: body,
                    keepalive: true,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        } catch (e) {
            /* celowo cicho */
        }
    }

    function trackPageview() {
        send({
            t: 'pageview',
            p: location.pathname,
            r: document.referrer || '',
            w: window.innerWidth || 0
        });
    }

    function isDownload(link) {
        if (link.hasAttribute('data-stat-download') || link.hasAttribute('download')) {
            return true;
        }
        // Linki na inny host traktujemy jako wyjścia, nie pobrania.
        if (link.host && link.host !== location.host) {
            return false;
        }
        return DOWNLOAD_EXT.test(link.pathname || '');
    }

    function onClick(e) {
        var link = e.target.closest ? e.target.closest('a[href]') : null;
        if (!link || !isDownload(link)) {
            return;
        }
        var name = link.getAttribute('data-stat-download') ||
                   (link.pathname ? link.pathname.split('/').pop() : '') ||
                   link.href;
        send({ t: 'download', p: location.pathname, n: name });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', trackPageview, { once: true });
    } else {
        trackPageview();
    }
    document.addEventListener('click', onClick, true);
})();
