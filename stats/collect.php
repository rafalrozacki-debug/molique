<?php
/**
 * Molique Stats — publiczny endpoint zbierający zdarzenia.
 * Przyjmuje beacon (POST JSON) z molique-stats.js i deleguje do kolektora.
 * Zawsze kończy szybko i bez treści — statystyki nie mogą spowalniać strony.
 */

declare(strict_types=1);

use Molique\Stats\ClientEnvironment;
use Molique\Stats\CountryLocator;
use Molique\Stats\GeoLite2CountryReader;
use Molique\Stats\StatsCollector;
use Molique\Stats\StatsDatabase;
use Molique\Stats\StatsRepository;
use Molique\Stats\VisitorFingerprint;

/** @var array $config */
$config = require __DIR__ . '/bootstrap.php';

$database    = new StatsDatabase($config['db']);
$repository  = new StatsRepository($database);
$fingerprint = new VisitorFingerprint($config['fingerprint_secret']);

// Lokator kraju: najpierw zmienne serwera, potem lokalna baza GeoLite2 (jeśli jest).
$geoReader      = new GeoLite2CountryReader((string) ($config['geolite2_db'] ?? ''));
$countryLocator = new CountryLocator(
    $config['country_server_keys'] ?? CountryLocator::DEFAULT_SERVER_KEYS,
    $geoReader
);

$collector = new StatsCollector($repository, $fingerprint, $countryLocator, $config['allowed_hosts']);
$collector->handle();
