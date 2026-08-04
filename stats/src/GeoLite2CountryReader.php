<?php
/**
 * Molique Stats — czytnik lokalnej bazy GeoLite2 Country.
 *
 * Jedna odpowiedzialność: zamienić adres IP na 2-literowy kod kraju,
 * korzystając z pliku .mmdb leżącego NA TWOIM serwerze. IP nie opuszcza
 * serwera — zero podmiotów trzecich. Owija oficjalną bibliotekę MaxMind
 * (\MaxMind\Db\Reader), która sama użyje szybkiego rozszerzenia C, jeśli
 * jest dostępne, albo czystego PHP w przeciwnym razie.
 *
 * Gdy biblioteki lub pliku bazy brak — klasa jest bezpiecznie bezczynna
 * (countryFor() zwraca null), więc statystyki działają dalej bez kraju.
 */

declare(strict_types=1);

namespace Molique\Stats;

if (!defined('MOLIQUE_STATS')) {
    exit;
}

use MaxMind\Db\Reader;
use Throwable;

final class GeoLite2CountryReader
{
    private ?Reader $reader = null;

    public function __construct(string $databasePath)
    {
        if ($databasePath === ''
            || !is_file($databasePath)
            || !class_exists(Reader::class)) {
            return; // brak konfiguracji/biblioteki — tryb bezczynny
        }
        try {
            $this->reader = new Reader($databasePath);
        } catch (Throwable $e) {
            error_log('Molique Stats GeoLite2 init: ' . $e->getMessage());
            $this->reader = null;
        }
    }

    public function isReady(): bool
    {
        return $this->reader !== null;
    }

    public function countryFor(string $ip): ?string
    {
        if ($this->reader === null || $ip === '') {
            return null;
        }
        if (filter_var($ip, FILTER_VALIDATE_IP) === false) {
            return null;
        }

        try {
            $record = $this->reader->get($ip);
        } catch (Throwable $e) {
            return null;
        }
        if (!is_array($record)) {
            return null;
        }

        $code = $record['country']['iso_code']
            ?? ($record['registered_country']['iso_code'] ?? null);

        return is_string($code) ? strtoupper($code) : null;
    }
}
