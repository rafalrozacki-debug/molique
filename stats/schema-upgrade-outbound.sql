-- Molique Stats — migracja: zdarzenie "outbound" (kliknięcia w linki zewnętrzne).
-- Uruchom na istniejącej bazie PO wgraniu nowej wersji plików stats/:
--   mysql -u USER -p BAZA < schema-upgrade-outbound.sql
-- (Świeża instalacja ze schema.sql ma już jedno i drugie — tego pliku nie uruchamiaj.)
--
-- UWAGA na kolejność: dopóki ENUM nie zna wartości 'outbound', MySQL odrzuca
-- INSERT z takim typem (w trybie ścisłym) albo zapisuje pusty ciąg (bez niego).
-- Zdarzenia wyjść zaczną się liczyć dopiero po tej migracji.

ALTER TABLE `stat_events`
    MODIFY COLUMN `event_type` ENUM('pageview','download','outbound') NOT NULL;

-- Indeks pod agregaty panelu (TOP pobrań i TOP wyjść w oknie czasowym).
-- Jeśli już istnieje, MySQL zgłosi błąd "Duplicate key name" — można go zignorować.
ALTER TABLE `stat_events`
    ADD KEY `idx_type_label_day` (`event_type`, `label`(64), `day_bucket`);
