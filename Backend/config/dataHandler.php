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

        $sql = 'SELECT `id`,`username`, `passwort`, `admin` FROM `users` WHERE `username` = ? AND `active` = ? LIMIT 1';
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
                    $result['userid'] = $row['id']; 
                    if (!(isset($_SESSION))) {
                        session_start();
                    }
                    $_SESSION['username'] = $username;
                    $_SESSION['admin'] = $row['admin'];
                    $_SESSION['userid'] = $row['id']; 
                    if (isset($param['rememberLogin']) && $param['rememberLogin']) {
                        // 30-day cookie
                        setcookie('rememberLogin', true, time() + (86400 * 30), '/');
                        setcookie('username', $username, time() + (86400 * 30), '/');
                        setcookie('admin', $row['admin'], time() + (86400 * 30), '/');
                        setcookie('userid', $row['id'], time() + (86400 * 30), '/'); 
                    } else {
                        // 1-hour cookie
                        setcookie('rememberLogin', true, time() + 3600, '/');
                        setcookie('username', $username, time() + 3600, '/');
                        setcookie('admin', $row['admin'], time() + 3600, '/');
                        setcookie('userid', $row['id'], time() + 3600, '/');
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

    public function loadProductsForAdmin()
    {
        $result = array();

        if (!$this->checkConnection()) {
            $result['error'] = 'Produktkatalog kann nicht geladen werden, versuchen Sie es später erneut!';
        }

        $result['message'] = 'empty function';
        return $result;
    }

    public function createProduct($param)
    {
        $result = array();
        $category = $param['category'];
        $productName = $param['productName'];
        $price = floatval($param['price']);
        $stock = $param['stock'];
        $description = $param['description'];
        $picture = $_FILES['picture'];
        $tmp_path = $picture['tmp_name'];
        $fileExtension = pathinfo($picture['name'], PATHINFO_EXTENSION);

        // Perform validation
        if (empty($category) || empty($productName) || empty($price) || empty($stock) || empty($description)) {
            $result['error'] = 'Bitte füllen Sie alle Felder aus!';
            return $result;
        }

        if (!is_numeric($price) || !is_numeric($stock) || $price < 0 || $stock < 0) {
            $result['error'] = 'Preis und Lagerbestand müssen valide Zahlen sein!';
            return $result;
        }

        if (empty($picture) || !isset($picture)) {
            $result['error'] = 'Bitte wählen Sie ein Bild für das Produkt aus!';
            return $result;
        }

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
        $stmt->bind_param('sssds', $category, $productName, $price, $description, $stock);

        // Execute the statement and check if successful
        if ($stmt->execute() && $stmt->affected_rows > 0 && move_uploaded_file($tmp_path, $actual_path)) {
            $result['success'] = 'Produkt erfolgreich hinzugefügt!';
        } else {
            $result['error'] = 'Fehler beim Erstellen des Produkts!';
        }

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


        $tab = []; // Initialisiere das Array

        // Prüfe die Verbindung zur Datenbank
        if (!$this->checkConnection()) {
            $tab["error"] = "Versuchen Sie es später erneut!";
            return $tab;
        }

        // Führe die SQL-Abfrage aus
        $sql = $this->db_obj->prepare("SELECT `kategorie`, `name`, `preis`, `bewertung` FROM `products`");
        $sql->execute();
        $result = $sql->get_result();

        // Füge die Ergebnisse in das Array ein
        while ($row = $result->fetch_assoc()) {
            array_push($tab, $row);
        }

        // Schließe die Verbindung und gib das Array zurück
        $sql->close();
        return $tab;
    }


    //checkStock()
    public function checkStock($param)
    {

        //überarbeiten
        // $tab = []; // Initialisiere das Array
        $tab = array();

        $n = $param['name'];

        // Prüfe die Verbindung zur Datenbank
        if (!$this->checkConnection()) {
            $tab["error"] = "Versuchen Sie es später erneut!";
            return $tab;
        }


        // Führe die SQL-Abfrage aus
        $sql = $this->db_obj->prepare("SELECT `kategorie`, `name`, `preis`, `bewertung`,  `bestand` FROM `products` WHERE `name` = ? ");
        $sql->bind_param('s', $n);
        //  echo "Datenbank: ". $param['Name'];
        $sql->execute();
        $result = $sql->get_result();

        // Füge die Ergebnisse in das Array ein
        while ($row = $result->fetch_assoc()) {
            array_push($tab, $row);
        }

        // Schließe die Verbindung und gib das Array zurück
        $sql->close();
        return $tab;
    }


    public function reduceStock($param)
    {
        //arr erstellen für die ergebnisse
        $tab = array();

        $n = $param['Name'];
        $s = $param['Stock'] - 1;


        // Prüfe die Verbindung zur Datenbank
        if (!$this->checkConnection()) {
            $tab["error"] = "Versuchen Sie es später erneut!";
            return $tab;
        }

        // Führe die SQL-Abfrage aus
        $sql = $this->db_obj->prepare("UPDATE `products` SET `bestand` = ?  WHERE `name` = ? ");
        $sql->bind_param('is', $s, $n);
        //  echo "Datenbank: ". $param['Name']  

        //update gibt ja keine werte zurück, deswegen kann man die werte auch nicht in einem array speichern

        if ($sql->execute() && $sql->affected_rows > 0) {
            $tab['success'] = 'Stock wurde runtergesetzt!';
        } else {
            $tab['error'] = 'Stock konnte nicht runtergesetzt werden.';
        }

        // Schließe die Verbindung und gib das Array zurück
        $sql->close();
        return $tab;
    }

    //nach Buchstaben filtern 
    function filterConSearch($param)
    {

        $tab = array();
        $full = array();

        $a = $param['letter'];

        //verbindung zur db prüfen
        if (!$this->checkConnection()) {
            $tab["error"] = "Versuchen Sie es später erneut!";
            return $tab;
        }

        // Führe die SQL-Abfrage aus
        $sql = $this->db_obj->prepare("SELECT `kategorie`, `name`, `preis`, `bewertung` FROM `products`");
        $sql->execute();
        $result = $sql->get_result();

        // Füge die Ergebnisse in das Array ein
        while ($row = $result->fetch_assoc()) {
            if (strpos($row['name'], $a) !== false) { //wenn name buchstaben enthälten
                array_push($tab, $row);
            }
            array_push($full,$row); 
          }
  
          // Schließe die Verbindung und gib das Array zurück
          $sql->close();
         if (count($tab) == 0){
            return $full; 
         }
          return $tab;

    }

    //Bestellung abwickeln 

    function processOrder($param){

        $tab = array();
        $pid = $param['product_id'];
        $quant = $param['quantity'];
        $uid = $param['userid']; 
        $recid = $param['receiptid']; 

          // Prüfe die Verbindung zur Datenbank
          if (!$this->checkConnection()) {
            $tab["error"] = "Versuchen Sie es später erneut!";
            return $tab;
        }

        //sql statement
        $sql = $this->db_obj->prepare("INSERT INTO orders(`product_id`, `quantity`, `user_id`, `receipt_id`) VALUES (?,?,?,?)");
        $sql->bind_param("iiii", $pid, $quant, $uid, $recid);
    

        if ($sql->execute() && $sql->affected_rows > 0) {
            $tab['success'] = 'Bestellung wurde abgewickelt ';
        } else {
            $tab['error'] = 'Bestellung konnte nicht abgewickelt werden';
        }

        $sql->close();
        return $tab;

    }

    function createReceipt($param){

        $tab = array();
        $gesamt = $param['total'];
        $uid = $param['userid']; 
        $street = $param['adress'];
        $plz = $param['postcode'];
        $city = $param['ort']; 

          // Prüfe die Verbindung zur Datenbank
          if (!$this->checkConnection()) {
            $tab["error"] = "Versuchen Sie es später erneut!";
            return $tab;
        }

        //sql statement
        $sql = $this->db_obj->prepare("INSERT INTO receipts (`user_id`,`total`, `street`,`postcode`,`city`) VALUES (?,?,?,?,?)");
        $sql->bind_param("iisis", $uid, $gesamt, $street, $plz, $city);
    

        if ($sql->execute() && $sql->affected_rows > 0) {
            $tab['success'] = 'Rechnung wurde erstellt';
        } else {
            $tab['error'] = 'Rechnung konnte nicht erstellt werden. ';
        }


        $sql->close();
        return $tab;

    }


    function getCurrentReceipt_id(){

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

    function getAddress($param){

        
        $id = $param['uid']; 

        $tab = array();
     
        // Prüfe die Verbindung zur Datenbank
        if (!$this->checkConnection()) {
          $tab["error"] = "Versuchen Sie es später erneut!";
          return $tab;
      }

      
      //sql statement
      $sql = $this->db_obj->prepare("SELECT `adresse`, `plz` , `ort`  FROM `users` WHERE `id` = ? LIMIT 1");
      $sql->bind_param("i", $id);
    
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
}
