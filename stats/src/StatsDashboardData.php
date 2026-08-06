<?php
/**
 * Molique Stats — zestaw danych dla panelu.
 *
 * Jedna odpowiedzialność: zebrać wszystkie agregaty potrzebne widokowi
 * i policzyć zmiany względem poprzedniego okresu tej samej długości.
 * Zero HTML tutaj, zero SQL — SQL siedzi w StatsReportRepository.
 */

declare(strict_types=1);

namespace Molique\Stats;

if (!defined('MOLIQUE_STATS')) {
    exit;
}

final class StatsDashboardData
{
    /** Dozwolone zakresy (dni) — panel przyjmuje wyłącznie te wartości z ?range=. */
    public const RANGES = [7, 30, 90];

    /** Host, którego kliknięcia dostają własny kafelek KPI. */
    public const FEATURED_OUTBOUND_HOST = 'github.com';

    private StatsReportRepository $repository;

    public function __construct(StatsReportRepository $repository)
    {
        $this->repository = $repository;
    }

    /** Sprowadza dowolne wejście z adresu do jednego z dozwolonych zakresów. */
    public static function normalizeRange(mixed $raw, int $default = 30): int
    {
        $days = is_numeric($raw) ? (int) $raw : $default;

        return in_array($days, self::RANGES, true) ? $days : $default;
    }

    /**
     * @return array{
     *   range:int,
     *   today:array{pageviews:int, uniques:int, downloads:int},
     *   tiles:array<int, array{label:string, value:int, icon:string, iconVariant:string, delta:?float}>,
     *   perDay:array<int, array{day:string, hits:int}>,
     *   topPages:array<int, array{path:string, hits:int}>,
     *   topDownloads:array<int, array{label:string, hits:int}>,
     *   topOutbound:array<int, array{label:string, hits:int}>,
     *   topReferrers:array<int, array{referrer_host:string, hits:int}>,
     *   breakdowns:array<int, array{title:string, rows:array<int, array{name:string, hits:int}>}>
     * }
     */
    public function build(int $days): array
    {
        return [
            'range' => $days,
            'today' => [
                'pageviews' => $this->repository->countToday('pageview'),
                'uniques'   => $this->repository->uniquesToday(),
                'downloads' => $this->repository->countToday('download'),
            ],
            'tiles'        => $this->buildTiles($days),
            'perDay'       => $this->repository->pageviewsPerDay($days),
            'topPages'     => $this->repository->topPages($days, 15),
            'topDownloads' => $this->repository->topLabels('download', $days, 15),
            'topOutbound'  => $this->repository->topLabels('outbound', $days, 15),
            'topReferrers' => $this->repository->topReferrers($days, 10),
            'breakdowns'   => $this->buildBreakdowns($days),
        ];
    }

    /** @return array<int, array{label:string, value:int, icon:string, iconVariant:string, delta:?float}> */
    private function buildTiles(int $days): array
    {
        $host = self::FEATURED_OUTBOUND_HOST;

        return [
            $this->tile(
                'Odsłony',
                $this->repository->countInPeriod('pageview', $days),
                $this->repository->countInPeriod('pageview', $days, 1),
                'ph-eye',
                ''
            ),
            $this->tile(
                'Unikalni goście',
                $this->repository->uniquesInPeriod($days),
                $this->repository->uniquesInPeriod($days, 1),
                'ph-user',
                'stat-tile-icon-info'
            ),
            $this->tile(
                'Pobrania paczki',
                $this->repository->countInPeriod('download', $days),
                $this->repository->countInPeriod('download', $days, 1),
                'ph-download-simple',
                'stat-tile-icon-success'
            ),
            $this->tile(
                'Kliknięcia w GitHub',
                $this->repository->countOutboundHost($host, $days),
                $this->repository->countOutboundHost($host, $days, 1),
                'ph-github-logo',
                'stat-tile-icon-warning'
            ),
        ];
    }

    /** @return array{label:string, value:int, icon:string, iconVariant:string, delta:?float} */
    private function tile(string $label, int $value, int $previous, string $icon, string $iconVariant): array
    {
        return [
            'label'       => $label,
            'value'       => $value,
            'icon'        => $icon,
            'iconVariant' => $iconVariant,
            'delta'       => $this->delta($value, $previous),
        ];
    }

    /**
     * Zmiana procentowa względem poprzedniego okresu.
     * null = brak punktu odniesienia (poprzedni okres pusty) — wtedy widok
     * nie pokazuje delty zamiast rysować mylące "+100%" przy starcie zbierania.
     */
    private function delta(int $current, int $previous): ?float
    {
        if ($previous <= 0) {
            return null;
        }

        return round(($current - $previous) / $previous * 100, 1);
    }

    /** @return array<int, array{title:string, rows:array<int, array{name:string, hits:int}>}> */
    private function buildBreakdowns(int $days): array
    {
        $dimensions = [
            'device_type' => 'Typ urządzenia',
            'viewport'    => 'Breakpoint (viewport)',
            'browser'     => 'Przeglądarka',
            'os'          => 'System',
            'country'     => 'Kraj',
        ];

        $result = [];
        foreach ($dimensions as $column => $title) {
            $result[] = [
                'title' => $title,
                'rows'  => $this->repository->breakdown($column, $days, 12),
            ];
        }

        return $result;
    }
}
