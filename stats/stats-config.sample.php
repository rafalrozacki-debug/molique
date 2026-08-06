<?php
/**
 * Molique Stats — konfiguracja.
 *
 * INSTRUKCJA:
 *   1. Skopiuj ten plik jako  stats-config.php  (w tym samym folderze).
 *   2. Uzupełnij dane bazy, sekret i login do panelu.
 *   3. Nigdy nie commituj  stats-config.php  do repo (dodaj do .gitignore).
 *
 * Hash hasła do panelu wygeneruj raz w konsoli:
 *   php -r "echo password_hash('twoje-haslo', PASSWORD_DEFAULT), PHP_EOL;"
 */

declare(strict_types=1);

return [
    // --- Baza danych ---
    'db' => [
        'host'    => 'localhost',
        'name'    => 'molique_stats',
        'user'    => 'DB_USER',
        'pass'    => 'DB_PASSWORD',
        'charset' => 'utf8mb4',
    ],

    // Sekret do hashowania odcisku gościa. Długi, losowy ciąg.
    // Wygeneruj np.:  php -r "echo bin2hex(random_bytes(32)), PHP_EOL;"
    // ZMIANA tej wartości = reset liczenia unikalnych gości (stare hashe przestają pasować).
    'fingerprint_secret' => 'WSTAW_TU_DLUGI_LOSOWY_SEKRET',

    // Hosty, z których wolno przyjmować zdarzenia (ochrona przed spamem cross-site).
    'allowed_hosts' => [
        'molique.dev',
        'www.molique.dev',
        'localhost',      // do testów lokalnych — usuń na produkcji, jeśli chcesz
    ],

    // Strefa czasowa (spójna dla created_at, day_bucket i rotacji soli).
    'timezone' => 'Europe/Warsaw',

    // Skąd czytać kod kraju (2 litery), jeśli hosting/CDN go wystawia.
    // Pierwsze trafienie wygrywa. Pusta tablica [] => wartości domyślne z ClientEnvironment.
    // Uruchom _geo-probe.php na serwerze, żeby zobaczyć, czy hostido coś tu wystawia.
    // Jeśli NIC — kolumna "Kraj" zostaje pusta (reszta statystyk działa normalnie).
    'country_server_keys' => [
        'HTTP_CF_IPCOUNTRY',
        'GEOIP_COUNTRY_CODE',
        'GEOIP_COUNTRY_CODE_V6',
        'MM_COUNTRY_CODE',
        'HTTP_X_GEOIP_COUNTRY',
    ],

    // Lokalna baza GeoLite2 Country (opcja B — kraj z IP, bez podmiotów trzecich).
    // Ścieżka do pliku .mmdb na serwerze. Pusty '' => wyłączone (kraj tylko ze zmiennych wyżej).
    // Plik pobierasz z konta MaxMind i kładziesz w stats/geoip/ — patrz instrukcja.
    'geolite2_db' => __DIR__ . '/geoip/GeoLite2-Country.mmdb',

    // --- Panel podglądu (dashboard.php) ---
    'dashboard' => [
        'user'          => 'admin',
        // Hash wygenerowany przez password_hash() — NIE hasło jawne.
        'password_hash' => '$2y$10$WSTAW_TU_HASH_Z_PASSWORD_HASH',
    ],

    // Arkusze molique dla panelu (kolejność ma znaczenie). RDZEŃ JEST WYMAGANY:
    // bundle admina zawiera wyłącznie moduł panelu (layout, sidebar, nawigacja,
    // dashboard header) i sam z siebie nie ma grida, kart, tabel ani klas
    // narzędziowych. Pusta tablica [] => te same dwa arkusze co niżej.
    'dashboard_css' => [
        '/css/molique-style.css',
        '/css/molique-style-admin.css',
    ],

    // Rdzeń JS molique (przełącznik motywu i zwijanie sidebara w panelu)
    // oraz sprite z ikonami. Puste/nieistniejące => panel działa dalej,
    // tylko bez przełącznika motywu i bez ikon.
    'dashboard_script' => '/js/molique-script.js',
    'dashboard_sprite' => '/img/icons-sprite.svg',
];
