/**
 * Molique Stats — lekki, bezcookiesowy tracker.
 *
 * Wysyła trzy rodzaje zdarzeń przez navigator.sendBeacon:
 *   - "pageview" przy załadowaniu strony,
 *   - "download" przy kliknięciu w link do pliku (albo z atrybutem data-stat-download),
 *   - "outbound" przy kliknięciu w link prowadzący na inną domenę (np. GitHub).
 *
 * Zero cookies, zero localStorage, zero danych osobowych po stronie klienta.
 * Błędy są cicho ignorowane — statystyki nigdy nie mogą zepsuć strony.
 */
(function () {
    'use strict';

    var ENDPOINT = '/stats/collect.php';
    var DOWNLOAD_EXT = /\.(zip|rar|7z|tar|gz|pdf|docx?|xlsx?|pptx?|csv|txt|svg|png|jpe?g|webp|gif|mp4|webm|mp3|wav|json|css|js|map|woff2?|ttf|otf|eot|exe|dmg|apk)$/i;
    var MAX_LABEL = 255;

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

    /** Link na inny host, po http(s). mailto:/tel:/javascript: mają puste .host. */
    function isExternal(link) {
        if (!link.host || link.host === location.host) {
            return false;
        }

        return link.protocol === 'http:' || link.protocol === 'https:';
    }

    function isDownload(link) {
        if (link.hasAttribute('data-stat-download') || link.hasAttribute('download')) {
            return true;
        }
        // Linki na inny host traktujemy jako wyjścia, nie pobrania.
        if (isExternal(link)) {
            return false;
        }
        return DOWNLOAD_EXT.test(link.pathname || '');
    }

    function downloadLabel(link) {
        return link.getAttribute('data-stat-download') ||
               (link.pathname ? link.pathname.split('/').pop() : '') ||
               link.href;
    }

    /**
     * Etykieta wyjścia: host + ścieżka, bez query i bez fragmentu.
     * Sam host nie wystarcza (github.com/molique vs github.com/.../tools/jit
     * to dwa różne przyciski na stronie), a query bywa nośnikiem parametrów
     * kampanii i danych osobowych — dlatego jest odcinane.
     */
    function outboundLabel(link) {
        var path = link.pathname && link.pathname !== '/' ? link.pathname : '';

        return (link.host + path).slice(0, MAX_LABEL);
    }

    function onClick(e) {
        var link = e.target.closest ? e.target.closest('a[href]') : null;
        if (!link) {
            return;
        }
        if (isDownload(link)) {
            send({ t: 'download', p: location.pathname, n: downloadLabel(link) });
            return;
        }
        if (isExternal(link)) {
            send({ t: 'outbound', p: location.pathname, n: outboundLabel(link) });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', trackPageview, { once: true });
    } else {
        trackPageview();
    }
    document.addEventListener('click', onClick, true);
})();
