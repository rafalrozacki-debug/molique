<?php
/**
 * Molique Stats — DTO pojedynczego zdarzenia.
 * Jedna odpowiedzialność: przenieść komplet danych zdarzenia z kolektora
 * do repozytorium bez rozdmuchiwania listy argumentów.
 */

declare(strict_types=1);

namespace Molique\Stats;

if (!defined('MOLIQUE_STATS')) {
    exit;
}

final class StatEvent
{
    public function __construct(
        public readonly string $type,
        public readonly string $path,
        public readonly ?string $label,
        public readonly ?string $referrerHost,
        public readonly string $visitorHash,
        public readonly bool $isUnique,
        public readonly ClientEnvironment $env,
    ) {
    }
}
