<?php
session_start();

if(isset($_POST['Anmelden'])) {

    $username = $_POST['username'];
    $password = $_POST['password'];

    $servername = "localhost";
    $dbusername = "username";
    $dbpassword = "password";
    $dbname = "savveen";

    $conn = new mysqli($servername, $dbusername, $dbpassword, $dbname);

    if ($conn->connect_error) {
        die("Verbindung fehlgeschlagen: " . $conn->connect_error);
    }

    $sql = "SELECT * FROM user WHERE (username='$username') AND password='$password'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        echo "Session Started";
        $row = $result->fetch_assoc();
        $_SESSION['user_id'] = $row['id'];
        $_SESSION['username'] = $row['username'];
        $_SESSION['email'] = $row['email'];
        $_SESSION['is_admin'] = $row['is_admin'];

        if(isset($_POST['remember_me'])) {

            $user_id = $row['id'];
            $password_hash = md5($row['password']);
            setcookie('user_id', $user_id, time() + (30 * 24 * 60 * 60), "/");
            setcookie('password_hash', $password_hash, time() + (30 * 24 * 60 * 60), "/");
        }

        //header('Location: index.html');
        exit();
    } else {

        echo "Benutzername oder Passwort ungültig!";
    }

    $conn->close();
}
?>