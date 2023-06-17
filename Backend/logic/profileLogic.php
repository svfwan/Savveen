<?php
class profileLogic
{
    private $dh;
    // Der Konstruktor
    public function __construct($dh)
    {
        $this->dh = $dh;
    }
     // Diese Methode gibt die Information darüber,
     // um was für einen User es sich handelt. 
    public function getSessionInfo()
    {
        $result = array();
        if (isset($_SESSION['username']) && isset($_SESSION['admin'])) {
            if ($_SESSION['admin']) {
                //als Admin eingeloggt
                $result['status'] = 'loggedInAdmin';
            } else {
                // als User eingeloggt
                $result['status'] = 'loggedInUser';
            }
        } elseif (isset($_COOKIE['rememberLogin']) && isset($_COOKIE['username'])) {
            // Restore the session based on the 'rememberLogin' cookie
            if (!isset($_SESSION)) {
                session_start();
            }
            // der status, wenn zusätzlich ein cookie gestzt wurde (bzw das rememberLogin aktiviert ist)
            $_SESSION['username'] = $_COOKIE['username'];
            $_SESSION['admin'] = $_COOKIE['admin'] ?? false;
            if ($_SESSION['admin']) {
                // Status für eingeloggten Admin
                $result['status'] = 'loggedInAdmin';
                $result['check'] = 'newDataHandler works';
            } else {
                // Status für eingeloggten User
                $result['status'] = 'loggedInUser';
            }
        } else {
                // Status, wenn man nicht eingeloggt ist
            $result['status'] = 'notLoggedIn';
        }
        return $result;
    }

    public function registerUser($param)
    {
        $result = array();
        $person = $param;
        // Handling, wenn ein Eintrag fehlt
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
        if (empty($person['passwordSecond']) || strlen(trim($person['passwordSecond'])) == 0 || strlen(trim($person['passwordSecond'])) < 8) {
            $result['error'] = 'Bitte geben Sie ein Passwort mit mindestens 8 Zeichen ein!';
            return $result;
        }
        if ($person['password'] != $person['passwordSecond']) {
            $result['error'] = 'Ihre Passworteingaben stimmen nicht überein!';
            return $result;
        }

        // JS_Injection vorbeugen und Passwort hashen
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

        // Prepared Statement, um zu chelen, ob User existiert
        // prepared statement and check if user name exists
        if (!$this->dh->checkConnection()) {
            $result['error'] = 'Registrierung fehlgeschlagen, versuchen Sie es später erneut';
            return $result;
        }

        // Der neue User wird in die Datenbank hinzugefügt, wenn es nicht bereits einen User mit demselben Usernamen gibt.
        $sql = 'INSERT INTO `users` (`anrede`, `vorname`, `nachname`, `adresse`, `plz`, `ort`, `email`, `username`, `passwort`) 
        SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?
        FROM DUAL
        WHERE NOT EXISTS (SELECT * FROM `users` WHERE `username` = ?)';

        
        $stmt = $this->dh->db_obj->prepare($sql);
        $stmt->bind_param('ssssssssss', $fod, $fname, $sname, $address, $postcode, $city, $mail, $uname, $pass, $uname);
        // Wenn der Benutzer erfolgreich in die Datenbank hinzugefügt wurde, dass erscheint die Meldung, dass ein/e neue/r BenutzerIn erstellt wurde
        // eine entsprechende Meldung erscheint. Andernfalls bedeutet es dass der eingegebene Username bereits existiert und diese Meldunge erscheint auch.
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
        // userinput und password sind die angegebenen Daten
        $result = array();
        $userInput = $param['userInput'];
        $password = $param['password'];
        $active = 1;
         // wenn etwas mit der Connection nicht in Ordnung ist, erscheint diese Meldung
        if (!$this->dh->checkConnection()) {
            $result['error'] = 'Login nicht möglich, versuchen Sie es später erneut!';
        }
         // Wenn der Userinput leer ist
        if (empty($userInput)) {
            $result['error'] = 'Geben Sie bitte einen Benutzernamen oder E-Mail ein!';
            return $result;
        // Wenn das Passwort leer ist
        } else if (empty($password)) {
            $result['error'] = 'Geben Sie bitte ein Passwort ein!';
            return;
        } else {
            // Man holt sich die Daten von dem User
            $sql = 'SELECT `email`, `username`, `passwort`, `admin` FROM `users`
                     WHERE (`username`=? OR `email` = ?) AND `aktiv` = ?';
            $stmt = $this->dh->db_obj->prepare($sql);
            $stmt->bind_param('ssi', $userInput, $userInput, $active);
        }
     
        if ($stmt->execute()) {
            $user = $stmt->get_result();
            // Wenn die Abfrage von der Datenbank 1 ergibt, dann bedeutet das, dass es einen User mit den Daten gibt und der Login war erfolgreich
            if ($user->num_rows == 1) {
                $row = $user->fetch_assoc();
                // Nun wird pberüprüft, ob das eingegebene Passwort korrekt ist
                if (password_verify($password, $row['passwort'])) {
                    $result['success'] = 'Login erfolgreich, willkommen ' . $row['username'] . '!';
                    $result['username'] = $row['username'];
                    $result['admin'] = $row['admin'];
                    if (!(isset($_SESSION))) {
                        session_start();
                    }
                    // Der session['name'] wird zugeordnet
                    $_SESSION['username'] = $row['username'];
                    $_SESSION['admin'] = $row['admin'];
                    // wenn das rememberLogin angeklickt wurde, dann wird entweder ein 1h cookie oder ein 30 Tage cookie gesetzt
                    if (isset($param['rememberLogin']) && $param['rememberLogin']) {
                        // 30-day cookie, wenn rememberLogin angekreuzt wird
                        setcookie('rememberLogin', true, time() + (86400 * 30), '/');
                        setcookie('username', $row['username'], time() + (86400 * 30), '/');
                        setcookie('admin', $row['admin'], time() + (86400 * 30), '/');
                    } else {
                        // 1-hour cookie, wenn rememberLogin angekreuzt wird
                        setcookie('rememberLogin', true, time() + 3600, '/');
                        setcookie('username', $row['username'], time() + 3600, '/');
                        setcookie('admin', $row['admin'], time() + 3600, '/');
                    }
                } else {
                    // Wenn das Passwort nicht korrekt war
                    $result['error'] = 'Falsches Passwort!';
                }
            } else {
                // Wenn es keinen Eintrag in der Datenbank gibt, wo username oder email dem entsprechen
                $result['error'] = 'Benutzer nicht gefunden bzw. inaktiv!';
            }
        } else {
            // wenn ein anderer Fehler aufgetreten ist
            $result['error'] = 'Login nicht möglich, versuchen Sie es später erneut!';
        }

        $stmt->close();
        return $result;
    }
    // wenn man seine eigenen Daten ändern will, wird zuerst die Methode getProfileData aufgerufen, welche die alten Daten anzeigt
    function getProfileData($param)
    {
        
        $result = array();
        // Wenn die Connection nicht erfolgreich war
        if (!$this->dh->checkConnection()) {
            $result['error'] = "Versuchen Sie es später erneut";
            return;
        }
        // Man holt sich die Daten des Users aus der Datenbank
        $sql = 'SELECT `anrede`, `vorname`, `nachname`, `adresse`, `plz`, `ort`, `email`, `username`
        FROM `users` WHERE `username` = ?';
        $stmt = $this->dh->db_obj->prepare($sql);
        $stmt->bind_param('s', $param);
        if ($stmt->execute()) {
            $queryResult = $stmt->get_result();
            // wenn es einen Eintrag in der Datenbank gibt
            if ($queryResult->num_rows == 1) {
                $result = $queryResult->fetch_assoc();
            } else {
            // wenn es keinen Eintrag in der Datenbank gibt
                $result['error'] = "Fehler bei der Abfrage";
            }
        } else {
            $result['error'] = "Fehler bei der Abfrage";
        }

        $stmt->close();
        return $result;
    }
    // wenn der User seine Daten ändern will
    function updateUserData($param)
    // wenn der User seine Daten ändern will, dann muss er davor einige Voraussetzungen erfüllen, wie zum Beispiel, dass das Passwort
    // des Users/ der Userin eingetragen werden muss...
    {
        $result = array();
        //man holt sich erneut die Daten des users, wo sie dem Usernamen entsprechen
        $sql = 'SELECT anrede,vorname, nachname, adresse, plz, ort, email, username, passwort FROM users WHERE username = ?';
        $stmt = $this->dh->db_obj->prepare($sql);
        $stmt->bind_param('s', $param['actualusername']);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows == 1) {
            
            $row = $result->fetch_assoc();
            if (empty($param['pw_alt'])) {
                // wenn man das alte Passwort nicht angegeben hat
                $data['error'] = "Sie haben Ihr altes Passwort nicht eingegeben.";
                return $data;
            } elseif (!password_verify($param['pw_alt'], $row['passwort'])) {
                // wenn man ein falsches, altes Passwort eingegeben hat
                $data['error'] = "Das eingegebene Passwort ist nicht korrekt. Bitte probieren Sie es noch einmal.";
                return $data;
            } else {
                // wenn man Daten ausfüllt, wird das in der Variable Data gespeichert,
                // ansonsten bleibt data gleich, wie die alten Daten aus der Datenbank
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
                // Email-Vlidierung
                if (!empty($param['email']) && filter_var($this->test_input($param["email"]), FILTER_VALIDATE_EMAIL)) {
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
                    $data['pw'] = password_hash($param['pw'], PASSWORD_DEFAULT);
                } else {
                    $data['pw'] = $row['passwort'];
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
        // Heir wird nur der username aus der Datenbank gefiltert
        $inputUsername = $param['username'];
        $actualUsername = $param['actualusername'];
        $sql2 = 'SELECT username FROM users WHERE `username` = ?';
        $stmt2 = $this->dh->db_obj->prepare($sql2);
        $stmt2->bind_param("s", $inputUsername);
        $stmt2->execute();
        $result2 = $stmt2->get_result();
        
        // wenn deer neue Username bereits in der Datenbank drinnen ist, dann erscheint die Meldung, weil der Username uniqe sein muss
        if ($result2->num_rows == 1 && $result2->fetch_assoc()['username'] != $actualUsername) {
            $data['error'] = "Der Username muss unique sein.";
            return $data;
        } else {
        // ansonsten werden die Einträge in der Datenbank geupdatet
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
            // Der neue Cookie wird gesetzt
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

    public function logoutUser()
    {// wenn der user sich ausloggen will
        $result = array();
        // die session $SESSION['username'] wird destroyet
        if (isset($_SESSION['username'])) {
            session_destroy();
            // wir ziehen die Zeit vom cookie ab und somit läuft der cookie ab
            if (isset($_COOKIE['rememberLogin'])) {
                setcookie('rememberLogin', '', time() - 3600, '/');
            }
            if (isset($_COOKIE['username'])) {
                setcookie('username', '', time() - 3600, '/');
            }
            if (isset($_COOKIE['admin'])) {
                setcookie('admin', '', time() - 3600, '/');
            }
            //logedIn wird auf false gesetzt
            $result['loggedIn'] = false;
        }
        return $result;
    }

    // helper function
    private function test_input($data)
    {
        //zur Datenvalidierung
        $data = trim($data);
        $data = stripslashes($data);
        $data = htmlspecialchars($data);
        return $data;
    }
}
