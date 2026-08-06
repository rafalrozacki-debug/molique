<?php
/**
 * Molique Stats — renderer tabeli rankingowej.
 *
 * Jedna odpowiedzialność: zamiana listy par (etykieta, liczba trafień)
 * na tabelę molique. Wszystkie cztery zestawienia panelu (strony, pobrania,
 * wyjścia, źródła) mają ten sam kształt, więc mają jeden renderer zamiast
 * czterech niemal identycznych bloków HTML w widoku.
 *
 * data-label w każdej komórce jest obowiązkowe — .table-cards bierze etykiety
 * mobilnych "kart" WYŁĄCZNIE stamtąd, nie potrafi ich odczytać z <th>.
 */

declare(strict_types=1);

namespace Molique\Stats;

if (!defined('MOLIQUE_STATS')) {
    exit;
}

final class StatsTableRenderer
{
    private string $spriteHref;

    public function __construct(string $spriteHref)
    {
        $this->spriteHref = $spriteHref;
    }

    /**
     * @param array<int, array<string, mixed>> $rows wiersze z kolumną 'hits'
     * @param string $labelKey nazwa kolumny z etykietą (path|label|referrer_host)
     */
    public function render(string $labelHeading, string $valueHeading, string $labelKey, array $rows, string $emptyText = 'Brak danych.'): string
    {
        if ($rows === []) {
            return $this->emptyState($emptyText);
        }

        $max  = StatsHtml::maxHits($rows);
        $body = '';
        foreach ($rows as $row) {
            $hits  = (int) $row['hits'];
            $body .= '<tr>'
                  . '<td data-label="' . StatsHtml::esc($labelHeading) . '">'
                  . '<span class="text-2">' . StatsHtml::esc((string) ($row[$labelKey] ?? '')) . '</span>'
                  . '</td>'
                  . '<td data-label="' . StatsHtml::esc($valueHeading) . '">'
                  . '<div class="d-flex align-items-center gap-2">'
                  . '<div class="progress w-100"><div class="progress-bar" style="width: '
                  . StatsHtml::share($hits, $max) . '%"></div></div>'
                  . '<span class="fw-medium text-end" style="min-width: 48px">' . StatsHtml::number($hits) . '</span>'
                  . '</div>'
                  . '</td>'
                  . '</tr>';
        }

        return '<div class="table-wrapper"><table class="table table-hover table-cards">'
             . '<thead class="thead-light"><tr>'
             . '<th>' . StatsHtml::esc($labelHeading) . '</th>'
             . '<th>' . StatsHtml::esc($valueHeading) . '</th>'
             . '</tr></thead><tbody>' . $body . '</tbody></table></div>';
    }

    private function emptyState(string $text): string
    {
        return '<div class="empty-state">'
             . '<div class="empty-state-icon">' . StatsHtml::icon($this->spriteHref, 'ph-folder', 'icon') . '</div>'
             . '<p class="m-0 text-muted">' . StatsHtml::esc($text) . '</p>'
             . '</div>';
    }
}
