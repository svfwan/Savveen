<?php
class orderLogic
{
    private $dh;

    public function __construct($dh)
    {
        $this->dh = $dh;
    }

    function processOrder($param)
    {
        $result = array();

        // Check the database connection
        if (!$this->dh->checkConnection()) {
            $result["error"] = "Versuchen Sie es später erneut!";
            return $result;
        }

        // Start a transaction
        $this->dh->db_obj->begin_transaction();

        $username = $param['username'];
        $cartItems = $param['cartItems'];
        $address = $param['address'];
        $postcode = $param['postcode'];
        $city = $param['city'];

        // Query the user ID based on the username
        $stmt = $this->dh->db_obj->prepare("SELECT `id` FROM `users` WHERE `username` = ?");
        $stmt->bind_param("s", $username);
        if (!$stmt->execute()) {
            $result['error'] = "Fehler bei der Datenbank!";
            $this->dh->db_obj->rollback();
            $stmt->close();
            return $result;
        }
        $queryResult = $stmt->get_result();
        $row = $queryResult->fetch_assoc();

        if (!$row) {
            $result['error'] = "Benutzer nicht gefunden!";
            $this->dh->db_obj->rollback();
            $stmt->close();
            return $result;
        }

        $user_id = $row['id'];
        $stmt->close();

        // Insert the receipt into the database
        $stmt = $this->dh->db_obj->prepare("INSERT INTO `receipts` (user_id, strasse, plz, ort, datum) VALUES (?, ?, ?, ?, NOW())");
        $stmt->bind_param("isss", $user_id, $address, $postcode, $city);
        if (!$stmt->execute()) {
            $result['error'] = "Fehler bei der Datenbank!";
            $this->dh->db_obj->rollback();
            $stmt->close();
            return $result;
        }
        $receipt_id = $stmt->insert_id;

        $stmt->close();

        // Create the order lines
        try {
            foreach ($cartItems as $item) {
                $product_id = $item['id'];
                $preis = $item['price'];
                $anzahl = $item['quantity'];

                // Insert the order line into the database
                $stmt = $this->dh->db_obj->prepare("INSERT INTO `orderlines` (receipt_id, product_id, preis, anzahl) VALUES (?, ?, ?, ?)");
                $stmt->bind_param("iiii", $receipt_id, $product_id, $preis, $anzahl);
                if (!$stmt->execute()) {
                    $result['error'] = "Fehler bei der Erstellung der Bestellung!";
                    $this->dh->db_obj->rollback();
                    return $result;
                }
                $stmt->close();
            }
        } catch (Exception $e) {
            $result['error'] = "Fehler bei der Erstellung der Bestellung!";
            $this->dh->db_obj->rollback();
            $stmt->close();
            return $result;
        }
        $this->dh->db_obj->commit();

        // Return a success response
        $result['success'] = 'Bestellung erfolgreich abgeschlossen!';
        $result['receipt'] = $receipt_id;
        return $result;
    }

    function getOrders($param)
    {
    }
}
