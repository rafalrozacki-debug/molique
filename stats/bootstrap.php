<?php
/**
 * Molique Stats — bootstrap.
 * Wczytuje konfigurację, ustawia autoloader klas z src/ i strefę czasową.
 * Dołączany przez collect.php oraz dashboard.php.
 */

declare(strict_types=1);

define('MOLIQUE_STATS', true);

$configPath = __DIR__ . '/stats-config.php';
if (!is_file($configPath)) {
    http_response_code(500);
    exit('Molique Stats: brak pliku stats-config.php (skopiuj ze stats-config.sample.php).');
}

/** @var array $config */
$config = require $configPath;

date_default_timezone_set($config['timezone'] ?? 'UTC');

// Jeśli używasz composera (composer require maxmind-db/reader) — użyj jego autoloadera.
$composerAutoload = __DIR__ . '/vendor/autoload.php';
if (is_file($composerAutoload)) {
    require $composerAutoload;
}

// Prosty autoloader PSR-4:
//   Molique\Stats\ → src/         (nasze klasy)
//   MaxMind\Db\    → lib/MaxMind/Db/  (biblioteka MaxMind wgrana bez composera)
spl_autoload_register(static function (string $class): void {
    static $map = [
        'Molique\\Stats\\' => __DIR__ . '/src/',
        'MaxMind\\Db\\'    => __DIR__ . '/lib/MaxMind/Db/',
    ];
    foreach ($map as $prefix => $base) {
        if (strncmp($class, $prefix, strlen($prefix)) !== 0) {
            continue;
        }
        $relative = substr($class, strlen($prefix));
        $file = $base . str_replace('\\', '/', $relative) . '.php';
        if (is_file($file)) {
            require $file;
        }
        return;
    }
});

return $config;
