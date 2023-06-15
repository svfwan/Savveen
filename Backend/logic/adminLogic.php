<?php
class adminLogic
{
    private $dh;

    public function __construct($dh)
    {
        $this->dh = $dh;
    }

    // Funktion zum Laden aller Benutzer
    public function loadAllUsers()
    {
        $result = array();
        $notAdmin = 0;

        // Verbindung zur DB testen
        if (!$this->dh->checkConnection()) {
            $result['error'] = 'Versuchen Sie es später erneut!';
            return $result;
        }

        // Query um Beutzer die nicht Admin sind abzurufen
        $sql = 'SELECT `id`, `username` FROM `users` WHERE `admin` = ? ORDER BY `username`';
        $stmt = $this->dh->db_obj->prepare($sql);
        $stmt->bind_param('i', $notAdmin);

        if ($stmt->execute()) {
            $queryResult = $stmt->get_result();
            // Wenn es Beneutzer gibt iterieren und in result-Array einfügen
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

    // Funktion zum Laden eines bestimmten Benutzer nach ID
    public function loadUserByID($param)
    {
        $result = array();

        // Verbindung zu DB testen
        if (!$this->dh->checkConnection()) {
            $result['error'] = 'Versuchen Sie es später erneut!';
            return $result;
        }

        // Lade alle notwendigen Daten des Benutzers
        $sql = 'SELECT `id`, `aktiv`,`anrede`, `vorname`, `nachname`, `adresse`, `plz`, `ort`, `email`, `username`
        FROM `users` WHERE `id` = ?';
        $stmt = $this->dh->db_obj->prepare($sql);
        $stmt->bind_param('i', $param);

        if ($stmt->execute()) {
            $queryResult = $stmt->get_result();
            // Wenn der Benutzer gefunden wurde, schicke das Ergebnis im result-Array mit
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

    // Funktion zum Aktivieren eines Benutzers
    public function activateUser($param)
    {
        $result = array();

        // Verbindung zu DB testen
        if (!$this->dh->checkConnection()) {
            $result['error'] = 'Versuchen Sie es später erneut!';
            return $result;
        }

        // Update-Query zum Ändern des booleans `aktiv` des Benutzers
        $sql = 'UPDATE `users` SET `aktiv` = 1 WHERE `id` = ?';
        $stmt = $this->dh->db_obj->prepare($sql);
        $stmt->bind_param('i', $param);

        // Wenn erfolgreiche Query und die Reihe verändert wurde dann teile das mit
        if ($stmt->execute() && $stmt->affected_rows > 0) {
            $result['success'] = 'Benutzer erfolgreich aktiviert!';
        } else {
            // Ansonsten informieren, dass der Benutzer bereits aktiviert ist
            $result['error'] = 'Benutzer ist bereits aktiviert!';
        }

        $stmt->close();

        return $result;
    }
    // Funktion zum Deaktivieren eines Benutzers
    public function deactivateUser($param)
    {
        $result = array();
        // Verbindung zu DB testen
        if (!$this->dh->checkConnection()) {
            $result['error'] = 'Versuchen Sie es später erneut!';
            return $result;
        }

        // Update-Query zum Ändern des booleans `aktiv` des Benutzers
        $sql = 'UPDATE `users` SET `aktiv` = 0 WHERE `id` = ?';
        $stmt = $this->dh->db_obj->prepare($sql);
        $stmt->bind_param('i', $param);

        // Wenn erfolgreiche Query und die Reihe verändert wurde dann teile das mit
        if ($stmt->execute() && $stmt->affected_rows > 0) {
            $result['success'] = 'Benutzer erfolgreich deaktiviert!';
        } else {
            // Ansonsten informieren, dass der Benutzer bereits deaktiviert ist
            $result['error'] = 'Benutzer ist bereits deaktiviert!';
        }

        $stmt->close();

        return $result;
    }

    // Funktion zum Laden der Bestellungen eines Benutzers
    public function loadOrdersByUserID($param)
    {
        $result = array();

        // Verbindung zu DB testen
        if (!$this->dh->checkConnection()) {
            $result['error'] = 'Versuchen Sie es später erneut!';
            return $result;
        }

        // Query zum Laden aller IDs von Bestellungen des gewählten Benutzers
        $sql = 'SELECT `id` FROM `receipts` WHERE `user_id` = ? ORDER BY `datum`, `id`';
        $stmt = $this->dh->db_obj->prepare($sql);
        $stmt->bind_param('i', $param);

        if ($stmt->execute()) {
            $queryResult = $stmt->get_result();
            // Wenn der Benutzer Bestellungen hat in result-Array speichern
            if ($queryResult->num_rows > 0) {
                $orders = array();
                while ($row = $queryResult->fetch_assoc()) {
                    array_push($orders, $row);
                }
                $result['success'] = 'Bestellungen geladen';
                $result['data'] = $orders;
            } else {
                // Ansonsten mitteilen, dass er keine Bestellungen hat
                $result['noOrders'] = 'Dieser Benuter hat keine Bestellungen';
            }
        } else {
            $result['error'] = 'Inkorrekte Benutzerdaten, versuchen Sie es später erneut!';
        }

        $stmt->close();

        return $result;
    }

    // Funktion zum Laden der Bestellungsdaten einer spezifischen Bestellung
    public function loadOrderByID($param)
    {
        $result = array();

        // Verbindung zur DB testen
        if (!$this->dh->checkConnection()) {
            $result['error'] = 'Versuchen Sie es später erneut!';
            return $result;
        }

        // Query zum Abfragen aller Infos zu einer Bestellung
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
            // Wenn die Bestellpositionen gefunden wurden dann im result-Array mitgeben
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

    // Funktion zum Ändern einer Bestellposition
    public function changeOrderLine($param)
    {
        $result = array();
        $orderlineID = $param['orderlineID'];
        $receiptID = $param['receiptID'];

        // Verbindung zur DB testen
        if (!$this->dh->checkConnection()) {
            $result["error"] = "Versuchen Sie es später erneut!";
            return $result;
        }

        // Update bzw. Delete Query, je nach dem ob Bestellposition mehr als 1 Produkt beinhaltet
        $stmtUpdateOrDelete = $this->dh->db_obj->prepare("
        IF (SELECT anzahl FROM `orderlines` WHERE `id` = ?) > 1
        THEN
            UPDATE `orderlines` SET `anzahl` = `anzahl` - 1 WHERE `id` = ?;
        ELSE
            DELETE FROM `orderlines` WHERE `id` = ?;
        END IF;
        ");
        $stmtUpdateOrDelete->bind_param("iii", $orderlineID, $orderlineID, $orderlineID);
        if ($stmtUpdateOrDelete->execute()) {
            // Checken ob Rechnung noch vorhanden, denn falls die letzte Bestellposition gelöscht wurde vorher
            // dann wird ein Trigger (siehe SQL-Datei) in der DB ausgeführt welcher automatisch die Zeile 
            // in der Tabelle `receipts` löscht
            $stmtCheckReceipt = $this->dh->db_obj->prepare("SELECT COUNT(*) FROM `receipts` WHERE `id` = ?");
            $stmtCheckReceipt->bind_param("i", $receiptID);
            if ($stmtCheckReceipt->execute()) {
                $queryResult = $stmtCheckReceipt->get_result();
                $receiptExists = $queryResult->fetch_row()[0];
                // Je nachdem dann die Antwort mitgeben
                if ($receiptExists === 0) {
                    $result['lastProduct'] = "Bestellung erfolgreich gelöscht!";
                } else {
                    $result['success'] = "Produkt erfolgreich von Bestellung entfernt!";
                }
            }
            $stmtCheckReceipt->close();
        } else {
            $result["error"] = "Produkt konnte nicht von Bestellung entfernt werden!";
        }

        $stmtUpdateOrDelete->close();
        return $result;
    }

    // Funktion zum Erstellen eines Produktes
    public function createProduct()
    {
        $result = array();
        $param = $_POST;
        $category = $param['category'];
        $productName = $param['productName'];
        $price = $param['price'];
        $description = $param['description'];

        // Validierung
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

        // Validieren ob Bild
        $allowedExtensions = array('jpg', 'jpeg', 'png', 'gif');
        if (!in_array(strtolower($fileExtension), $allowedExtensions)) {
            $result['error'] = 'Ungültige Dateierweiterung! Nur JPG, JPEG, PNG und GIF sind erlaubt.';
            return $result;
        }

        // Bildpfad vorbereiten
        $filename = $productName . '.jpg';
        $actual_path = "../../Frontend/res/img/" . $filename;

        // Verbindung zur DB testen
        if (!$this->dh->checkConnection()) {
            $result['error'] = 'Versuchen Sie es später erneut!';
            return $result;
        }

        // Query zum Erstellen des Produktes in der DB
        $sql = 'INSERT INTO `products` (`kategorie`, `name`, `preis`, `beschreibung`)
        VALUES (?, ?, ?, ?)';
        $stmt = $this->dh->db_obj->prepare($sql);
        $stmt->bind_param('ssis', $category, $productName, $price, $description);

        // Wenn Produkt in DB erstellt und Bild gespeichert wurde im Pfad dann im resukt-Array mitgeben
        if ($stmt->execute() && $stmt->affected_rows > 0 && move_uploaded_file($tmp_path, $actual_path)) {
            $result['success'] = 'Produkt erfolgreich hinzugefügt!';
        } else {
            $result['error'] = 'Fehler beim Erstellen des Produkts!';
        }

        $stmt->close();
        return $result;
    }

    // Funktion zum Aktualisieren eines Produktes
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

        // Validierung
        if (empty($category) || empty($productName) || empty($price) || empty($description)) {
            $result['error'] = 'Bitte füllen Sie alle Felder aus!';
            return $result;
        }

        if (!is_numeric($price) || $price < 0) {
            $result['error'] = 'Preis muss valide Zahl sein!';
            return $result;
        }

        // Verbindung zur DB testen
        if (!$this->dh->checkConnection()) {
            $result['error'] = 'Versuchen Sie es später erneut!';
            return $result;
        }

        $databaseUpdated = false;
        $pictureMoved = false;

        // Wenn auch ein Bild mitgegeben wurde dann wird validiert und das Bild gespeichert
        // ansonsten das existierende Bild umbenannt
        if (isset($_FILES['picture']) && $_FILES['picture']['size'] > 0) {
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

        // Update-Query zum Ändern der Produktdaten
        $sql = 'UPDATE `products` SET `kategorie` = ?, `name` = ?, `preis` = ?, `beschreibung` = ? WHERE `id` = ?';
        $stmt = $this->dh->db_obj->prepare($sql);
        $stmt->bind_param('ssisi', $category, $productName, $price, $description, $productID);

        if ($stmt->execute()) {
            // Wenn tatsächlich Daten in der DB geändert wurden
            if ($stmt->affected_rows > 0) {
                $databaseUpdated = true;
            }
        } else {
            $result['error'] = 'Fehler beim Aktualisieren des Produkts!';
            $stmt->close();
            return $result;
        }

        $stmt->close();

        // Wenn Daten in der DB oder das Bild geändert bzw umbenannt wurde
        // dann teile das mit, da man ja das Bild nicht ändern muss
        if ($databaseUpdated || $pictureMoved) {
            $result['success'] = 'Produkt erfolgreich aktualisiert!';
        } else {
            $result['error'] = 'Daten bereits aktuell!';
        }

        return $result;
    }

    // Funktion zum Löschen eines Produktes
    public function deleteProduct($param)
    {
        $result = array();
        $id = $param['id'];
        $currentPicturePath = "../" . $param['currentPicture'];

        // Verbindung zur DB testen
        if (!$this->dh->checkConnection()) {
            $result["error"] = "Versuchen Sie es später erneut!";
            return $result;
        }

        // Query zum Löschend des Produktes in der DB
        $stmt = $this->dh->db_obj->prepare("DELETE FROM `products` WHERE `id` = ?");
        $stmt->bind_param("i", $id);
        // Wenn die Daten gelöscht wurden und das Bild aus dem Ordner der Produktbilder gelöscht wurde
        // dann teile das mit
        if ($stmt->execute() && unlink($currentPicturePath)) {
            $result['success'] = "Produkt wurde erfolgreich gelöscht";
        } else {
            $result["error"] = "Produkt konnte nicht gelöscht werden!";
        }

        $stmt->close();
        return $result;
    }
}
