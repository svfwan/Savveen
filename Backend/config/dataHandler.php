<?php
include('../config/dbaccess.php');
class dataHandler
{
    private $db_obj;

    public function __construct()
    {
        global $host, $user, $password, $database;
        $this->db_obj = new mysqli($host, $user, $password, $database);
    }

    public function registerUser($param)
    {
        $result = array();
        $person = $param;

        // authenticate user input
        if (empty($person['firstName']) || strlen(trim($person['firstName'])) == 0) {
            $result['error'] = 'Bitte geben Sie einen validen Vornamen ein!';
            return $result;
        }
        if (empty($person['lastName']) || strlen(trim($person['lastName'])) == 0) {
            $result['error'] = 'Bitte geben Sie einen validen Nachnamen ein!';
            return $result;
        }
        if (empty($param['address']) || !isset($param['address']) || strlen(trim($param['address'])) == 0) {
            $result['error'] = 'Bitte geben Sie eine valide Adresse ein!';
        }
        if (empty($param['postcode']) || !isset($param['postcode']) || strlen(trim($param['postcode'])) == 0) {
            $result['error'] = 'Bitte geben Sie eine valide Postleitzahl ein!';
        }
        if (empty($param['city']) || !isset($param['city']) || strlen(trim($param['city'])) == 0) {
            $result['error'] = 'Bitte geben Sie einen validen Ort ein!';
        }
        if (empty($person['email']) || strlen(trim($person['email'])) == 0 || !filter_var($this->test_input($person["email"]), FILTER_VALIDATE_EMAIL)) {
            $result['error'] = 'Bitte geben Sie eine valide E-Mail ein!';
            return $result;
        }
        if (empty($person['username']) || strlen(trim($person['username'])) == 0) {
            $result['error'] = 'Bitte geben Sie einen validen Username ein!';
            return $result;
        }
        if (empty($person['password']) || strlen(trim($person['password'])) == 0 || strlen(trim($person['password'])) < 8) {
            $result['error'] = 'Bitte geben Sie ein Passwort mit mindestens 8 Zeichen ein!';
            return $result;
        }

        // prevent JS-Injection and hash password
        $fod = htmlspecialchars($person['formofAddress'], ENT_QUOTES);
        $fname = htmlspecialchars($person['firstName'], ENT_QUOTES);
        $sname = htmlspecialchars($person['lastName'], ENT_QUOTES);
        $address = htmlspecialchars($person['address'], ENT_QUOTES);
        $postcode = htmlspecialchars($person['postcode'], ENT_QUOTES);
        $city = htmlspecialchars($person['city'], ENT_QUOTES);
        $mail = htmlspecialchars($person['email'], ENT_QUOTES);
        $uname = htmlspecialchars($person['username'], ENT_QUOTES);
        $pass = htmlspecialchars(password_hash($person['password'], PASSWORD_DEFAULT), ENT_QUOTES);


        // prepared statement and check if user name exists
        if (!$this->checkConnection()) {
            $result['error'] = 'Registrierung fehlgeschlagen, versuchen Sie es später erneut';
            return $result;
        }


        $sql = 'INSERT INTO `users` (`anrede`, `vorname`, `nachname`, `adresse`, `plz`, `ort`, `email`, `username`, `passwort`) 
        SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?
        FROM DUAL
        WHERE NOT EXISTS (SELECT * FROM `users` WHERE `username` = ?)';


        $stmt = $this->db_obj->prepare($sql);
        $stmt->bind_param('ssssssssss', $fod, $fname, $sname, $address, $postcode, $city, $mail, $uname, $pass, $uname);

        // if executed and a row affected return success message, else return error message
        if ($stmt->execute() && $stmt->affected_rows > 0) {
            $result['success'] = 'Neuer Benutzer erstellt!';
        } else {
            $result['error'] = 'Benutzername existiert bereits!';
        }

        $stmt->close();

        return $result;
    }

    public function loginUser($param)
    {
        $result = array();
        $username = $param['username'];
        $password = $param['password'];

        // add validation of input

        if (!$this->checkConnection()) {
            $result['error'] = 'Login nicht möglich, versuchen Sie es später erneut!';
        }

        $sql = 'SELECT `username`, `passwort`, `admin` FROM `users` WHERE `username` = ? LIMIT 1';
        $stmt = $this->db_obj->prepare($sql);
        $stmt->bind_param('s', $username);

        if ($stmt->execute()) {
            $user = $stmt->get_result();
            if ($user->num_rows == 1) {
                $row = $user->fetch_assoc();
                if (password_verify($password, $row['passwort'])) {
                    $result['success'] = 'Login erfolgreich, willkommen ' . $username;
                    $result['username'] = $username;
                    $result['admin'] = $row['admin'];
                    session_start();
                    $_SESSION['username'] = $username;
                    $_SESSION['admin'] = $row['admin'];
                    if (isset($param['rememberLogin']) && $param['rememberLogin']) {
                        // Set cookies with the username and admin status
                        setcookie('username', $username, time() + (86400 * 30), '/');
                        setcookie('admin', $row['admin'], time() + (86400 * 30), '/');
                    }
                } else {
                    $result['error'] = 'Falsches Passwort!';
                }
            } else {
                $result['error'] = 'Benutzername nicht gefunden!';
            }
        } else {
            $result['error'] = 'Login nicht möglich, versuchen Sie es später erneut!';
        }

        $stmt->close();
        return $result;
    }

    public function getSessionInfo()
    {
        $result = array();
        session_start();
        if (isset($_SESSION['username']) && isset($_SESSION['admin'])) {
            $result['loggedIn'] = true;
            $result['username'] = $_SESSION['username'];
            $result['admin'] = $_SESSION['admin'];
        } else {
            $result['loggedIn'] = false;
        }
        return $result;
    }

    public function logoutUser()
    {
        session_destroy();
        $result['loggedIn'] = false;
        return $result;
    }



    // helper functions

    private function checkConnection()
    {
        if ($this->db_obj->connect_error) {
            return false;
        } else {
            return true;
        }
    }

    private function test_input($data)
    {
        $data = trim($data);
        $data = stripslashes($data);
        $data = htmlspecialchars($data);
        return $data;
    }
}
