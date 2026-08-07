<?php
/**
 * Molique Stats — drobne pomocniki widoku.
 *
 * Jedna odpowiedzialność: zamiana wartości na bezpieczny fragment HTML.
 * Klasa istnieje po to, żeby widok nie definiował funkcji globalnych i żeby
 * eskapowanie było jednym, wspólnym wywołaniem (łatwo sprawdzić, że nic
 * nie wychodzi na stronę surowe).
 */

declare(strict_types=1);

namespace Molique\Stats;

if (!defined('MOLIQUE_STATS')) {
    exit;
}

final class StatsHtml
{
    public static function esc(string $value): string
    {
        return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
    }

    /** Ikona ze sprite'a molique. Zawsze aria-hidden — obok stoi tekst. */
    public static function icon(string $sprite, string $name, string $class = 'icon'): string
    {
        return '<svg class="' . self::esc($class) . '" aria-hidden="true">'
             . '<use href="' . self::esc($sprite) . '#' . self::esc($name) . '"></use></svg>';
    }

    /** Liczba z niełamliwą spacją co tysiąc (żeby "12 480" nie łamało się w kolumnie). */
    public static function number(int $value): string
    {
        return number_format($value, 0, ',', "\u{202F}");
    }

    /** Udział procentowy w skali do największej wartości zestawu. */
    public static function share(int $value, int $max): int
    {
        return $max > 0 ? (int) round($value / $max * 100) : 0;
    }

    /** Największa wartość w kolumnie 'hits' — punkt odniesienia dla pasków. */
    public static function maxHits(array $rows): int
    {
        $max = 0;
        foreach ($rows as $row) {
            $max = max($max, (int) $row['hits']);
        }

        return $max;
    }

    /** Delta kafelka KPI. null = brak punktu odniesienia, nic nie renderujemy. */
    public static function delta(?float $delta, string $sprite, string $context): string
    {
        if ($delta === null) {
            return '<span class="stat-tile-delta"><span class="stat-tile-delta-context">'
                 . self::esc($context) . ' — brak</span></span>';
        }

        $up   = $delta >= 0;
        $sign = $up ? '+' : '';

        return '<span class="stat-tile-delta ' . ($up ? 'stat-tile-delta-up' : 'stat-tile-delta-down') . '">'
             . self::icon($sprite, $up ? 'ph-trend-up' : 'ph-trend-down')
             . self::esc($sign . number_format($delta, 1, ',', ' ')) . '%'
             . ' <span class="stat-tile-delta-context">' . self::esc($context) . '</span>'
             . '</span>';
    }

    /** Data w formacie "05.08" (oś wykresu) — wejście to zawsze Y-m-d z bazy. */
    public static function shortDate(string $isoDay): string
    {
        return self::formatDay($isoDay, 'd.m');
    }

    /** Data w formacie "05.08.2026" (dymek nad słupkiem). */
    public static function fullDate(string $isoDay): string
    {
        return self::formatDay($isoDay, 'd.m.Y');
    }

    private static function formatDay(string $isoDay, string $format): string
    {
        $time = strtotime($isoDay);

        return $time === false ? $isoDay : date($format, $time);
    }

    /**
     * Wysokość słupka sparkline'a jako wartość dla --val.
     *
     * Dzień bez ruchu dostaje 2px zamiast 0% z dwóch powodów: słupek o zerowej
     * wysokości nie ma czego najechać myszą (a dymek wisi właśnie na słupku),
     * a przerwa w szeregu czyta się jak brak danych, nie jak zero. 2px to przy
     * wykresie 200px dokładnie tyle, ile dostałby najniższy niezerowy słupek,
     * więc skala nie kłamie.
     */
    public static function barHeight(int $value, int $max): string
    {
        return $value === 0 ? '2px' : self::share($value, $max) . '%';
    }

    /**
     * Polska odmiana przez liczbę: 1 odsłona / 2-4 odsłony / 5+ odsłon
     * (z wyjątkiem nastek: 12, 13, 14 idą do formy "wiele").
     */
    public static function plural(int $count, string $one, string $few, string $many): string
    {
        if ($count === 1) {
            return $one;
        }
        $lastTwo = $count % 100;
        $last    = $count % 10;

        return ($last >= 2 && $last <= 4 && ($lastTwo < 12 || $lastTwo > 14)) ? $few : $many;
    }
}
