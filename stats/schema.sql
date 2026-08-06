-- Molique Stats — schemat tabeli zdarzeń.
-- Import jednorazowy: mysql -u USER -p BAZA < schema.sql
-- albo wklej w phpMyAdmin (zakładka SQL).

CREATE TABLE IF NOT EXISTS `stat_events` (
    `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `event_type`    ENUM('pageview','download','outbound') NOT NULL,
    `path`          VARCHAR(255) NOT NULL,
    `label`         VARCHAR(255) NULL DEFAULT NULL,   -- download: nazwa pliku, outbound: host+ścieżka celu
    `referrer_host` VARCHAR(255) NULL DEFAULT NULL,   -- host odsyłający (bez ścieżki i query)
    `visitor_hash`  CHAR(64) NOT NULL,                -- anonimowy, rotowany co dobę
    `is_unique`     TINYINT(1) NOT NULL DEFAULT 0,    -- pierwsze zdarzenie tego gościa danego dnia
    -- Grube, anonimowe kategorie (nie identyfikują osoby):
    `device_type`   VARCHAR(16) NULL DEFAULT NULL,    -- desktop / mobile / tablet
    `browser`       VARCHAR(24) NULL DEFAULT NULL,    -- Chrome / Firefox / Safari / ...
    `os`            VARCHAR(24) NULL DEFAULT NULL,     -- Windows / Android / iOS / ...
    `country`       CHAR(2) NULL DEFAULT NULL,        -- kod ISO (bez miasta, bez IP)
    `viewport`      VARCHAR(8) NULL DEFAULT NULL,      -- kubełek breakpointu: xs/sm/md/lg/xl
    `created_at`    DATETIME NOT NULL,
    `day_bucket`    DATE NOT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_day` (`day_bucket`),
    KEY `idx_type_day` (`event_type`, `day_bucket`),
    KEY `idx_visitor_day` (`visitor_hash`, `day_bucket`),
    KEY `idx_country_day` (`country`, `day_bucket`),
    KEY `idx_device_day` (`device_type`, `day_bucket`),
    -- Panel grupuje pobrania i wyjścia po etykiecie w oknie czasowym; bez tego
    -- indeksu MySQL musi przy każdym odświeżeniu skanować całą tabelę.
    KEY `idx_type_label_day` (`event_type`, `label`(64), `day_bucket`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
