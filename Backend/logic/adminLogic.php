<?php
class adminLogic
{
    private $dh;

    public function __construct($dh)
    {
        $this->dh = $dh;
    }

    public function loadAllUsers()
    {
        $result = array();
        $notAdmin = 0;

        if (!$this->dh->checkConnection()) {
            $result['error'] = 'Versuchen Sie es später erneut!';
            return $result;
        }

        $sql = 'SELECT `id`, `username` FROM `users` WHERE `admin` = ? ORDER BY `username`';
        $stmt = $this->dh->db_obj->prepare($sql);
        $stmt->bind_param('i', $notAdmin);

        if ($stmt->execute()) {
            $queryResult = $stmt->get_result();
            if ($queryResult->num_rows > 0) {
                $result['success'] = 'Benutzer wurden gefunden!';
                $users = [];
                while ($row = $queryResult->fetch_assoc()) {
                    array_push($users, $row);
                }
                $result['users'] = $users;
            } else {
                $result['error'] = 'Keine Benutzer vorhanden!';
            }
        } else {
            $result['error'] = 'Fehler bei der Abfrage!';
        }

        $stmt->close();

        return $result;
    }

    public function loadUserByID($param)
    {
        $result = array();

        if (!$this->dh->checkConnection()) {
            $result['error'] = 'Versuchen Sie es später erneut!';
            return $result;
        }

        $sql = 'SELECT `id`, `aktiv`,`anrede`, `vorname`, `nachname`, `adresse`, `plz`, `ort`, `email`, `username`
        FROM `users` WHERE `id` = ?';
        $stmt = $this->dh->db_obj->prepare($sql);
        $stmt->bind_param('i', $param);

        if ($stmt->execute()) {
            $queryResult = $stmt->get_result();
            if ($queryResult->num_rows == 1) {
                $result['success'] = 'Benutzer gefunden!';
                $result['data'] = $queryResult->fetch_assoc();
            } else {
                $result['error'] = 'Benutzer nicht gefunden!';
            }
        } else {
            $result['error'] = 'Inkorrekte Abfragedaten!';
        }

        $stmt->close();

        return $result;
    }

    public function activateUser($param)
    {
        $result = array();

        if (!$this->dh->checkConnection()) {
            $result['error'] = 'Versuchen Sie es später erneut!';
            return $result;
        }

        $sql = 'UPDATE `users` SET `aktiv` = 1 WHERE `id` = ?';
        $stmt = $this->dh->db_obj->prepare($sql);
        $stmt->bind_param('i', $param);

        // Execute the statement
        if ($stmt->execute() && $stmt->affected_rows > 0) {
            // Check if any rows were affected
            $result['success'] = 'Benutzer erfolgreich aktiviert!';
        } else {
            $result['error'] = 'Benutzer ist bereits aktiviert!';
        }

        $stmt->close();

        return $result;
    }

    public function deactivateUser($param)
    {
        $result = array();

        if (!$this->dh->checkConnection()) {
            $result['error'] = 'Versuchen Sie es später erneut!';
            return $result;
        }

        $sql = 'UPDATE `users` SET `aktiv` = 0 WHERE `id` = ?';
        $stmt = $this->dh->db_obj->prepare($sql);
        $stmt->bind_param('i', $param);

        if ($stmt->execute() && $stmt->affected_rows > 0) {
            $result['success'] = 'Benutzer erfolgreich deaktiviert!';
        } else {
            $result['error'] = 'Benutzer ist bereits deaktiviert!';
        }

        $stmt->close();

        return $result;
    }

    public function loadOrdersByUserID($param)
    {
        $result = array();

        if (!$this->dh->checkConnection()) {
            $result['error'] = 'Versuchen Sie es später erneut!';
            return $result;
        }

        $sql = 'SELECT `id` FROM `receipts` WHERE `user_id` = ? ORDER BY `datum`, `id`';
        $stmt = $this->dh->db_obj->prepare($sql);
        $stmt->bind_param('i', $param);

        if ($stmt->execute()) {
            $queryResult = $stmt->get_result();
            if ($queryResult->num_rows > 0) {
                $orders = array();
                while ($row = $queryResult->fetch_assoc()) {
                    array_push($orders, $row);
                }
                $result['success'] = 'Bestellungen geladen';
                $result['data'] = $orders;
            } else {
                $result['noOrders'] = 'Dieser Benuter hat keine Bestellungen';
            }
        } else {
            $result['error'] = 'Inkorrekte Benutzerdaten, versuchen Sie es später erneut!';
        }

        $stmt->close();

        return $result;
    }

    public function loadOrderByID($param)
    {
        $result = array();

        if (!$this->dh->checkConnection()) {
            $result['error'] = 'Versuchen Sie es später erneut!';
            return $result;
        }

        $sql = "SELECT r.id AS receipt_id, r.user_id, r.summe, r.strasse, r.plz, r.ort, r.datum,
        ol.id AS orderline_id, ol.product_id, ol.preis, ol.anzahl,
        p.name AS product_name
        FROM receipts r
        JOIN orderlines ol ON r.id = ol.receipt_id
        JOIN products p ON ol.product_id = p.id
        WHERE r.id = ?;";
        $stmt = $this->dh->db_obj->prepare($sql);
        $stmt->bind_param('i', $param);

        if ($stmt->execute()) {
            $queryResult = $stmt->get_result();
            if ($queryResult->num_rows > 0) {
                $order = array();
                while ($row = $queryResult->fetch_assoc()) {
                    array_push($order, $row);
                }
                $result['success'] = 'Bestellung geladen';
                $result['data'] = $order;
            } else {
                $result['error'] = 'Diese Bestellung existiert nicht!';
            }
        } else {
            $result['error'] = 'Inkorrekte Bestelldaten, versuchen Sie es später erneut!';
        }

        $stmt->close();

        return $result;
    }

    public function deleteOrderLine($param)
    {
        $result = array();
        $orderlineID = $param['orderlineID'];
        $receiptID = $param['receiptID'];

        // Prüfe die Verbindung zur Datenbank
        if (!$this->dh->checkConnection()) {
            $result["error"] = "Versuchen Sie es später erneut!";
            return $result;
        }

        // Prepare and execute the SQL query to delete the order line
        $stmtDelete = $this->dh->db_obj->prepare("DELETE FROM `orderlines` WHERE `id` = ?");
        $stmtDelete->bind_param("i", $orderlineID);

        // Execute the delete statement
        if ($stmtDelete->execute()) {
            $stmtCount = $this->dh->db_obj->prepare("SELECT COUNT(*) FROM `orderlines` WHERE `receipt_id` = ?");
            $stmtCount->bind_param("i", $receiptID);
            if ($stmtCount->execute()) {
                $queryResult = $stmtCount->get_result();
                $orderLineCount = $queryResult->fetch_row()[0];
                if ($orderLineCount === 0) {
                    $result['lastProduct'] = "Bestellung erfolgreich gelöscht!";
                } else {
                    // The receipt still exists
                    $result['success'] = "Produkt erfolgreich von Bestellung entfernt!";
                }
            }
            $stmtCount->close();
        } else {
            $result["error"] = "Produkt konnte nicht von Bestellung entfernt werden!";
        }

        // Close the connection and return the array
        $stmtDelete->close();
        return $result;
    }

    public function createProduct()
    {
        $result = array();
        $param = $_POST;
        $category = $param['category'];
        $productName = $param['productName'];
        $price = $param['price'];
        $description = $param['description'];

        // Perform validation
        if (empty($category) || empty($productName) || empty($price) || empty($description)) {
            $result['error'] = 'Bitte füllen Sie alle Felder aus!';
            return $result;
        }

        if (!is_numeric($price) ||  $price < 0) {
            $result['error'] = 'Preis muss valide Zahl sein!';
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
        if (!$this->dh->checkConnection()) {
            $result['error'] = 'Versuchen Sie es später erneut!';
            return $result;
        }

        // Prepared SQL statement to insert the product into the database
        $sql = 'INSERT INTO `products` (`kategorie`, `name`, `preis`, `beschreibung`)
        VALUES (?, ?, ?, ?)';
        $stmt = $this->dh->db_obj->prepare($sql);
        $stmt->bind_param('ssis', $category, $productName, $price, $description);

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
        $description = $param['description'];
        $currentPicturePath = "../" . $param['currentPicture'];

        // Perform validation
        if (empty($category) || empty($productName) || empty($price) || empty($description)) {
            $result['error'] = 'Bitte füllen Sie alle Felder aus!';
            return $result;
        }

        if (!is_numeric($price) || $price < 0) {
            $result['error'] = 'Preis muss valide Zahl sein!';
            return $result;
        }

        // Check the connection
        if (!$this->dh->checkConnection()) {
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
        $sql = 'UPDATE `products` SET `kategorie` = ?, `name` = ?, `preis` = ?, `beschreibung` = ? WHERE `id` = ?';
        $stmt = $this->dh->db_obj->prepare($sql);
        $stmt->bind_param('ssisi', $category, $productName, $price, $description, $productID);

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
        if (!$this->dh->checkConnection()) {
            $result["error"] = "Versuchen Sie es später erneut!";
            return $result;
        }

        // Prepare and execute the SQL query
        $stmt = $this->dh->db_obj->prepare("DELETE FROM `products` WHERE `id` = ?");
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
}
