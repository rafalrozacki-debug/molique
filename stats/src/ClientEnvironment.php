<?php
/**
 * Molique Stats — środowisko klienta (anonimowe kategorie).
 *
 * Jedna odpowiedzialność: z User-Agenta i szerokości viewportu wyliczyć
 * grube, niskokardynalne kategorie: typ urządzenia, rodzinę przeglądarki,
 * system i kubełek breakpointu. Kraj jest USTALANY OSOBNO (CountryLocator)
 * i wstrzykiwany tu gotowy — ta klasa nie robi żadnego I/O. Surowy
 * User-Agent nie jest nigdzie zapisywany; model anonimowości nienaruszony.
 */

declare(strict_types=1);

namespace Molique\Stats;

if (!defined('MOLIQUE_STATS')) {
    exit;
}

final class ClientEnvironment
{
    private function __construct(
        public readonly string $deviceType,
        public readonly string $browser,
        public readonly string $os,
        public readonly ?string $country,
        public readonly ?string $viewport,
    ) {
    }

    /**
     * @param array<string,mixed> $server        Zwykle $_SERVER (dla User-Agenta).
     * @param int|null $viewportWidth             window.innerWidth przekazane z klienta.
     * @param string|null $country                Gotowy kod kraju z CountryLocator (albo null).
     */
    public static function fromRequest(array $server, ?int $viewportWidth, ?string $country = null): self
    {
        $ua = (string) ($server['HTTP_USER_AGENT'] ?? '');

        return new self(
            deviceType: self::detectDevice($ua),
            browser: self::detectBrowser($ua),
            os: self::detectOs($ua),
            country: $country,
            viewport: self::bucketViewport($viewportWidth),
        );
    }

    private static function detectDevice(string $ua): string
    {
        $isAndroid = str_contains($ua, 'Android');

        if (str_contains($ua, 'iPad')
            || ($isAndroid && !str_contains($ua, 'Mobile'))
            || str_contains($ua, 'Tablet')) {
            return 'tablet';
        }
        if (str_contains($ua, 'Mobi')
            || str_contains($ua, 'iPhone')
            || str_contains($ua, 'iPod')) {
            return 'mobile';
        }

        return 'desktop';
    }

    private static function detectBrowser(string $ua): string
    {
        // Kolejność istotna: Edge/Opera zawierają w UA "Chrome".
        return match (true) {
            str_contains($ua, 'Edg')                                  => 'Edge',
            str_contains($ua, 'OPR') || str_contains($ua, 'Opera')    => 'Opera',
            str_contains($ua, 'Firefox') || str_contains($ua, 'FxiOS')=> 'Firefox',
            str_contains($ua, 'Chrome') || str_contains($ua, 'CriOS') => 'Chrome',
            str_contains($ua, 'Safari')                               => 'Safari',
            default                                                   => 'Other',
        };
    }

    private static function detectOs(string $ua): string
    {
        // Android zawiera "Linux" — sprawdzamy go wcześniej.
        return match (true) {
            str_contains($ua, 'Windows')                                        => 'Windows',
            str_contains($ua, 'Android')                                        => 'Android',
            str_contains($ua, 'iPhone') || str_contains($ua, 'iPad')
                || str_contains($ua, 'iPod')                                    => 'iOS',
            str_contains($ua, 'Mac OS X') || str_contains($ua, 'Macintosh')     => 'macOS',
            str_contains($ua, 'CrOS')                                           => 'ChromeOS',
            str_contains($ua, 'Linux')                                          => 'Linux',
            default                                                             => 'Other',
        };
    }

    /** Kubełek breakpointu spójny z progami molique. */
    private static function bucketViewport(?int $width): ?string
    {
        if ($width === null || $width <= 0 || $width > 10000) {
            return null;
        }

        return match (true) {
            $width < 576  => 'xs',
            $width < 768  => 'sm',
            $width < 992  => 'md',
            $width < 1200 => 'lg',
            default       => 'xl',
        };
    }
}
