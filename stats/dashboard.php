<?php
/**
 * Molique Stats — panel podglądu (kontroler).
 * Chroniony HTTP Basic Auth (login/hash z konfiguracji).
 * Tylko odczyt agregatów; cały HTML siedzi w views/stats-dashboard-view.php,
 * a całe wyjście jest eskapowane przez htmlspecialchars().
 */

declare(strict_types=1);

use Molique\Stats\StatsDashboardAuth;
use Molique\Stats\StatsDashboardData;
use Molique\Stats\StatsDatabase;
use Molique\Stats\StatsReportRepository;

/** @var array $config */
$config = require __DIR__ . '/bootstrap.php';

$auth = new StatsDashboardAuth(
    (string) ($config['dashboard']['user'] ?? ''),
    (string) ($config['dashboard']['password_hash'] ?? '')
);

if (!$auth->isAuthorized($_SERVER)) {
    $auth->challenge();
}

$range = StatsDashboardData::normalizeRange($_GET['range'] ?? null);
$data  = (new StatsDashboardData(new StatsReportRepository(new StatsDatabase($config['db']))))
    ->build($range);

/**
 * Arkusze stylów panelu. Rdzeń molique JEST wymagany — bundle admina zawiera
 * wyłącznie moduł panelu (layout, sidebar, nawigacja, dashboard header), więc
 * sam z siebie nie ma grida, kart, tabel ani klas narzędziowych.
 * @var string[] $cssHrefs
 */
$cssHrefs = array_values(array_filter(array_map(
    'strval',
    (array) ($config['dashboard_css'] ?? [])
)));
if ($cssHrefs === []) {
    $cssHrefs = ['/css/molique-style.css', '/css/molique-style-admin.css'];
}

$scriptHref = (string) ($config['dashboard_script'] ?? '/js/molique-script.js');
$spriteHref = (string) ($config['dashboard_sprite'] ?? '/img/icons-sprite.svg');

require __DIR__ . '/views/stats-dashboard-view.php';
