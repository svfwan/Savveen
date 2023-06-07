<?php
class orderLogic
{
    private $dh;

    public function __construct($dh)
    {
        $this->dh = $dh;
    }


    //Rechnungsid bekommen
    function getCurrentReceipt_id()
    {

        $tab = array();

        // Prüfe die Verbindung zur Datenbank
        if (!$this->dh->checkConnection()) {
            $tab["error"] = "Versuchen Sie es später erneut!";
            return $tab;
        }


        //sql statement
        $sql = $this->dh->db_obj->prepare("SELECT `receipt_id` FROM `receipts` ORDER BY `receipt_id` DESC LIMIT 1");

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

        $id = $param['userid'];
        $gesamt = $param['gesamt'];
        $street = $param['adress'];
        $plz = $param['postcode'];
        $city = $param['ort'];

        // Prüfe die Verbindung zur Datenbank
        if (!$this->dh->checkConnection()) {
            $tab["error"] = "Versuchen Sie es später erneut!";
            return $tab;
        }

        //sql statement
        $sql = $this->dh->db_obj->prepare("INSERT INTO receipts (`user_id`,`total`, `street`,`postcode`,`city`) VALUES (?,?,?,?,?)");
        $sql->bind_param("iisis", $id, $gesamt, $street, $plz, $city);




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
        $id = $param['userid'];
        $recid = $param['receiptid'];

        // Prüfe die Verbindung zur Datenbank
        if (!$this->dh->checkConnection()) {
            $tab["error"] = "Versuchen Sie es später erneut!";
            return $tab;
        }


        // SQL statement
        $sql = $this->dh->db_obj->prepare("INSERT INTO orders(`product_id`, `quantity`, `user_id`, `receipt_id`, `price`,`productname` )
        SELECT ?, ?, ?, ?, preis, `name`  FROM products WHERE `id` = ?");
        $sql->bind_param("iiiii", $pid, $quant, $id, $recid, $pid);




        if ($sql->execute() && $sql->affected_rows > 0) {
            $tab['success'] = 'Bestellung wurde abgewickelt ';
        } else {
            $tab['error'] = 'Bestellung konnte nicht abgewickelt werden';
        }

        $sql->close();
        return $tab;
    }

    function getAddress($param)
    {


        $id = $param['userid'];

        $tab = array();

        // Prüfe die Verbindung zur Datenbank
        if (!$this->dh->checkConnection()) {
            $tab["error"] = "Versuchen Sie es später erneut!";
            return $tab;
        }


        //sql statement
        $sql = $this->dh->db_obj->prepare("SELECT `adresse`, `plz` , `ort`  FROM `users` WHERE `id` = ? LIMIT 1");
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

        // Schließe die Verbindung und gib das Array zurück
        $sql->close();
        return $tab;
    }




    //Bestellung anzeigen:

    function getOrderInfo($param)
    {

        $username = $param['username'];

        $tab = array();

        // Prüfe die Verbindung zur Datenbank
        if (!$this->dh->checkConnection()) {
            $tab["error"] = "Versuchen Sie es später erneut!";
            return $tab;
        }


        //sql statement
        $sql = $this->dh->db_obj->prepare("SELECT `product_id`, `quantity`, `receipt_id`  FROM `orders` WHERE `username` = ? ");
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
        if (!$this->dh->checkConnection()) {
            $tab["error"] = "Versuchen Sie es später erneut!";
            return $tab;
        }


        //sql statement
        $sql = $this->dh->db_obj->prepare("SELECT `preis`, `name` FROM `products` WHERE `id` = ? ");
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
        if (!$this->dh->checkConnection()) {
            $tab["error"] = "Versuchen Sie es später erneut!";
            return $tab;
        }


        //sql statement
        $sql = $this->dh->db_obj->prepare("SELECT `total` FROM `receipts` WHERE `receipt_id` = ?  ");
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
        $userid = $param['userid'];

        $tab = array();
        $idx = 0;
        $cur = 0;
        $arr = array();

        // Prüfe die Verbindung zur Datenbank
        if (!$this->dh->checkConnection()) {
            $tab["error"] = "Versuchen Sie es später erneut!";
            return $tab;
        }

        // SQL statement
        $sql = $this->dh->db_obj->prepare("SELECT `receipts`.`receipt_id`, `receipts`.`total`, `receipts`.`street`, `receipts`.`postcode`, `receipts`.`city`, `orders`.`quantity`, `orders`.`product_id`,`orders`.`price`, `orders`.`productname` FROM `receipts` INNER JOIN `orders` ON `receipts`.`user_id` = `orders`.`user_id` AND `receipts`.`receipt_id` = `orders`.`receipt_id` WHERE `receipts`.`user_id` = ? ORDER BY `receipts`.`receipt_id` ASC");
        $sql->bind_param("i", $userid);
        $sql->execute();
        $result = $sql->get_result();

        // Füge die Ergebnisse in das Array ein
        while ($row = $result->fetch_assoc()) {
            if ($idx == 0) {
                $cur = $row['receipt_id'];
            }
            if ($row['receipt_id'] == $cur) { //alte receipt_id
                array_push($arr, $row);
            } else { //neue receipt id
                array_push($tab, $arr); //alte Werte werden auf tab gepushed
                $arr = array(); //array leeren für neue werte
                array_push($arr, $row); //aktuellen wert auf das zwischenstand array pushen
                $cur = $row['receipt_id']; //aktuelle receipt id aktualisieren
            }
            $idx++;
        }

        array_push($tab, $arr);
        $sql->close();
        return $tab;
    }



    function getUserid($param)
    {
        //get userid from certain username
        //$username = $param['un'];

        $username = $param['un'];
        $tab = array();

        // Prüfe die Verbindung zur Datenbank
        if (!$this->dh->checkConnection()) {
            $tab["error"] = "Versuchen Sie es später erneut!";
            return $tab;
        }

        // SQL statement
        $sql = $this->dh->db_obj->prepare("SELECT `id` FROM `users`  WHERE `username` = ? ");
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
}
