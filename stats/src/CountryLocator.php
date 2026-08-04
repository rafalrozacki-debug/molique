<?php
/**
 * Molique Stats — ustalanie kraju.
 *
 * Jedna odpowiedzialność: zwrócić 2-literowy kod kraju dla żądania,
 * próbując po kolei najtańszych źródeł:
 *   1. zmienne serwera (GeoIP hostingu / CDN, np. GEOIP_COUNTRY_CODE),
 *   2. lokalna baza GeoLite2 z adresu IP (jeśli dostępna).
 * Zawsze wynik to gruby, anonimowy kod kraju albo null — nigdy IP.
 */

declare(strict_types=1);

namespace Molique\Stats;

if (!defined('MOLIQUE_STATS')) {
    exit;
}

final class CountryLocator
{
    /** Domyślne miejsca, gdzie hostingi/CDN wystawiają kod kraju. */
    public const DEFAULT_SERVER_KEYS = [
        'HTTP_CF_IPCOUNTRY',
        'GEOIP_COUNTRY_CODE',
        'GEOIP_COUNTRY_CODE_V6',
        'MM_COUNTRY_CODE',
        'HTTP_X_GEOIP_COUNTRY',
    ];

    /** @var string[] */
    private array $serverKeys;
    private ?GeoLite2CountryReader $geoReader;

    /** @param string[] $serverKeys */
    public function __construct(array $serverKeys = self::DEFAULT_SERVER_KEYS, ?GeoLite2CountryReader $geoReader = null)
    {
        $this->serverKeys = $serverKeys === [] ? self::DEFAULT_SERVER_KEYS : $serverKeys;
        $this->geoReader  = $geoReader;
    }

    /** @param array<string,mixed> $server */
    public function locate(array $server): ?string
    {
        foreach ($this->serverKeys as $key) {
            $code = strtoupper((string) ($server[$key] ?? ''));
            if ($this->isValid($code)) {
                return $code;
            }
        }

        if ($this->geoReader !== null) {
            $code = $this->geoReader->countryFor((string) ($server['REMOTE_ADDR'] ?? ''));
            if ($code !== null && $this->isValid($code)) {
                return $code;
            }
        }

        return null;
    }

    private function isValid(string $code): bool
    {
        return preg_match('/^[A-Z]{2}$/', $code) === 1
            && !in_array($code, ['XX', 'T1'], true);
    }
}
