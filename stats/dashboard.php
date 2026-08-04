<?php
/**
 * Molique Stats — panel podglądu.
 * Chroniony HTTP Basic Auth (login/hash z konfiguracji).
 * Tylko odczyt agregatów; całe wyjście eskapowane przez htmlspecialchars().
 */

declare(strict_types=1);

use Molique\Stats\StatsDatabase;
use Molique\Stats\StatsRepository;

/** @var array $config */
$config = require __DIR__ . '/bootstrap.php';

// --- Autoryzacja ---
// Na części hostingów współdzielonych (PHP jako CGI/FastCGI) Apache nie
// przekazuje nagłówka Authorization do PHP jako PHP_AUTH_USER/PHP_AUTH_PW
// domyślnie - trzeba go odczytać ręcznie z HTTP_AUTHORIZATION (albo
// REDIRECT_HTTP_AUTHORIZATION, gdy żądanie przeszło przez wewnętrzne
// przekierowanie Apache). CGIPassAuth On w .htaccess załatwia to samo tam,
// gdzie dyrektywa jest wspierana - to jest fallback, gdyby nie była.
$expectedUser = $config['dashboard']['user'] ?? '';
$expectedHash = $config['dashboard']['password_hash'] ?? '';
[$givenUser, $givenPass] = resolveBasicAuthCredentials();

/** @return array{0:string,1:string} */
function resolveBasicAuthCredentials(): array
{
    if (isset($_SERVER['PHP_AUTH_USER'])) {
        return [$_SERVER['PHP_AUTH_USER'], $_SERVER['PHP_AUTH_PW'] ?? ''];
    }

    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (stripos($header, 'Basic ') !== 0) {
        return ['', ''];
    }

    $decoded = base64_decode(substr($header, 6), true);
    if ($decoded === false || !str_contains($decoded, ':')) {
        return ['', ''];
    }

    return explode(':', $decoded, 2);
}

$authorized = hash_equals($expectedUser, $givenUser)
    && $expectedHash !== ''
    && password_verify($givenPass, $expectedHash);

if (!$authorized) {
    header('WWW-Authenticate: Basic realm="Molique Stats"');
    http_response_code(401);
    exit('Wymagane logowanie.');
}

// --- Dane ---
$repository = new StatsRepository(new StatsDatabase($config['db']));
$range      = 30;

$pageviewsToday = $repository->countToday('pageview');
$uniquesToday   = $repository->uniquesToday();
$downloadsToday = $repository->countToday('download');
$pageviews30    = $repository->countLastDays('pageview', $range);
$downloads30    = $repository->countLastDays('download', $range);
$topPages       = $repository->topPages($range, 15);
$topDownloads   = $repository->topDownloads($range, 15);
$topReferrers   = $repository->topReferrers($range, 10);
$perDay         = $repository->pageviewsPerDay(14);

$byDevice   = $repository->breakdown('device_type', $range, 10);
$byViewport = $repository->breakdown('viewport', $range, 10);
$byBrowser  = $repository->breakdown('browser', $range, 10);
$byOs       = $repository->breakdown('os', $range, 10);
$byCountry  = $repository->breakdown('country', $range, 12);

$maxPerDay = 0;
foreach ($perDay as $row) {
    $maxPerDay = max($maxPerDay, (int) $row['hits']);
}

/** Skrót do bezpiecznego wypisania. */
function e(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

/**
 * Karta z rozbiciem wg wymiaru (lista z paskami udziału).
 * @param array<int, array{name:string, hits:int}> $rows
 */
function render_breakdown(string $title, array $rows): string
{
    $max = 0;
    foreach ($rows as $row) {
        $max = max($max, (int) $row['hits']);
    }

    $html = '<div class="col-md-span-4"><h3 class="text-4 fw-bold">' . e($title) . '</h3>'
          . '<div class="card"><div class="card-body">';

    if (empty($rows)) {
        $html .= '<p class="text-2">Brak danych.</p>';
    }
    foreach ($rows as $row) {
        $pct  = $max > 0 ? (int) round((int) $row['hits'] / $max * 100) : 0;
        $name = (string) $row['name'];
        $html .= '<div class="d-flex align-items-center gap-2 mb-1">'
              . '<span class="text-2" style="min-width: 84px;">' . e($name) . '</span>'
              . '<div class="progress w-100"><div class="progress-bar" style="width: ' . $pct . '%"></div></div>'
              . '<span class="text-2 fw-medium" style="min-width: 40px; text-align: right;">' . (int) $row['hits'] . '</span>'
              . '</div>';
    }

    return $html . '</div></div></div>';
}

$cssHref = (string) ($config['dashboard_css'] ?? '/css/molique-style-admin.css');
?>
<!DOCTYPE html>
<html lang="pl" data-theme="light">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <title>Molique Stats — panel</title>
    <link rel="stylesheet" href="<?= e($cssHref) ?>">
</head>
<body>
<div class="container">
    <section>
        <h1 class="text-7 fw-bold">Statystyki molique.dev</h1>
        <p class="text-2 text-primary">Ostatnie <?= (int) $range ?> dni · dane anonimowe, bez cookies</p>

        <div class="grid-md-cols-12 gap-3">
            <div class="col-md-span-3">
                <div class="card stat-tile">
                    <div class="stat-tile-body">
                        <span class="stat-tile-label">Odsłony dziś</span>
                        <span class="stat-tile-value"><?= (int) $pageviewsToday ?></span>
                    </div>
                </div>
            </div>
            <div class="col-md-span-3">
                <div class="card stat-tile">
                    <div class="stat-tile-body">
                        <span class="stat-tile-label">Unikalni goście dziś</span>
                        <span class="stat-tile-value"><?= (int) $uniquesToday ?></span>
                    </div>
                </div>
            </div>
            <div class="col-md-span-3">
                <div class="card stat-tile">
                    <div class="stat-tile-body">
                        <span class="stat-tile-label">Pobrania dziś</span>
                        <span class="stat-tile-value"><?= (int) $downloadsToday ?></span>
                    </div>
                </div>
            </div>
            <div class="col-md-span-3">
                <div class="card stat-tile">
                    <div class="stat-tile-body">
                        <span class="stat-tile-label">Odsłony (<?= (int) $range ?> dni)</span>
                        <span class="stat-tile-value"><?= (int) $pageviews30 ?></span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section>
        <h2 class="text-5 fw-bold">Odsłony — ostatnie 14 dni</h2>
        <div class="card">
            <div class="card-body">
                <?php foreach ($perDay as $row): ?>
                    <?php $pct = $maxPerDay > 0 ? round((int) $row['hits'] / $maxPerDay * 100) : 0; ?>
                    <div class="d-flex align-items-center gap-3 mb-1">
                        <span class="text-2" style="min-width: 90px;"><?= e((string) $row['day_bucket']) ?></span>
                        <div class="progress w-100">
                            <div class="progress-bar" style="width: <?= (int) $pct ?>%"></div>
                        </div>
                        <span class="text-2 fw-medium" style="min-width: 48px; text-align: right;"><?= (int) $row['hits'] ?></span>
                    </div>
                <?php endforeach; ?>
                <?php if (empty($perDay)): ?>
                    <p class="text-2">Brak danych.</p>
                <?php endif; ?>
            </div>
        </div>
    </section>

    <section>
        <div class="grid-md-cols-12 gap-3">
            <div class="col-md-span-6">
                <h2 class="text-5 fw-bold">Najczęstsze strony</h2>
                <div class="table-wrapper">
                    <table class="table table-striped table-cards">
                        <thead class="thead-light">
                            <tr><th>Ścieżka</th><th>Odsłony</th></tr>
                        </thead>
                        <tbody>
                            <?php foreach ($topPages as $row): ?>
                                <tr>
                                    <td data-label="Ścieżka"><?= e((string) $row['path']) ?></td>
                                    <td data-label="Odsłony"><?= (int) $row['hits'] ?></td>
                                </tr>
                            <?php endforeach; ?>
                            <?php if (empty($topPages)): ?>
                                <tr><td colspan="2" data-label="">Brak danych.</td></tr>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="col-md-span-6">
                <h2 class="text-5 fw-bold">Pobrania (<?= (int) $downloads30 ?> łącznie)</h2>
                <div class="table-wrapper">
                    <table class="table table-striped table-cards">
                        <thead class="thead-light">
                            <tr><th>Plik</th><th>Pobrania</th></tr>
                        </thead>
                        <tbody>
                            <?php foreach ($topDownloads as $row): ?>
                                <tr>
                                    <td data-label="Plik"><?= e((string) $row['label']) ?></td>
                                    <td data-label="Pobrania"><?= (int) $row['hits'] ?></td>
                                </tr>
                            <?php endforeach; ?>
                            <?php if (empty($topDownloads)): ?>
                                <tr><td colspan="2" data-label="">Brak danych.</td></tr>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </section>

    <section>
        <h2 class="text-5 fw-bold">Urządzenia i przeglądarki</h2>
        <div class="grid-md-cols-12 gap-3">
            <?= render_breakdown('Typ urządzenia', $byDevice) ?>
            <?= render_breakdown('Breakpoint (viewport)', $byViewport) ?>
            <?= render_breakdown('Przeglądarka', $byBrowser) ?>
            <?= render_breakdown('System', $byOs) ?>
            <?= render_breakdown('Kraj', $byCountry) ?>
        </div>
    </section>

    <section>
        <h2 class="text-5 fw-bold">Źródła ruchu (zewnętrzne)</h2>
        <div class="table-wrapper">
            <table class="table table-striped table-cards">
                <thead class="thead-light">
                    <tr><th>Host odsyłający</th><th>Odsłony</th></tr>
                </thead>
                <tbody>
                    <?php foreach ($topReferrers as $row): ?>
                        <tr>
                            <td data-label="Host"><?= e((string) $row['referrer_host']) ?></td>
                            <td data-label="Odsłony"><?= (int) $row['hits'] ?></td>
                        </tr>
                    <?php endforeach; ?>
                    <?php if (empty($topReferrers)): ?>
                        <tr><td colspan="2" data-label="">Brak zewnętrznych źródeł.</td></tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </section>
</div>
</body>
</html>
