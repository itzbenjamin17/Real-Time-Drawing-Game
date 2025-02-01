<?php
require_once "../../config/db.php";

function registerUser($username, $password, $email) {
    $pdo = getConnection();
    if (checkEmail($email)) {
        return "Email already in use";
    }
    if (checkUsername($username)) {
        return "Username already in use, please choose another one";
    }
   
    $stmt = $pdo->prepare("INSERT INTO users (username, password) VALUES (:username, :password)");
    $stmt->execute([
        "username" => $username,
        // Hashing the password using bcrypt (this can change in the future as php updates algorithms as time goes on)
        "password" => password_hash($password, PASSWORD_DEFAULT),
        "email" => $email
    ]);
}

function checkEmail($email) {
    $pdo = getConnection();
    $checkEmail = $pdo->prepare("SELECT * FROM users WHERE email = :email");
    $result = $checkEmail->execute([
        "email" => $email
    ]);
    return $checkEmail->rowCount() > 0;;
}

function checkUsername($username) {
    $pdo = getConnection();
    $checkUsername = $pdo->prepare("SELECT * FROM users WHERE username = :username");
    $result = $checkUsername->execute([
        "username" => $username
    ]);
    return $checkUsername->rowCount() > 0;
}
?>