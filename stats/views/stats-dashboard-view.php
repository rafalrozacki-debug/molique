<?php
/**
 * Molique Stats — widok panelu.
 *
 * Czysta prezentacja: zero zapytań, zero logiki biznesowej. Dane przychodzą
 * z kontrolera (dashboard.php) jako $data, $cssHrefs, $scriptHref, $spriteHref.
 *
 * Panel korzysta z DWÓCH arkuszy molique: rdzenia (grid, karty, tabele,
 * klasy narzędziowe) oraz bundla admina (layout, sidebar, nawigacja,
 * dashboard header). Sam bundle admina to za mało — nie zawiera rdzenia.
 */

declare(strict_types=1);

namespace Molique\Stats;

if (!defined('MOLIQUE_STATS')) {
    exit;
}

/** @var array $data */
/** @var string[] $cssHrefs */
/** @var string $scriptHref */
/** @var string $spriteHref */

$h       = StatsHtml::class;
$table   = new StatsTableRenderer($spriteHref);
$range   = (int) $data['range'];
$today   = $data['today'];
$perDay  = $data['perDay'];
$maxDay  = StatsHtml::maxHits($perDay);
$context = 'vs poprzednie ' . $range . ' dni';

$sections = [
    'przeglad'   => ['Przegląd', 'ph-chart-bar'],
    'tresci'     => ['Treści', 'ph-file-text'],
    'wyjscia'    => ['Wyjścia', 'ph-arrow-up-right'],
    'urzadzenia' => ['Urządzenia', 'ph-device-mobile'],
    'zrodla'     => ['Źródła', 'ph-compass'],
];
?>
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <!-- Anti-FOUC: motyw i szerokość sidebara ustawiane PRZED pierwszym
         renderowaniem. Musi być synchroniczne (bez defer/async) i jak
         najwyżej w <head> - molique-script.js robi to samo dopiero po
         DOMContentLoaded, czyli po pierwszej klatce. -->
    <script>
      (function () {
        try {
          var html = document.documentElement;
          var savedTheme = localStorage.getItem('molique-theme');
          var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          html.setAttribute('data-theme', savedTheme || (systemDark ? 'dark' : 'light'));

          var savedSidebar = localStorage.getItem('molique-sidebar-state');
          if (savedSidebar === 'sidebar-md' || savedSidebar === 'sidebar-sm') {
            html.classList.add(savedSidebar);
          }
        } catch (e) {}
      })();
    </script>
    <title>Molique Stats — panel</title>
    <?php foreach ($cssHrefs as $href): ?>
    <link rel="stylesheet" href="<?= $h::esc($href) ?>">
    <?php endforeach; ?>
</head>
<body>
<div class="admin-layout admin-layout-floating">
    <aside class="admin-sidebar fade-bottom">
        <a href="?range=<?= $range ?>" class="admin-brand admin-logo-hide">molique&nbsp;<span class="text-primary">stats</span></a>

        <ul class="admin-nav">
            <?php foreach ($sections as $id => [$title, $icon]): ?>
                <li>
                    <a href="#<?= $h::esc($id) ?>" class="admin-nav-link">
                        <?= $h::icon($spriteHref, $icon) ?><span class="nav-text"><?= $h::esc($title) ?></span>
                    </a>
                </li>
            <?php endforeach; ?>
        </ul>

        <ul class="admin-nav admin-nav-bottom">
            <li>
                <a href="/" class="admin-nav-link">
                    <?= $h::icon($spriteHref, 'ph-link') ?><span class="nav-text">molique.dev</span>
                </a>
            </li>
            <li>
                <button type="button" id="molique-sidebar-toggle" class="admin-nav-link">
                    <span class="sidebar-toggle-icon"><span></span><span></span><span></span></span>
                    <span class="nav-text">Zwiń panel</span>
                </button>
            </li>
        </ul>
    </aside>

    <main class="admin-main">
        <div class="dashboard-header">
            <div>
                <h1 class="text-6 fw-bold m-0">Statystyki molique.dev</h1>
                <p class="text-2 text-muted m-0">
                    Ostatnie <?= $range ?> dni · dane anonimowe, bez cookies.
                    Dziś: <strong class="text-main"><?= $h::number((int) $today['pageviews']) ?></strong> odsłon,
                    <strong class="text-main"><?= $h::number((int) $today['uniques']) ?></strong> gości,
                    <strong class="text-main"><?= $h::number((int) $today['downloads']) ?></strong> pobrań.
                </p>
            </div>
            <div class="dashboard-header-actions">
                <div class="btn-group" role="group" aria-label="Zakres danych">
                    <?php foreach (StatsDashboardData::RANGES as $option): ?>
                        <?php // .btn-outline-soft jest modyfikatorem obrysu KOLOROWEGO
                              // (w SCSS siedzi wewnątrz .btn-outline-<kolor>) - samo
                              // z .btn nie ma czego zmiękczyć i zostałoby bez ramki. ?>
                        <a href="?range=<?= $option ?>"
                           class="btn-sm <?= $option === $range ? 'btn-primary is-active' : 'btn-outline-primary btn-outline-soft' ?>"
                           <?= $option === $range ? 'aria-current="true"' : '' ?>><?= $option ?> dni</a>
                    <?php endforeach; ?>
                </div>
                <label class="theme-switch" title="Przełącz motyw (jasny/ciemny)">
                    <input type="checkbox" id="theme-toggle" class="theme-switch-input">
                    <div class="theme-switch-track">
                        <span class="theme-switch-thumb"></span>
                        <div class="theme-icon-wrapper">
                            <svg class="theme-icon icon-sun" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256"><path d="M120,40V16a8,8,0,0,1,16,0V40a8,8,0,0,1-16,0Zm8,24a64,64,0,1,0,64,64A64.07,64.07,0,0,0,128,64ZM58.34,69.66A8,8,0,0,0,69.66,58.34l-16-16A8,8,0,0,0,42.34,53.66Zm0,116.68-16,16a8,8,0,0,0,11.32,11.32l16-16a8,8,0,0,0-11.32-11.32ZM192,72a8,8,0,0,0,5.66-2.34l16-16a8,8,0,0,0-11.32-11.32l-16,16A8,8,0,0,0,192,72Zm5.66,114.34a8,8,0,0,0-11.32,11.32l16,16a8,8,0,0,0,11.32-11.32ZM48,128a8,8,0,0,0-8-8H16a8,8,0,0,0,0,16H40A8,8,0,0,0,48,128Zm80,80a8,8,0,0,0-8,8v24a8,8,0,0,0,16,0V216A8,8,0,0,0,128,208Zm112-88H216a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16Z"></path></svg>
                        </div>
                        <div class="theme-icon-wrapper">
                            <svg class="theme-icon icon-moon" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256"><path d="M235.54,150.21a104.84,104.84,0,0,1-37,52.91A104,104,0,0,1,32,120,103.09,103.09,0,0,1,52.88,57.48a104.84,104.84,0,0,1,52.91-37,8,8,0,0,1,10,10,88.08,88.08,0,0,0,109.8,109.8,8,8,0,0,1,10,10Z"></path></svg>
                        </div>
                    </div>
                </label>
            </div>
        </div>

        <section id="przeglad" class="py-2">
            <div class="grid-md-cols-12 gap-3">
                <?php foreach ($data['tiles'] as $tile): ?>
                    <div class="col-md-span-3">
                        <div class="card stat-tile h-100">
                            <div class="stat-tile-icon <?= $h::esc((string) $tile['iconVariant']) ?>">
                                <?= $h::icon($spriteHref, (string) $tile['icon'], 'icon icon-lg') ?>
                            </div>
                            <div class="stat-tile-body">
                                <span class="stat-tile-label"><?= $h::esc((string) $tile['label']) ?></span>
                                <span class="stat-tile-value"><?= $h::number((int) $tile['value']) ?></span>
                                <?= $h::delta($tile['delta'], $spriteHref, $context) ?>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </section>

        <section class="py-2">
            <div class="card">
                <div class="card-header d-flex align-items-center justify-content-between gap-2">
                    <span class="fw-bold text-4">Odsłony dzień po dniu</span>
                    <span class="badge badge-primary">szczyt: <?= $h::number($maxDay) ?></span>
                </div>
                <div class="card-body">
                    <?php if ($maxDay === 0): ?>
                        <div class="empty-state">
                            <div class="empty-state-icon"><?= $h::icon($spriteHref, 'ph-chart-bar', 'icon') ?></div>
                            <p class="m-0 text-muted">Brak odsłon w tym zakresie.</p>
                        </div>
                    <?php else: ?>
                        <div class="r-chart-wrapper" role="img"
                             aria-label="Wykres odsłon z ostatnich <?= $range ?> dni, szczyt <?= $maxDay ?> odsłon dziennie">
                            <div class="chart-sparkline">
                                <?php foreach ($perDay as $row): ?>
                                    <div class="sparkline-bar"
                                         style="--val: <?= $h::share((int) $row['hits'], $maxDay) ?>%"
                                         title="<?= $h::esc((string) $row['day']) ?>: <?= (int) $row['hits'] ?>"></div>
                                <?php endforeach; ?>
                            </div>
                        </div>
                        <div class="d-flex justify-content-between text-1 text-muted mt-2">
                            <span><?= $h::esc($h::shortDate((string) $perDay[0]['day'])) ?></span>
                            <span><?= $h::esc($h::shortDate((string) $perDay[count($perDay) - 1]['day'])) ?></span>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </section>

        <section id="tresci" class="py-2">
            <div class="grid-md-cols-12 gap-3">
                <div class="col-md-span-6">
                    <h2 class="text-4 fw-bold">Najczęstsze strony</h2>
                    <?= $table->render('Ścieżka', 'Odsłony', 'path', $data['topPages']) ?>
                </div>
                <div class="col-md-span-6">
                    <h2 class="text-4 fw-bold">Pobrane pliki</h2>
                    <?= $table->render('Plik', 'Pobrania', 'label', $data['topDownloads'], 'Nikt jeszcze nic nie pobrał w tym zakresie.') ?>
                </div>
            </div>
        </section>

        <section id="wyjscia" class="py-2">
            <h2 class="text-4 fw-bold">Kliknięcia w linki wychodzące</h2>
            <p class="text-2 text-muted">
                Cel zapisywany jako host i ścieżka, bez parametrów adresu.
                Liczone są kliknięcia, nie realne wizyty po drugiej stronie.
            </p>
            <?= $table->render('Cel', 'Kliknięcia', 'label', $data['topOutbound'], 'Brak kliknięć w linki zewnętrzne. Jeśli baza nie przeszła jeszcze migracji schema-upgrade-outbound.sql, te zdarzenia nie mają się gdzie zapisać.') ?>
        </section>

        <section id="urzadzenia" class="py-2">
            <h2 class="text-4 fw-bold">Urządzenia i przeglądarki</h2>
            <div class="grid-md-cols-12 gap-3">
                <?php foreach ($data['breakdowns'] as $breakdown): ?>
                    <?php $max = $h::maxHits($breakdown['rows']); ?>
                    <div class="col-md-span-4">
                        <div class="card h-100">
                            <div class="card-header fw-bold text-3"><?= $h::esc((string) $breakdown['title']) ?></div>
                            <div class="card-body">
                                <?php if (empty($breakdown['rows'])): ?>
                                    <p class="text-2 text-muted m-0">Brak danych.</p>
                                <?php endif; ?>
                                <?php foreach ($breakdown['rows'] as $row): ?>
                                    <div class="d-flex align-items-center gap-2">
                                        <span class="text-2" style="min-width: 92px"><?= $h::esc((string) $row['name']) ?></span>
                                        <div class="progress w-100">
                                            <div class="progress-bar" style="width: <?= $h::share((int) $row['hits'], $max) ?>%"></div>
                                        </div>
                                        <span class="text-2 fw-medium text-end" style="min-width: 48px"><?= $h::number((int) $row['hits']) ?></span>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </section>

        <section id="zrodla" class="py-2">
            <h2 class="text-4 fw-bold">Źródła ruchu (zewnętrzne)</h2>
            <?= $table->render('Host odsyłający', 'Odsłony', 'referrer_host', $data['topReferrers'], 'Brak zewnętrznych źródeł — wejścia bez odsyłacza (wpisane wprost, z zakładki) nie są tu liczone.') ?>
        </section>
    </main>
</div>
<script src="<?= $h::esc($scriptHref) ?>" defer></script>
</body>
</html>
