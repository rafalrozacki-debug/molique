<?php
/**
 * Molique Stats — połączenie z bazą (PDO).
 * Jedna odpowiedzialność: dostarczyć skonfigurowaną instancję PDO.
 */

declare(strict_types=1);

namespace Molique\Stats;

if (!defined('MOLIQUE_STATS')) {
    exit;
}

use PDO;
use PDOException;

final class StatsDatabase
{
    private PDO $pdo;

    /**
     * @param array{host:string,name:string,user:string,pass:string,charset:string} $db
     */
    public function __construct(array $db)
    {
        $dsn = sprintf(
            'mysql:host=%s;dbname=%s;charset=%s',
            $db['host'],
            $db['name'],
            $db['charset'] ?? 'utf8mb4'
        );

        try {
            $this->pdo = new PDO($dsn, $db['user'], $db['pass'], [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
        } catch (PDOException $e) {
            // Nie ujawniamy szczegółów połączenia na zewnątrz.
            http_response_code(500);
            error_log('Molique Stats DB error: ' . $e->getMessage());
            exit;
        }
    }

    public function pdo(): PDO
    {
        return $this->pdo;
    }
}
