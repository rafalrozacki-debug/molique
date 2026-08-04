<?php
/**
 * Molique Stats — anonimowy odcisk gościa.
 *
 * Jedna odpowiedzialność: policzyć nieodwracalny, dobowo rotowany hash
 * pozwalający zliczyć UNIKALNYCH gości w obrębie dnia, BEZ przechowywania
 * danych osobowych. IP i User-Agent służą wyłącznie do policzenia hasza
 * i nigdzie nie są zapisywane. Sól zawiera bieżącą datę, więc ten sam
 * gość następnego dnia ma inny hash — nie da się go śledzić w czasie.
 */

declare(strict_types=1);

namespace Molique\Stats;

if (!defined('MOLIQUE_STATS')) {
    exit;
}

final class VisitorFingerprint
{
    private string $secret;

    public function __construct(string $secret)
    {
        $this->secret = $secret;
    }

    public function forToday(): string
    {
        $ip        = $this->clientIp();
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $daySalt   = $this->secret . '|' . date('Y-m-d');

        return hash('sha256', $ip . '|' . $userAgent . '|' . $daySalt);
    }

    /**
     * Adres używany TYLKO do policzenia hasza (nie jest zapisywany).
     * Domyślnie REMOTE_ADDR. Jeśli stoisz za Cloudflare/reverse-proxy,
     * odkomentuj obsługę nagłówka — ale tylko gdy proxy jest zaufane,
     * bo nagłówki XFF/CF można podrobić.
     */
    private function clientIp(): string
    {
        // if (!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) {
        //     return (string) $_SERVER['HTTP_CF_CONNECTING_IP'];
        // }
        return (string) ($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
    }
}
