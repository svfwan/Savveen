<?php
class orderLogic
{
    private $dh;

    public function __construct($dh)
    {
        $this->dh = $dh;
    }

    function processOrder($param) //bestellung verarbeiten
    {
        $result = array();

        // datenbankverbindung überprüfen
        if (!$this->dh->checkConnection()) {
            $result["error"] = "Versuchen Sie es später erneut!";
            return $result;
        }

        // Start a transaction
        $this->dh->db_obj->begin_transaction(); //Gruppiert einer Reihe von Datenbankoperationen als einen Schritt

        //parameter aus $param speichern. 
        $username = $param['username'];
        $cartItems = $param['cartItems'];
        $address = $param['address'];
        $postcode = $param['postcode'];
        $city = $param['city'];

        // userid je nach username abfragen
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


        //Rechnung in db einfügen
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

        // Orderlines erstellen
        try {
            foreach ($cartItems as $item) {
                $product_id = $item['id'];
                $preis = $item['price'];
                $anzahl = $item['quantity'];

                // Orderlines in db einfügen
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

        // gibt nachricht zurück
        $result['success'] = 'Bestellung erfolgreich abgeschlossen!';
        $result['receipt'] = $receipt_id;
        return $result;
    }

    function getOrders($param) //Bestellungen zu einem user aus der db holen
    {
        $username = $param['username'];
        $tab = array();
        $idx = 0;
        $cur = 0;
        $arr = array();


        if (!$this->dh->checkConnection()) {
            $result["error"] = "Versuchen Sie es später erneut!";
            return $result;
        }

        // SQL statement

        //Da der username gegeben ist und nicht die userid, wird diese mittels SELECT 'id' from 'users' where username = ? ermittelt
        //table products und orderlines werden gejoined, sodass die rechnungsids übereinstimmen
        //es wird zuerst nach datum, dann nach aufsteigender rechnungsid sortiert. 
        //summe, produktname, datum, rechnungsid, adresse, productid, preis der einzelnen produkte werden aus den tabellen geholt.
        $sql = "SELECT `receipts`.`summe`,`products`.`name`, `receipts`.`datum`, 
        `receipts`.`id`, `receipts`.`strasse`, `receipts`.`plz`, 
        `receipts`.`ort`, `orderlines`.`anzahl`, 
        `orderlines`.`product_id`, `orderlines`.`preis` 
        FROM `receipts` INNER JOIN `orderlines` ON `receipts`.`id` = `orderlines`.`receipt_id` 
        INNER JOIN `products` ON `orderlines`.`product_id` = `products`.`id` 
        WHERE `receipts`.`user_id` = (SELECT `id` FROM `users` WHERE `username` = ?) 
        ORDER BY `receipts`.`datum`, `receipts`.`id` ASC";
        $stmt = $this->dh->db_obj->prepare($sql);
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();

        // Füge die Ergebnisse in das Array ein
        //ein array, indem jeder eintrag ein weiteres array mit der selben rechnungsid ist. 

        while ($row = $result->fetch_assoc()) {
            if ($idx == 0) {
                $cur = $row['id'];
            }
            if ($row['id'] == $cur) { //alte receipt_id
                array_push($arr, $row);
            } else { //neue receipt id
                array_push($tab, $arr); //alte Werte werden auf tab gepushed
                $arr = array(); //array leeren für neue werte
                array_push($arr, $row); //aktuellen wert auf das zwischenstand array pushen
                $cur = $row['id']; //aktuelle receipt id aktualisieren
            }
            $idx++;
        }
        array_push($tab, $arr);

        $stmt->close();

        return $tab;
    }
}
