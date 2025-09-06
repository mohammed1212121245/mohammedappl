<?php
// Path to database folder
$dataDir = __DIR__ . '/data';
if(!is_dir($dataDir)){
    mkdir($dataDir, 0755, true);
}

$dbPath = $dataDir . '/planetpath.db';
$db = new SQLite3($dbPath);

// Create vehicles table if it doesn't exist
$db->exec("CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    plate TEXT NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL
)");

echo "Database initialized successfully at {$dbPath}\n";
?>
