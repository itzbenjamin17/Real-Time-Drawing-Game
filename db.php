<?php
$database_host = "dbhost.cs.man.ac.uk";
$database_user = "j01875ba";
$database_pass = "HNPefv9ojBnx5TQ+QhoZOfHR6DF9jDDwYAYoiO5jXw0";
$database_name = "2024_comp10120_z9";



try
{
    $pdo = new PDO("mysql:host=$database_host;dbname=$database_name", $database_user, $database_pass);
}
catch(Exception $e)
{
    die("Error" . $e->getMessage());
}



?>