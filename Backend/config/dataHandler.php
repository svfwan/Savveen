<?php
class dataHandler
{
    private $db_obj;

    public function __construct()
    {
        global $host, $user, $password, $database;
        $this->db_obj = new mysqli($host, $user, $password, $database);
        session_start();
    }

    public function __destruct()
    {
        $this->db_obj->close();
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
        $active = 1;

        // need to add validation of input still

        if (!$this->checkConnection()) {
            $result['error'] = 'Login nicht möglich, versuchen Sie es später erneut!';
        }

        $sql = 'SELECT `username`, `passwort`, `admin` FROM `users` WHERE `username` = ? AND `active` = ? LIMIT 1';
        $stmt = $this->db_obj->prepare($sql);
        $stmt->bind_param('si', $username, $active);

        if ($stmt->execute()) {
            $user = $stmt->get_result();
            if ($user->num_rows == 1) {
                $row = $user->fetch_assoc();
                if (password_verify($password, $row['passwort'])) {
                    $result['success'] = 'Login erfolgreich, willkommen ' . $username . '!';
                    $result['username'] = $username;
                    $result['admin'] = $row['admin'];
                    if (!(isset($_SESSION))) {
                        session_start();
                    }
                    $_SESSION['username'] = $username;
                    $_SESSION['admin'] = $row['admin'];
                    if (isset($param['rememberLogin']) && $param['rememberLogin']) {
                        // 30-day cookie
                        setcookie('rememberLogin', true, time() + (86400 * 30), '/');
                        setcookie('username', $username, time() + (86400 * 30), '/');
                        setcookie('admin', $row['admin'], time() + (86400 * 30), '/');
                    } else {
                        // 1-hour cookie
                        setcookie('rememberLogin', true, time() + 3600, '/');
                        setcookie('username', $username, time() + 3600, '/');
                        setcookie('admin', $row['admin'], time() + 3600, '/');
                    }
                } else {
                    $result['error'] = 'Falsches Passwort!';
                }
            } else {
                $result['error'] = 'Benutzername nicht gefunden bzw. inaktiv!';
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

    public function createProduct()
    {
        $result = array();
        $param = $_POST;
        $category = $param['category'];
        $productName = $param['productName'];
        $price = floatval($param['price']);
        $stock = $param['stock'];
        $description = $param['description'];

        // Perform validation
        if (empty($category) || empty($productName) || empty($price) || empty($stock) || empty($description)) {
            $result['error'] = 'Bitte füllen Sie alle Felder aus!';
            return $result;
        }

        if (!is_numeric($price) || !is_numeric($stock) || $price < 0 || $stock < 0) {
            $result['error'] = 'Preis und Lagerbestand müssen valide Zahlen sein!';
            return $result;
        }

        if (!isset($_FILES['picture']) || $_FILES['picture']['size'] <= 0) {
            $result['error'] = 'Bitte wählen Sie ein Bild für das Produkt aus!';
            return $result;
        }

        $picture = $_FILES['picture'];
        $tmp_path = $picture['tmp_name'];
        $fileExtension = pathinfo($picture['name'], PATHINFO_EXTENSION);

        // Check if file is an image
        $allowedExtensions = array('jpg', 'jpeg', 'png', 'gif');
        if (!in_array(strtolower($fileExtension), $allowedExtensions)) {
            $result['error'] = 'Ungültige Dateierweiterung! Nur JPG, JPEG, PNG und GIF sind erlaubt.';
            return $result;
        }

        // Process the file upload
        $filename = $productName . '.jpg';
        $actual_path = "../../Frontend/res/img/" . $filename;

        // Check the connection
        if (!$this->checkConnection()) {
            $result['error'] = 'Versuchen Sie es später erneut!';
            return $result;
        }

        // Prepared SQL statement to insert the product into the database
        $sql = 'INSERT INTO `products` (`kategorie`, `name`, `preis`, `beschreibung`, `bestand`)
        VALUES (?, ?, ?, ?, ?)';
        $stmt = $this->db_obj->prepare($sql);
        $stmt->bind_param('ssssd', $category, $productName, $price, $description, $stock);

        // Execute the statement and check if successful
        if ($stmt->execute() && $stmt->affected_rows > 0 && move_uploaded_file($tmp_path, $actual_path)) {
            $result['success'] = 'Produkt erfolgreich hinzugefügt!';
        } else {
            $result['error'] = 'Fehler beim Erstellen des Produkts!';
        }

        $stmt->close();
        return $result;
    }

    public function updateProduct()
    {
        $result = array();
        $param = $_POST;
        $productID = $param['productID'];
        $category = $param['category'];
        $productName = $param['productName'];
        $price = floatval($param['price']);
        $stock = $param['stock'];
        $description = $param['description'];

        // Perform validation
        if (empty($category) || empty($productName) || empty($price) || empty($stock) || empty($description)) {
            $result['error'] = 'Bitte füllen Sie alle Felder aus!';
            return $result;
        }

        if (!is_numeric($price) || !is_numeric($stock) || $price < 0 || $stock < 0) {
            $result['error'] = 'Preis und Lagerbestand müssen valide Zahlen sein!';
            return $result;
        }

        // Check the connection
        if (!$this->checkConnection()) {
            $result['error'] = 'Versuchen Sie es später erneut!';
            return $result;
        }

        $databaseUpdated = false;
        $pictureMoved = false;

        // Check if a new picture is provided
        if (isset($_FILES['picture']) && $_FILES['picture']['size'] > 0) {
            // Process the file upload for the new picture
            $picture = $_FILES['picture'];
            $tmpPath = $picture['tmp_name'];
            $fileExtension = pathinfo($picture['name'], PATHINFO_EXTENSION);

            $allowedExtensions = array('jpg', 'jpeg', 'png', 'gif');
            if (!in_array(strtolower($fileExtension), $allowedExtensions)) {
                $result['error'] = 'Ungültige Dateierweiterung! Nur JPG, JPEG, PNG und GIF sind erlaubt.';
                return $result;
            }

            $newPictureFilename = $productName . '.jpg';
            $newPicturePath = "../../Frontend/res/img/" . $newPictureFilename;
            move_uploaded_file($tmpPath, $newPicturePath);
            $pictureMoved = true;
        }

        // Prepared SQL statement to update the product in the database
        $sql = 'UPDATE `products` SET `kategorie` = ?, `name` = ?, `preis` = ?, `beschreibung` = ?, `bestand` = ? WHERE `id` = ?';
        $stmt = $this->db_obj->prepare($sql);
        $stmt->bind_param('ssssdi', $category, $productName, $price, $description, $stock, $productID);

        // Execute the statement and check if successful
        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                $databaseUpdated = true;
            }
        } else {
            $result['error'] = 'Fehler beim Aktualisieren des Produkts!';
            $stmt->close();
            return $result;
        }

        $stmt->close();

        if ($databaseUpdated || $pictureMoved) {
            $result['success'] = 'Produkt erfolgreich aktualisiert!';
        } else {
            $result['error'] = 'Daten bereits aktuell!';
        }

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

    //Alle Produkte laden
    public function loadAllProducts()
    {
        //hier werden die fkt reingeschrieben. 


        $result = array(); // Initialisiere das Array

        // Prüfe die Verbindung zur Datenbank
        if (!$this->checkConnection()) {
            $result["error"] = "Versuchen Sie es später erneut!";
            return $result;
        }

        // Führe die SQL-Abfrage aus
        $stmt = $this->db_obj->prepare("SELECT `id`,`kategorie`, `name`, `preis`, `beschreibung`, `bewertung` FROM `products`");
        if ($stmt->execute()) {
            $queryResult = $stmt->get_result();
            while ($row = $queryResult->fetch_assoc()) {
                array_push($result, $row);
            }
        } else {
            $result["error"] = "Versuchen Sie es später erneut!";
        }

        // Schließe die Verbindung und gib das Array zurück
        $stmt->close();
        return $result;
    }

    // load product by ID
    public function loadProductByID($param)
    {
        $result = array();

        // Check the database connection
        if (!$this->checkConnection()) {
            $result["error"] = "Versuchen Sie es später erneut!";
            return $result;
        }

        // Prepare and execute the SQL query
        $stmt = $this->db_obj->prepare("SELECT `id`, `kategorie`, `name`, `preis`, `beschreibung`, `bewertung` FROM `products` WHERE `id` = ?");
        $stmt->bind_param("i", $param);
        if ($stmt->execute()) {
            $queryResult = $stmt->get_result();
            $row = $queryResult->fetch_assoc();
            if ($row) {
                $result["success"] = true;
                $result["data"] = $row;
            } else {
                $result["success"] = false;
                $result["error"] = "Produkt nicht gefunden";
            }
        } else {
            $result["error"] = "Versuchen Sie es später erneut!";
        }
        // Close the connection and return the array
        $stmt->close();
        return $result;
    }

    //checkStock()
    public function checkStock($param)
    {
        $result = array();
        $id = $param['id'];

        // Check the database connection
        if (!$this->checkConnection()) {
            $result["error"] = "Versuchen Sie es später erneut!";
            return $result;
        }

        // Prepare and execute the SQL query
        $stmt = $this->db_obj->prepare("SELECT `id`, `kategorie`, `name`, `preis`, `bewertung`,  `bestand` FROM `products` WHERE `id` = ?");
        $stmt->bind_param('i', $id);

        if ($stmt->execute()) {
            $queryResult = $stmt->get_result();
            $row = $queryResult->fetch_assoc();
            if ($row) {
                $result = $row;
            } else {
                $result["error"] = "Produkt nicht gefunden";
            }
        } else {
            $result["error"] = "Versuchen Sie es später erneut!";
        }

        // Close the connection and return the array
        $stmt->close();
        return $result;
    }

    //nach Buchstaben filtern 
    function searchProducts($param)
    {
        $result = array();
        $searchTerm = $param['letter'];

        // Verbindung zur DB prüfen
        if (!$this->checkConnection()) {
            $result["error"] = "Versuchen Sie es später erneut!";
            return $result;
        }

        // Führe die SQL-Abfrage aus
        $stmt = $this->db_obj->prepare("SELECT `id`, `kategorie`, `name`, `preis`, `bewertung` FROM `products`");
        if ($stmt->execute()) {
            $queryResult = $stmt->get_result();
            // Füge die Ergebnisse in das Array ein
            while ($row = $queryResult->fetch_assoc()) {
                // Convert both the search term and name to lowercase for case-insensitive comparison
                if (stripos(strtolower($row['name']), strtolower($searchTerm)) !== false) {
                    array_push($result, $row);
                }
            }
            // Check if any products were found
            if (count($result) === 0) {
                $result["error"] = "Kein Produkt gefunden!";
            }
        } else {
            $result["error"] = "Versuchen Sie es später erneut!";
        }

        // Schließe die Verbindung und gib das Array zurück
        $stmt->close();
        return $result;
    }
}
