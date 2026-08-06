<?php
/**
 * Molique Stats — HTTP Basic Auth dla panelu.
 *
 * Jedna odpowiedzialność: rozstrzygnąć, czy żądanie niesie poprawne dane
 * logowania, i wystawić wyzwanie 401, gdy nie niesie.
 *
 * Na części hostingów współdzielonych (PHP jako CGI/FastCGI) Apache nie
 * przekazuje nagłówka Authorization do PHP jako PHP_AUTH_USER/PHP_AUTH_PW —
 * trzeba go odczytać ręcznie z HTTP_AUTHORIZATION (albo
 * REDIRECT_HTTP_AUTHORIZATION, gdy żądanie przeszło przez wewnętrzne
 * przekierowanie Apache). "CGIPassAuth On" w .htaccess załatwia to samo tam,
 * gdzie dyrektywa jest wspierana — to jest fallback, gdyby nie była.
 */

declare(strict_types=1);

namespace Molique\Stats;

if (!defined('MOLIQUE_STATS')) {
    exit;
}

final class StatsDashboardAuth
{
    private string $user;
    private string $passwordHash;

    public function __construct(string $user, string $passwordHash)
    {
        $this->user         = $user;
        $this->passwordHash = $passwordHash;
    }

    /** @param array<string,mixed> $server zwykle $_SERVER */
    public function isAuthorized(array $server): bool
    {
        if ($this->user === '' || $this->passwordHash === '') {
            return false;
        }
        [$givenUser, $givenPass] = $this->readCredentials($server);

        return hash_equals($this->user, $givenUser)
            && password_verify($givenPass, $this->passwordHash);
    }

    /** Wyzwanie przeglądarki: okno logowania zamiast treści panelu. */
    public function challenge(string $realm = 'Molique Stats'): void
    {
        header('WWW-Authenticate: Basic realm="' . $realm . '"');
        http_response_code(401);
        exit('Wymagane logowanie.');
    }

    /**
     * @param array<string,mixed> $server
     * @return array{0:string,1:string}
     */
    private function readCredentials(array $server): array
    {
        if (isset($server['PHP_AUTH_USER'])) {
            return [(string) $server['PHP_AUTH_USER'], (string) ($server['PHP_AUTH_PW'] ?? '')];
        }

        $header = (string) ($server['HTTP_AUTHORIZATION'] ?? $server['REDIRECT_HTTP_AUTHORIZATION'] ?? '');
        if (stripos($header, 'Basic ') !== 0) {
            return ['', ''];
        }

        $decoded = base64_decode(substr($header, 6), true);
        if ($decoded === false || !str_contains($decoded, ':')) {
            return ['', ''];
        }

        /** @var array{0:string,1:string} $parts */
        $parts = explode(':', $decoded, 2);

        return $parts;
    }
}
