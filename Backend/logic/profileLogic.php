<?php
include('../config/dataHandler.php');
class profileLogic
{
    private $dh;

    public function __construct($dh)
    {
        $this->dh = $dh;
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
        if (!$this->dh->checkConnection()) {
            $result['error'] = 'Registrierung fehlgeschlagen, versuchen Sie es später erneut';
            return $result;
        }


        $sql = 'INSERT INTO `users` (`anrede`, `vorname`, `nachname`, `adresse`, `plz`, `ort`, `email`, `username`, `passwort`) 
        SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?
        FROM DUAL
        WHERE NOT EXISTS (SELECT * FROM `users` WHERE `username` = ?)';


        $stmt = $this->dh->db_obj->prepare($sql);
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
        $userInput = $param['userInput'];
        $password = $param['password'];
        $active = 1;

        if (!$this->dh->checkConnection()) {
            $result['error'] = 'Login nicht möglich, versuchen Sie es später erneut!';
        }

        if (empty($userInput)) {
            $result['error'] = 'Um dich einzuloggen, muss E-Mail oder Username angegeben werden';
            return $result;
        } else {
            $sql = 'SELECT `email`, `username`, `passwort`, `admin` FROM `users`
                     WHERE (`username`=? OR `email` = ?) AND `active` = ?';
            $stmt = $this->dh->db_obj->prepare($sql);
            $stmt->bind_param('ssi', $userInput, $userInput, $active);
        }

        if ($stmt->execute()) {
            $user = $stmt->get_result();
            if ($user->num_rows == 1) {
                $row = $user->fetch_assoc();
                if (password_verify($password, $row['passwort'])) {
                    $result['success'] = 'Login erfolgreich, willkommen ' . $row['username'] . '!';
                    $result['username'] = $row['username'];
                    $result['admin'] = $row['admin'];
                    if (!(isset($_SESSION))) {
                        session_start();
                    }
                    $_SESSION['username'] = $row['username'];
                    $_SESSION['admin'] = $row['admin'];
                    if (isset($param['rememberLogin']) && $param['rememberLogin']) {
                        // 30-day cookie
                        setcookie('rememberLogin', true, time() + (86400 * 30), '/');
                        setcookie('username', $row['username'], time() + (86400 * 30), '/');
                        setcookie('admin', $row['admin'], time() + (86400 * 30), '/');
                    } else {
                        // 1-hour cookie
                        setcookie('rememberLogin', true, time() + 3600, '/');
                        setcookie('username', $row['username'], time() + 3600, '/');
                        setcookie('admin', $row['admin'], time() + 3600, '/');
                    }
                } else {
                    $result['error'] = 'Falsches Passwort!';
                }
            } else {
                $result['error'] = 'Benutzer nicht gefunden bzw. inaktiv!';
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
        if (isset($_SESSION['username']) && isset($_SESSION['admin'])) {
            if ($_SESSION['admin']) {
                $result['status'] = 'loggedInAdmin';
            } else {
                $result['status'] = 'loggedInUser';
            }
        } elseif (isset($_COOKIE['rememberLogin']) && isset($_COOKIE['username'])) {
            // Restore the session based on the 'rememberLogin' cookie
            if (!isset($_SESSION)) {
                session_start();
            }
            $_SESSION['username'] = $_COOKIE['username'];
            $_SESSION['admin'] = $_COOKIE['admin'] ?? false;
            if ($_SESSION['admin']) {
                $result['status'] = 'loggedInAdmin';
            } else {
                $result['status'] = 'loggedInUser';
            }
        } else {
            $result['status'] = 'notLoggedIn';
        }
        return $result;
    }

    public function logoutUser()
    {
        $result = array();
        if (isset($_SESSION['username'])) {
            session_destroy();

            if (isset($_COOKIE['rememberLogin'])) {
                setcookie('rememberLogin', '', time() - 3600, '/');
            }
            if (isset($_COOKIE['username'])) {
                setcookie('username', '', time() - 3600, '/');
            }
            if (isset($_COOKIE['admin'])) {
                setcookie('admin', '', time() - 3600, '/');
            }
            $result['loggedIn'] = false;
        }
        return $result;
    }

    function updateUserData($param)
    {
        $result = array();
        $newUserData = array();
        $sql = 'SELECT anrede,vorname, nachname, adresse, plz, ort, email, username, passwort FROM users WHERE username = ?';
        $stmt = $this->dh->db_obj->prepare($sql);
        $stmt->bind_param('s', $param['actualusername']);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows == 1) {
            $row = $result->fetch_assoc();
            if (empty($param['pw_alt'])) {
                $data['error'] = "Sie haben Ihr altes Passwort nicht eingegeben.";
                return $data;
            } elseif (!password_verify($param['pw_alt'], $row['passwort'])) {

                $data['error'] = "Das eingegebene Passwort ist nicht korrekt. Bitte probieren Sie es noch einmal.";


                return $data;
            } else {
                if (!empty($param['firstName'])) {
                    $data['vorname'] = $param['firstName'];
                } else {
                    $data['vorname'] = $row['vorname'];
                }
                if (!empty($param['lastName'])) {
                    $data['nachname'] = $param['lastName'];
                } else {
                    $data['nachname'] = $row['nachname'];
                }

                if (!empty($param['adress'])) {
                    $data['adress'] = $param['adress'];
                } else {
                    $data['adress'] = $row['adresse'];
                }

                if (!empty($param['postcode'])) {
                    $data['postcode'] = $param['postcode'];
                } else {
                    $data['postcode'] = $row['plz'];
                }

                if (!empty($param['city'])) {
                    $data['city'] = $param['city'];
                } else {
                    $data['city'] = $row['ort'];
                }

                if (!empty($param['email'])) {
                    $data['email'] = $param['email'];
                } else {
                    $data['email'] = $row['email'];
                }
                if (!empty($param['username'])) {
                    $data['username'] = $param['username'];
                } else {
                    $data['username'] = $row['username'];
                }
                if (!empty($param['pw'])) {
                    $data['pw'] = $param['pw'];
                } else {
                    $data['pw'] = $row['passwort'];
                    //$pw = $row['passwort'];
                }
                if (!empty($param['formofAddress'])) {
                    $data['formofAddress'] = $param['formofAddress'];
                } else {
                    $data['formofAddress'] = $row['anrede'];
                }
            }
        } else {
            $data['error'] = "Fehler bei der Abfrage!";
            return $data;
        }
        $stmt->close();

        $inputUsername = $param['username'];
        $actualUsername = $param['actualusername'];
        $sql2 = 'SELECT username FROM users WHERE `username` = ?';
        $stmt2 = $this->dh->db_obj->prepare($sql2);
        $stmt2->bind_param("s", $inputUsername);
        $stmt2->execute();
        $result2 = $stmt2->get_result();

        if ($result2->num_rows == 1 && $result2->fetch_assoc()['username'] != $actualUsername) {
            $data['error'] = "Der Username muss unique sein.";
            return $data;
        } else {
            $sqlUpdate = 'UPDATE `users` SET `anrede` = ?, `vorname` = ?, `nachname` = ?, `adresse` = ?, `plz` = ?, `ort` = ?, `email` = ?, `passwort` = ?, `username` = ? 
            WHERE `username` = ?';

            $stmtUpdate = $this->dh->db_obj->prepare($sqlUpdate);
            $stmtUpdate->bind_param(
                'ssssssssss',
                $data['formofAddress'],
                $data['vorname'],
                $data['nachname'],
                $data['adress'],
                $data['postcode'],
                $data['city'],
                $data['email'],
                $data['pw'],
                $data['username'],
                $actualUsername
            );
            if ($stmtUpdate->execute()) {
                if (isset($_COOKIE['rememberLogin']) && $_COOKIE['rememberLogin']) {
                    // 30-day cookie
                    setcookie('rememberLogin', true, time() + (86400 * 30), '/');
                    setcookie('username', $data['username'], time() + (86400 * 30), '/');
                    setcookie('admin', $_COOKIE['admin'], time() + (86400 * 30), '/');
                } else {
                    // 1-hour cookie
                    setcookie('rememberLogin', true, time() + 3600, '/');
                    setcookie('username', $data['username'], time() + 3600, '/');
                    setcookie('admin', $_COOKIE['admin'], time() + 3600, '/');
                }
                $data['success'] = 'Daten erfolgreich aktualisisert';
            } else {
                $data['error'] = 'Versuchen Sie es später erneut!';
            }
            $stmtUpdate->close();
        }
        $stmt2->close();
        return $data;
    }

    function getProfileData()
    {
        $param = $_GET['param'];
        $sql = 'SELECT anrede,vorname, nachname, adresse, plz, ort, email, username, passwort FROM users WHERE username = ?';
        $stmt = $this->dh->db_obj->prepare($sql);
        $stmt->bind_param('s', $param);
        $stmt->execute();
        $result = $stmt->get_result();

        $data = array();
        if ($result->num_rows == 1) {
            $data = $result->fetch_assoc();
            $data['success'] = true;
        }
        $stmt->close();
        return $data;
    }

    // helper function
    private function test_input($data)
    {
        $data = trim($data);
        $data = stripslashes($data);
        $data = htmlspecialchars($data);
        return $data;
    }
}
