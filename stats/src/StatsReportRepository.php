<?php
/**
 * Molique Stats — repozytorium raportów (tylko odczyt).
 * Jedna odpowiedzialność: agregaty dla panelu podglądu. Wszystkie okna czasowe
 * liczone są tak samo — przez periodBounds(), żeby "poprzedni okres" (do delty)
 * nigdy nie rozjechał się z bieżącym o dzień.
 */

declare(strict_types=1);

namespace Molique\Stats;

if (!defined('MOLIQUE_STATS')) {
    exit;
}

use PDO;

final class StatsReportRepository
{
    /** Wymiary, po których wolno grupować — nazwa kolumny NIGDY nie pochodzi z wejścia. */
    private const DIMENSIONS = ['device_type', 'browser', 'os', 'country', 'viewport'];

    private PDO $pdo;

    public function __construct(StatsDatabase $database)
    {
        $this->pdo = $database->pdo();
    }

    /**
     * Granice okna w dniach wstecz od dziś.
     * $shift = 0 → okres bieżący, 1 → poprzedni okres tej samej długości.
     * @return array{0:int,1:int} [ile dni wstecz zaczyna się okno, ile dni wstecz się kończy]
     */
    private function periodBounds(int $days, int $shift): array
    {
        return [$days * ($shift + 1) - 1, $days * $shift];
    }

    public function countInPeriod(string $type, int $days, int $shift = 0): int
    {
        [$from, $to] = $this->periodBounds($days, $shift);
        $stmt = $this->pdo->prepare(
            'SELECT COUNT(*) FROM stat_events
             WHERE event_type = :t
               AND day_bucket BETWEEN (CURDATE() - INTERVAL :from DAY)
                                  AND (CURDATE() - INTERVAL :to DAY)'
        );
        $stmt->bindValue(':t', $type, PDO::PARAM_STR);
        $stmt->bindValue(':from', $from, PDO::PARAM_INT);
        $stmt->bindValue(':to', $to, PDO::PARAM_INT);
        $stmt->execute();

        return (int) $stmt->fetchColumn();
    }

    public function uniquesInPeriod(int $days, int $shift = 0): int
    {
        [$from, $to] = $this->periodBounds($days, $shift);
        $stmt = $this->pdo->prepare(
            'SELECT COUNT(DISTINCT visitor_hash) FROM stat_events
             WHERE day_bucket BETWEEN (CURDATE() - INTERVAL :from DAY)
                                  AND (CURDATE() - INTERVAL :to DAY)'
        );
        $stmt->bindValue(':from', $from, PDO::PARAM_INT);
        $stmt->bindValue(':to', $to, PDO::PARAM_INT);
        $stmt->execute();

        return (int) $stmt->fetchColumn();
    }

    /**
     * Kliknięcia w linki wychodzące na konkretny host (etykieta to "host/ścieżka",
     * więc trafienie = dokładny host albo host z dowolną ścieżką).
     */
    public function countOutboundHost(string $host, int $days, int $shift = 0): int
    {
        [$from, $to] = $this->periodBounds($days, $shift);
        $stmt = $this->pdo->prepare(
            'SELECT COUNT(*) FROM stat_events
             WHERE event_type = "outbound"
               AND (label = :host OR label LIKE :prefix)
               AND day_bucket BETWEEN (CURDATE() - INTERVAL :from DAY)
                                  AND (CURDATE() - INTERVAL :to DAY)'
        );
        $stmt->bindValue(':host', $host, PDO::PARAM_STR);
        $stmt->bindValue(':prefix', $host . '/%', PDO::PARAM_STR);
        $stmt->bindValue(':from', $from, PDO::PARAM_INT);
        $stmt->bindValue(':to', $to, PDO::PARAM_INT);
        $stmt->execute();

        return (int) $stmt->fetchColumn();
    }

    public function countToday(string $type): int
    {
        $stmt = $this->pdo->prepare(
            'SELECT COUNT(*) FROM stat_events
             WHERE event_type = :t AND day_bucket = CURDATE()'
        );
        $stmt->execute([':t' => $type]);

        return (int) $stmt->fetchColumn();
    }

    public function uniquesToday(): int
    {
        $stmt = $this->pdo->query(
            'SELECT COUNT(DISTINCT visitor_hash) FROM stat_events
             WHERE day_bucket = CURDATE()'
        );

        return (int) $stmt->fetchColumn();
    }

    /** @return array<int, array{path:string, hits:int}> */
    public function topPages(int $days, int $limit): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT path, COUNT(*) AS hits FROM stat_events
             WHERE event_type = "pageview"
               AND day_bucket >= (CURDATE() - INTERVAL :d DAY)
             GROUP BY path ORDER BY hits DESC LIMIT :lim'
        );
        $stmt->bindValue(':d', $days - 1, PDO::PARAM_INT);
        $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    /**
     * TOP etykiet dla typu, który je ma: "download" (nazwa pliku)
     * albo "outbound" (host + ścieżka celu).
     * @return array<int, array{label:string, hits:int}>
     */
    public function topLabels(string $type, int $days, int $limit): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT label, COUNT(*) AS hits FROM stat_events
             WHERE event_type = :t AND label IS NOT NULL AND label <> ""
               AND day_bucket >= (CURDATE() - INTERVAL :d DAY)
             GROUP BY label ORDER BY hits DESC LIMIT :lim'
        );
        $stmt->bindValue(':t', $type, PDO::PARAM_STR);
        $stmt->bindValue(':d', $days - 1, PDO::PARAM_INT);
        $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    /** @return array<int, array{referrer_host:string, hits:int}> */
    public function topReferrers(int $days, int $limit): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT referrer_host, COUNT(*) AS hits FROM stat_events
             WHERE event_type = "pageview" AND referrer_host IS NOT NULL
               AND day_bucket >= (CURDATE() - INTERVAL :d DAY)
             GROUP BY referrer_host ORDER BY hits DESC LIMIT :lim'
        );
        $stmt->bindValue(':d', $days - 1, PDO::PARAM_INT);
        $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    /**
     * Rozbicie odsłon wg wymiaru (device_type|browser|os|country|viewport).
     * Nazwa kolumny bierze się WYŁĄCZNIE z whitelisty — nigdy z wejścia użytkownika.
     * @return array<int, array{name:string, hits:int}>
     */
    public function breakdown(string $dimension, int $days, int $limit): array
    {
        if (!in_array($dimension, self::DIMENSIONS, true)) {
            return [];
        }
        $stmt = $this->pdo->prepare(
            "SELECT `{$dimension}` AS name, COUNT(*) AS hits FROM stat_events
             WHERE event_type = 'pageview' AND `{$dimension}` IS NOT NULL
               AND day_bucket >= (CURDATE() - INTERVAL :d DAY)
             GROUP BY `{$dimension}` ORDER BY hits DESC LIMIT :lim"
        );
        $stmt->bindValue(':d', $days - 1, PDO::PARAM_INT);
        $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    /**
     * Odsłony wg dnia — ciągły szereg bez dziur: dni bez ruchu wracają z zerem,
     * żeby słupki wykresu odpowiadały kalendarzowi, a nie liście trafień.
     * @return array<int, array{day:string, hits:int}> rosnąco po dacie
     */
    public function pageviewsPerDay(int $days): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT day_bucket, COUNT(*) AS hits FROM stat_events
             WHERE event_type = "pageview"
               AND day_bucket >= (CURDATE() - INTERVAL :d DAY)
             GROUP BY day_bucket'
        );
        $stmt->bindValue(':d', $days - 1, PDO::PARAM_INT);
        $stmt->execute();

        $byDay = [];
        foreach ($stmt->fetchAll() as $row) {
            $byDay[(string) $row['day_bucket']] = (int) $row['hits'];
        }

        $series = [];
        for ($offset = $days - 1; $offset >= 0; $offset--) {
            $day      = date('Y-m-d', strtotime("-{$offset} day"));
            $series[] = ['day' => $day, 'hits' => $byDay[$day] ?? 0];
        }

        return $series;
    }
}
