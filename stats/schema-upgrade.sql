-- Molique Stats — migracja dla baz zaimportowanych PRZED dodaniem wymiarów.
-- Uruchom TYLKO jeśli tabela stat_events już istnieje bez tych kolumn.
--   mysql -u USER -p BAZA < schema-upgrade.sql
-- (Świeża instalacja ze schema.sql ma już te kolumny — tego pliku nie uruchamiaj.)

ALTER TABLE `stat_events`
    ADD COLUMN `device_type` VARCHAR(16) NULL DEFAULT NULL AFTER `is_unique`,
    ADD COLUMN `browser`     VARCHAR(24) NULL DEFAULT NULL AFTER `device_type`,
    ADD COLUMN `os`          VARCHAR(24) NULL DEFAULT NULL AFTER `browser`,
    ADD COLUMN `country`     CHAR(2)     NULL DEFAULT NULL AFTER `os`,
    ADD COLUMN `viewport`    VARCHAR(8)  NULL DEFAULT NULL AFTER `country`,
    ADD KEY `idx_country_day` (`country`, `day_bucket`),
    ADD KEY `idx_device_day` (`device_type`, `day_bucket`);
