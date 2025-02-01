
<?php
$database_host = "localhost";
$database_user = "root";
$database_pass = "";
$database_name = "db";

try {
    $pdo = new PDO("mysql:host=$database_host;dbname=$database_name", $database_user, $database_pass);
    // Setting PDO to throw exceptions on error
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Setting default fetch mode to associative array
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
    // Creating a function to get the database connection
    function getConnection() {
        global $pdo;
        return $pdo;
    }
    
    // Function to test the connection with a query
    function testConnection() {
        global $pdo;
        $stmt = $pdo->query("SELECT COUNT(*) FROM users");
        return $stmt->fetchColumn();
    }
    
} catch(Exception $e) {
    die("Error: " . $e->getMessage());
}
?>
