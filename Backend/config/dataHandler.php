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
        $userInput = $param['userInput'];
        $password = $param['password'];
        $active = 1;

        if (!$this->checkConnection()) {
            $result['error'] = 'Login nicht möglich, versuchen Sie es später erneut!';
        }

        if (empty($userInput)) {
            $result['error'] = 'Um dich einzuloggen, muss E-Mail oder Username angegeben werden';
            return $result;
        } else {
            $sql = 'SELECT `email`, `username`, `passwort`, `admin` FROM `users`
                     WHERE (`username`=? OR `email` = ?) AND `active` = ?';
            $stmt = $this->db_obj->prepare($sql);
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
        $currentPicturePath = "../" . $param['currentPicture'];

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
        } else {
            $renamedPicturePath = "../../Frontend/res/img/" . $productName . ".jpg";
            if (!rename($currentPicturePath, $renamedPicturePath)) {
                $result['error'] = 'Fehler beim Aktualisieren des Bildnamens!';
                return $result;
            }
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

    public function deleteProduct($param)
    {
        $result = array();
        $id = $param['id'];
        $currentPicturePath = "../" . $param['currentPicture'];

        // Prüfe die Verbindung zur Datenbank
        if (!$this->checkConnection()) {
            $result["error"] = "Versuchen Sie es später erneut!";
            return $result;
        }

        // Prepare and execute the SQL query
        $stmt = $this->db_obj->prepare("DELETE FROM `products` WHERE `id` = ?");
        $stmt->bind_param("i", $id);
        if ($stmt->execute() && unlink($currentPicturePath)) {
            $result['success'] = "Produkt wurde erfolgreich gelöscht";
        } else {
            $result["error"] = "Produkt konnte nicht gelöscht werden!";
        }
        // Close the connection and return the array
        $stmt->close();
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
        $stmt = $this->db_obj->prepare("SELECT * FROM `products`");
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

        // Prüfe die Verbindung zur Datenbank
        if (!$this->checkConnection()) {
            $result["error"] = "Versuchen Sie es später erneut!";
            return $result;
        }

        // Prepare and execute the SQL query
        $stmt = $this->db_obj->prepare("SELECT * FROM `products` WHERE `id` = ?");
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
        $stmt = $this->db_obj->prepare("SELECT * FROM `products` WHERE `id` = ?");
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
    //Rechnungsid bekommen
    function getCurrentReceipt_id()
    {

        $tab = array();

        // Prüfe die Verbindung zur Datenbank
        if (!$this->checkConnection()) {
            $tab["error"] = "Versuchen Sie es später erneut!";
            return $tab;
        }


        //sql statement
        $sql = $this->db_obj->prepare("SELECT `receipt_id` FROM `receipts` ORDER BY `receipt_id` DESC LIMIT 1");

        //  SELECT receipt_id FROM receipts ORDER BY receipt_id DESC LIMIT 1

        $sql->execute();
        $result = $sql->get_result();

        // Füge die Ergebnisse in das Array ein
        while ($row = $result->fetch_assoc()) {
            array_push($tab, $row);
        }

        $sql->close();
        return $tab;
    }

    //Rechnung erstellen
    function createReceipt($param)
    {

        $tab = array();
        $gesamt = $param['total'];
        $un = $param['username'];
        $street = $param['adress'];
        $plz = $param['postcode'];
        $city = $param['ort'];

        // Prüfe die Verbindung zur Datenbank
        if (!$this->checkConnection()) {
            $tab["error"] = "Versuchen Sie es später erneut!";
            return $tab;
        }

        //sql statement
        $sql = $this->db_obj->prepare("INSERT INTO receipts (`username`,`total`, `street`,`postcode`,`city`) VALUES (?,?,?,?,?)");
        $sql->bind_param("sisis", $un, $gesamt, $street, $plz, $city);


        if ($sql->execute() && $sql->affected_rows > 0) {
            $tab['success'] = 'Rechnung wurde erstellt';
        } else {
            $tab['error'] = 'Rechnung konnte nicht erstellt werden. ';
        }


        $sql->close();
        return $tab;
    }
    //add order to db
    function processOrder($param)
    {

        $tab = array();
        $pid = $param['product_id'];
        $quant = $param['quantity'];
        $u = $param['username'];
        $recid = $param['receiptid'];

        // Prüfe die Verbindung zur Datenbank
        if (!$this->checkConnection()) {
            $tab["error"] = "Versuchen Sie es später erneut!";
            return $tab;
        }

        //sql statement
        $sql = $this->db_obj->prepare("INSERT INTO orders(`product_id`, `quantity`, `username`, `receipt_id`) VALUES (?,?,?,?)");
        $sql->bind_param("iisi", $pid, $quant, $u, $recid);


        if ($sql->execute() && $sql->affected_rows > 0) {
            $tab['success'] = 'Bestellung wurde abgewickelt ';
        } else {
            $tab['error'] = 'Bestellung konnte nicht abgewickelt werden';
        }

        $sql->close();
        return $tab;
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
        $stmt = $this->db_obj->prepare("SELECT * FROM `products`");
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



    function getAddress($param)
    {


        $username = $param['un'];

        $tab = array();

        // Prüfe die Verbindung zur Datenbank
        if (!$this->checkConnection()) {
            $tab["error"] = "Versuchen Sie es später erneut!";
            return $tab;
        }


        //sql statement
        $sql = $this->db_obj->prepare("SELECT `adresse`, `plz` , `ort`  FROM `users` WHERE `username` = ? LIMIT 1");
        $sql->bind_param("s", $username);

        //  SELECT receipt_id FROM receipts ORDER BY receipt_id DESC LIMIT 1

        $sql->execute();
        $result = $sql->get_result();

        // Füge die Ergebnisse in das Array ein
        while ($row = $result->fetch_assoc()) {
            array_push($tab, $row);
        }

        $sql->close();
        return $tab;

        // Schließe die Verbindung und gib das Array zurück
        $sql->close();
        return $tab;
    }


    function getProfileData()
    {
        $param = $_GET['param'];
        $sql = 'SELECT anrede,vorname, nachname, adresse, plz, ort, email, username, passwort FROM users WHERE username = ?';
        $stmt = $this->db_obj->prepare($sql);
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


    //Bestellung anzeigen:

    function getOrderInfo($param)
    {

        $username = $param['username'];

        $tab = array();

        // Prüfe die Verbindung zur Datenbank
        if (!$this->checkConnection()) {
            $tab["error"] = "Versuchen Sie es später erneut!";
            return $tab;
        }


        //sql statement
        $sql = $this->db_obj->prepare("SELECT `product_id`, `quantity`, `receipt_id`  FROM `orders` WHERE `username` = ? ");
        $sql->bind_param("s", $username);

        $sql->execute();
        $result = $sql->get_result();

        // Füge die Ergebnisse in das Array ein
        while ($row = $result->fetch_assoc()) {
            array_push($tab, $row);
        }

        $sql->close();
        return $tab;
    }


    function getProductPrice($param)
    {

        $product_id = $param['id'];

        $tab = array();

        // Prüfe die Verbindung zur Datenbank
        if (!$this->checkConnection()) {
            $tab["error"] = "Versuchen Sie es später erneut!";
            return $tab;
        }


        //sql statement
        $sql = $this->db_obj->prepare("SELECT `preis`, `name` FROM `products` WHERE `id` = ? ");
        $sql->bind_param("i", $product_id);

        $sql->execute();
        $result = $sql->get_result();

        // Füge die Ergebnisse in das Array ein
        while ($row = $result->fetch_assoc()) {
            array_push($tab, $row);
        }

        $sql->close();
        return $tab;
    }

    //getTotal

    function getTotal($param)
    {

        $id = $param['id'];

        $tab = array();

        // Prüfe die Verbindung zur Datenbank
        if (!$this->checkConnection()) {
            $tab["error"] = "Versuchen Sie es später erneut!";
            return $tab;
        }


        //sql statement
        $sql = $this->db_obj->prepare("SELECT `total` FROM `receipts` WHERE `receipt_id` = ?  ");
        $sql->bind_param("i", $id);

        $sql->execute();
        $result = $sql->get_result();

        // Füge die Ergebnisse in das Array ein
        while ($row = $result->fetch_assoc()) {
            array_push($tab, $row);
        }

        $sql->close();
        return $tab;
    }

    function getOrders($param)
    {
        $username = $param['username'];

        $tab = array();

        // Prüfe die Verbindung zur Datenbank
        if (!$this->checkConnection()) {
            $tab["error"] = "Versuchen Sie es später erneut!";
            return $tab;
        }

        // SQL statement
        $sql = $this->db_obj->prepare("SELECT `receipts`.`receipt_id`, `receipts`.`total`, `receipts`.`street`, `receipts`.`postcode`, `receipts`.`city`, `orders`.`quantity`, `orders`.`product_id` FROM `receipts` INNER JOIN `orders` ON `receipts`.`username` = `orders`.`username` AND `receipts`.`receipt_id` = `orders`.`receipt_id` WHERE `receipts`.`username` = ? ORDER BY `receipts`.`receipt_id` ASC");
        $sql->bind_param("s", $username);
        $sql->execute();
        $result = $sql->get_result();

        // Füge die Ergebnisse in das Array ein
        while ($row = $result->fetch_assoc()) {
            array_push($tab, $row);
        }

        $sql->close();
        return $tab;
    }

    function updateUserData($param)
    {
        $result = array();
        $newUserData = array();
        $sql = 'SELECT anrede,vorname, nachname, adresse, plz, ort, email, username, passwort FROM users WHERE username = ?';
        $stmt = $this->db_obj->prepare($sql);
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
        $stmt2 = $this->db_obj->prepare($sql2);
        $stmt2->bind_param("s", $inputUsername);
        $stmt2->execute();
        $result2 = $stmt2->get_result();

        if ($result2->num_rows == 1 && $result2->fetch_assoc()['username'] != $actualUsername) {
            $data['error'] = "Der Username muss unique sein.";
            return $data;
        } else {
            $sqlUpdate = 'UPDATE `users` SET `anrede` = ?, `vorname` = ?, `nachname` = ?, `adresse` = ?, `plz` = ?, `ort` = ?, `email` = ?, `passwort` = ?, `username` = ? 
            WHERE `username` = ?';

            $stmtUpdate = $this->db_obj->prepare($sqlUpdate);
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
}
