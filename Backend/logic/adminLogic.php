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

        if (!$this->dh->checkConnection()) {
            $result['error'] = 'Versuchen Sie es später erneut!';
            return $result;
        }

        $sql = 'SELECT `id`, `` from `users` WHERE `admin` = ?';
        $stmt = $this->dh->db_obj->prepare($sql);
        $stmt->bind_param('i', 0);


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
        if (!$this->dh->checkConnection()) {
            $result['error'] = 'Versuchen Sie es später erneut!';
            return $result;
        }

        // Prepared SQL statement to insert the product into the database
        $sql = 'INSERT INTO `products` (`kategorie`, `name`, `preis`, `beschreibung`, `bestand`)
        VALUES (?, ?, ?, ?, ?)';
        $stmt = $this->dh->db_obj->prepare($sql);
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

    public function loadProductByID($param)
    {
        $result = array();

        // Prüfe die Verbindung zur Datenbank
        if (!$this->dh->checkConnection()) {
            $result["error"] = "Versuchen Sie es später erneut!";
            return $result;
        }

        // Prepare and execute the SQL query
        $stmt = $this->dh->db_obj->prepare("SELECT * FROM `products` WHERE `id` = ?");
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
        $sql = 'UPDATE `products` SET `kategorie` = ?, `name` = ?, `preis` = ?, `beschreibung` = ?, `bestand` = ? WHERE `id` = ?';
        $stmt = $this->dh->db_obj->prepare($sql);
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
