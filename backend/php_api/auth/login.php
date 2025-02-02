<?php
require_once '../../config/db.php';

function login($username, $password) {
    $pdo = getConnection();
    if (checkUsername($username)){
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = :username");
        $stmt->execute(["username" => $username]);
        $user = $stmt->fetch();
        if ($user && password_verify($password, $user['password'])) {
            // Start session and store user data
            //session_start();
            //$_SESSION['user_id'] = $user['user_id'];
            //$_SESSION['username'] = $user['username'];
            return "Login successful";
        } else {
            return "Invalid password";
        }
    }
    else {
        return "User doesn't exist";
    }
}

?>