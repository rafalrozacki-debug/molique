<?php
/**
 * Molique Stats — repozytorium.
 * Jedna odpowiedzialność: wszystkie zapytania do bazy (zapis zdarzeń
 * oraz agregaty do panelu). Wyłącznie przez PDO::prepare().
 */

declare(strict_types=1);

namespace Molique\Stats;

if (!defined('MOLIQUE_STATS')) {
    exit;
}

use PDO;

final class StatsRepository
{
    private PDO $pdo;

    public function __construct(StatsDatabase $database)
    {
        $this->pdo = $database->pdo();
    }

    /** Czy ten gość ma dziś już jakiekolwiek zdarzenie? Do liczenia unikalnych. */
    public function isFirstVisitToday(string $visitorHash): bool
    {
        $stmt = $this->pdo->prepare(
            'SELECT 1 FROM stat_events
             WHERE visitor_hash = :h AND day_bucket = CURDATE() LIMIT 1'
        );
        $stmt->execute([':h' => $visitorHash]);

        return $stmt->fetchColumn() === false;
    }

    public function recordEvent(StatEvent $event): void
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO stat_events
                (event_type, path, label, referrer_host, visitor_hash, is_unique,
                 device_type, browser, os, country, viewport, created_at, day_bucket)
             VALUES
                (:type, :path, :label, :ref, :hash, :uniq,
                 :device, :browser, :os, :country, :viewport, :created, :day)'
        );
        $stmt->execute([
            ':type'     => $event->type,
            ':path'     => $event->path,
            ':label'    => $event->label,
            ':ref'      => $event->referrerHost,
            ':hash'     => $event->visitorHash,
            ':uniq'     => $event->isUnique ? 1 : 0,
            ':device'   => $event->env->deviceType,
            ':browser'  => $event->env->browser,
            ':os'       => $event->env->os,
            ':country'  => $event->env->country,
            ':viewport' => $event->env->viewport,
            ':created'  => date('Y-m-d H:i:s'),
            ':day'      => date('Y-m-d'),
        ]);
    }

    // --- Zapytania dla panelu ---

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

    public function countLastDays(string $type, int $days): int
    {
        $stmt = $this->pdo->prepare(
            'SELECT COUNT(*) FROM stat_events
             WHERE event_type = :t
               AND day_bucket >= (CURDATE() - INTERVAL :d DAY)'
        );
        $stmt->bindValue(':t', $type, PDO::PARAM_STR);
        $stmt->bindValue(':d', $days - 1, PDO::PARAM_INT);
        $stmt->execute();

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

    /** @return array<int, array{label:string, hits:int}> */
    public function topDownloads(int $days, int $limit): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT label, COUNT(*) AS hits FROM stat_events
             WHERE event_type = "download" AND label IS NOT NULL
               AND day_bucket >= (CURDATE() - INTERVAL :d DAY)
             GROUP BY label ORDER BY hits DESC LIMIT :lim'
        );
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
        $allowed = ['device_type', 'browser', 'os', 'country', 'viewport'];
        if (!in_array($dimension, $allowed, true)) {
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

    /** @return array<int, array{day_bucket:string, hits:int}> odsłony wg dnia, rosnąco. */
    public function pageviewsPerDay(int $days): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT day_bucket, COUNT(*) AS hits FROM stat_events
             WHERE event_type = "pageview"
               AND day_bucket >= (CURDATE() - INTERVAL :d DAY)
             GROUP BY day_bucket ORDER BY day_bucket ASC'
        );
        $stmt->bindValue(':d', $days - 1, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }
}
