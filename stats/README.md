# Molique Stats

Lekkie, bezcookiesowe statystyki wejść, pobrań i wyjść dla molique.dev.
Zero cookies, zero `localStorage`, brak surowego IP w bazie — nie wymaga
baneru zgody (wystarczy wzmianka w polityce prywatności).

## Zbierane zdarzenia

| Typ | Kiedy | Etykieta w bazie (`label`) |
|---|---|---|
| `pageview` | załadowanie strony | — |
| `download` | klik w link z `download`/`data-stat-download` albo o rozszerzeniu pliku | nazwa pliku |
| `outbound` | klik w link na inną domenę (np. GitHub) | `host/ścieżka` celu, bez query |

## Struktura

```
stats/
├─ collect.php                  # publiczny endpoint (odbiera beacony)
├─ dashboard.php                # panel podglądu (HTTP Basic Auth) — cienki kontroler
├─ molique-stats.js             # tracker do wpięcia w stronę
├─ bootstrap.php                # config + autoloader (Molique\Stats\ i MaxMind\Db\)
├─ schema.sql                   # tabela (świeża instalacja)
├─ schema-upgrade.sql           # migracja dla bazy sprzed dodania wymiarów
├─ schema-upgrade-outbound.sql  # migracja dodająca typ zdarzenia "outbound"
├─ stats-config.sample.php      # wzór konfiguracji → skopiuj do stats-config.php
├─ _geo-probe.php               # tymczasowa sonda GeoIP (skasuj po użyciu)
├─ src/                         # klasy (Database, Repository, Collector, panel, ...)
├─ views/                       # HTML panelu (bez logiki)
├─ lib/                         # (opcja B) biblioteka MaxMind wgrana bez composera
└─ geoip/                       # (opcja B) GeoLite2-Country.mmdb
```

## Instalacja — podstawa

1. **Baza:** `mysql -u USER -p molique_stats < schema.sql`
   (jeśli tabela już była: `... < schema-upgrade.sql`, a następnie
   `... < schema-upgrade-outbound.sql` — bez tego drugiego kolumna
   `event_type` nie zna wartości `outbound` i kliknięcia w linki
   zewnętrzne nie mają się gdzie zapisać).
2. **Konfiguracja:** skopiuj `stats-config.sample.php` → `stats-config.php`, uzupełnij:
   - dane bazy,
   - `fingerprint_secret`: `php -r "echo bin2hex(random_bytes(32));"`,
   - hash hasła panelu: `php -r "echo password_hash('haslo', PASSWORD_DEFAULT);"`.
3. **Tracker:** w layoucie strony, przed `</body>`:
   `<script src="/stats/molique-stats.js" defer></script>`.
4. **Deploy:** wgraj folder `stats/` do webroota na serwerze (to kod PHP —
   nie przechodzi przez build Vite, kopiujesz go osobno).
5. **Panel:** `https://molique.dev/stats/dashboard.php`
   (zakres danych: `?range=7`, `?range=30`, `?range=90`).

Pobrania łapane automatycznie po rozszerzeniu pliku; jawnie: `data-stat-download="nazwa"`.
Wyjścia (linki na inną domenę) łapane automatycznie, bez żadnego atrybutu.

**Panel wymaga DWÓCH arkuszy molique** — rdzenia (`molique-style.css`) i bundla
admina (`molique-style-admin.css`). Sam bundle admina zawiera wyłącznie moduł
panelu (layout, sidebar, nawigacja, dashboard header) i nie ma w nim grida,
kart, tabel ani klas narzędziowych. Ścieżki ustawia `dashboard_css`
w konfiguracji; `dashboard_script` i `dashboard_sprite` dokładają przełącznik
motywu i ikony.

## Kraj (opcja B — lokalna baza GeoLite2, bez podmiotów trzecich)

Reszta wymiarów (urządzenie, przeglądarka, system, breakpoint) działa bez tego.
Kraj wymaga bazy IP→kraj trzymanej na Twoim serwerze — IP nie wychodzi na zewnątrz.

### 1. Biblioteka MaxMind (bez composera)

- Pobierz źródła: <https://github.com/maxmind/MaxMind-DB-Reader-php> (Code → Download ZIP,
  lub najnowszy Release).
- Z archiwum skopiuj folder `src/MaxMind` do `stats/lib/`, tak aby powstało:
  `stats/lib/MaxMind/Db/Reader.php` (oraz `.../Db/Reader/Decoder.php` itd.).
- Autoloader w `bootstrap.php` sam to podłączy — nic więcej nie konfigurujesz.
- Jeśli WOLISZ composera: w folderze `stats/` uruchom `composer require maxmind-db/reader`
  (powstanie `vendor/`, które też wgrywasz). Bootstrap wykryje `vendor/autoload.php`.

> Jeśli zobaczysz błąd o dużych liczbach — włącz w PHP rozszerzenie `gmp` lub `bcmath`
> (do GeoLite2-Country zwykle niepotrzebne).

### 2. Baza GeoLite2-Country

- Załóż darmowe konto GeoLite2: <https://www.maxmind.com/en/geolite2/signup>.
- Pobierz **GeoLite2 Country** w formacie **MaxMind DB (.mmdb)**.
- Z archiwum `.tar.gz` wyjmij `GeoLite2-Country.mmdb` i połóż jako:
  `stats/geoip/GeoLite2-Country.mmdb`.
- Ścieżka jest już ustawiona w konfiguracji (`geolite2_db`).

### 3. Aktualizacja bazy

MaxMind odświeża dane ~2× w tygodniu. Dla małej strony: podmieniaj plik ręcznie
co 1–3 miesiące. Zaawansowane: narzędzie `geoipupdate` + klucz licencyjny w cronie na serwerze.

## Prywatność — granica

Wszystkie wymiary to grube kategorie (desktop/mobile, Chrome/Firefox, PL/DE,
xs–xl). To nie identyfikuje osoby i mieści się w modelu „bez zgody". Etykieta
zdarzenia `outbound` to adres NASZEGO własnego linku wychodzącego (host
i ścieżka celu, bez query) — jawna informacja o stronie, nie o odwiedzającym.
Query jest odcinane celowo: bywa nośnikiem parametrów kampanii i danych
osobowych. Nie dokładaj
cech wysokoentropijnych (dokładna wersja przeglądarki, miasto, rozdzielczość co do
piksela) — ich kombinacja tworzy odcisk przeglądarki, co wymaga już zgody i baneru.
