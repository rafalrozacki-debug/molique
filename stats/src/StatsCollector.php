<?php
/**
 * Molique Stats — kolektor (warstwa serwisowa endpointu).
 * Jedna odpowiedzialność: zwalidować przychodzące żądanie beacona,
 * zsanityzować dane i przekazać je do repozytorium. Zero SQL tutaj.
 */

declare(strict_types=1);

namespace Molique\Stats;

if (!defined('MOLIQUE_STATS')) {
    exit;
}

final class StatsCollector
{
    private const ALLOWED_TYPES = ['pageview', 'download', 'outbound'];
    /** Typy, dla których etykieta (nazwa pliku / cel wyjścia) jest obowiązkowa. */
    private const LABELLED_TYPES = ['download', 'outbound'];
    private const MAX_LEN        = 255;

    private StatsRepository $repository;
    private VisitorFingerprint $fingerprint;
    private CountryLocator $countryLocator;
    /** @var string[] */
    private array $allowedHosts;

    /** @param string[] $allowedHosts */
    public function __construct(
        StatsRepository $repository,
        VisitorFingerprint $fingerprint,
        CountryLocator $countryLocator,
        array $allowedHosts
    ) {
        $this->repository     = $repository;
        $this->fingerprint    = $fingerprint;
        $this->countryLocator = $countryLocator;
        $this->allowedHosts   = $allowedHosts;
    }

    public function handle(): void
    {
        if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
            $this->end(405);
        }
        if (!$this->originAllowed()) {
            $this->end(403);
        }

        $payload = $this->readPayload();
        if ($payload === null) {
            $this->end(400);
        }

        $type = (string) ($payload['t'] ?? '');
        if (!in_array($type, self::ALLOWED_TYPES, true)) {
            $this->end(422);
        }

        $path  = $this->sanitizePath((string) ($payload['p'] ?? '/'));
        $label = null;
        if (in_array($type, self::LABELLED_TYPES, true)) {
            $label = $this->sanitizeLabel((string) ($payload['n'] ?? ''));
            if ($label === '') {
                $this->end(422);
            }
        }

        $referrerHost = $this->extractReferrerHost((string) ($payload['r'] ?? ''));

        $hash     = $this->fingerprint->forToday();
        $isUnique = $this->repository->isFirstVisitToday($hash);
        $country  = $this->countryLocator->locate($_SERVER);
        $env      = ClientEnvironment::fromRequest($_SERVER, $this->readViewportWidth($payload), $country);

        $this->repository->recordEvent(
            new StatEvent($type, $path, $label, $referrerHost, $hash, $isUnique, $env)
        );

        $this->end(204);
    }

    /** Beacon musi pochodzić z naszej domeny (ochrona przed spamem cross-site). */
    private function originAllowed(): bool
    {
        $source = $_SERVER['HTTP_ORIGIN'] ?? ($_SERVER['HTTP_REFERER'] ?? '');
        if ($source === '') {
            return false;
        }
        $host = parse_url($source, PHP_URL_HOST);

        return is_string($host) && in_array($host, $this->allowedHosts, true);
    }

    /** @return array<string,mixed>|null */
    private function readPayload(): ?array
    {
        $raw = file_get_contents('php://input');
        if ($raw === false || $raw === '' || strlen($raw) > 2048) {
            return null;
        }
        $data = json_decode($raw, true);

        return is_array($data) ? $data : null;
    }

    private function sanitizePath(string $path): string
    {
        // Odcinamy query i fragment (mogą zawierać dane osobowe), czyścimy znaki sterujące.
        $path = strtok($path, '?#') ?: '/';
        $path = preg_replace('/[\x00-\x1F\x7F]/', '', $path) ?? '/';
        if ($path === '' || $path[0] !== '/') {
            $path = '/' . ltrim($path, '/');
        }

        return substr($path, 0, self::MAX_LEN);
    }

    /** Szerokość viewportu z beacona (do kubełka breakpointu). Poza zakresem => null. */
    private function readViewportWidth(array $payload): ?int
    {
        if (!isset($payload['w']) || !is_numeric($payload['w'])) {
            return null;
        }
        $width = (int) $payload['w'];

        return ($width > 0 && $width <= 10000) ? $width : null;
    }

    private function sanitizeLabel(string $label): string
    {
        $label = preg_replace('/[\x00-\x1F\x7F]/', '', $label) ?? '';

        return substr(trim($label), 0, self::MAX_LEN);
    }

    /** Zapisujemy WYŁĄCZNIE host odsyłający; własne wejścia i puste = NULL. */
    private function extractReferrerHost(string $referrer): ?string
    {
        if ($referrer === '') {
            return null;
        }
        $host = parse_url($referrer, PHP_URL_HOST);
        if (!is_string($host) || $host === '') {
            return null;
        }
        if (in_array($host, $this->allowedHosts, true)) {
            return null; // ruch wewnętrzny nie jest "źródłem"
        }

        return substr($host, 0, self::MAX_LEN);
    }

    private function end(int $status): void
    {
        http_response_code($status);
        exit;
    }
}
