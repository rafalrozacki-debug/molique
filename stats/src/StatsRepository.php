<?php
/**
 * Molique Stats — repozytorium zapisu.
 * Jedna odpowiedzialność: utrwalenie pojedynczego zdarzenia i rozstrzygnięcie,
 * czy to pierwsza wizyta danego gościa dzisiaj. Agregaty dla panelu leżą
 * w osobnej klasie (StatsReportRepository) — endpoint zbierający ich nie ładuje.
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
}
