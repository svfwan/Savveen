<?php
class productLogic
{
    private $dh;

    public function __construct($dh)
    {
        $this->dh = $dh;
    }

    public function loadAllProducts() //alle produkte aus der db holen
    {

        $result = array(); // Initialisiere das Array

        // Prüfe die Verbindung zur Datenbank
        if (!$this->dh->checkConnection()) {
            $result["error"] = "Versuchen Sie es später erneut!";
            return $result;
        }

        // Führe die SQL-Abfrage aus
        $stmt = $this->dh->db_obj->prepare("SELECT * FROM `products`");
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

    function searchProducts($param) //nach produkten suchen, die einen buchstaben/wort enthalten
    {
        $result = array();
        $searchTerm = $param['letter'];

        // Verbindung zur DB prüfen
        if (!$this->dh->checkConnection()) {
            $result["error"] = "Versuchen Sie es später erneut!";
            return $result;
        }

        // Führe die SQL-Abfrage aus
        $stmt = $this->dh->db_obj->prepare("SELECT * FROM `products`");
        if ($stmt->execute()) {
            $queryResult = $stmt->get_result();
            // Füge die Ergebnisse in das Array ein
            while ($row = $queryResult->fetch_assoc()) {
                //produktname und buchstaben in kleinbuchstaben umwandeln, damit es case insensitive ist
                if (stripos(strtolower($row['name']), strtolower($searchTerm)) !== false) {
                    array_push($result, $row);
                }
            }
            // überprüfe, ob produkte gefunden wurden. 
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

    public function loadProductByID($param) //die details zu einem produkt angeben, productid ist gegeben
    {
        $result = array();

        // Prüfe die Verbindung zur Datenbank
        if (!$this->dh->checkConnection()) {
            $result["error"] = "Versuchen Sie es später erneut!";
            return $result;
        }

        // SQL - Prepared Statemenent durchführen 
        $stmt = $this->dh->db_obj->prepare("SELECT * FROM `products` WHERE `id` = ?");
        $stmt->bind_param("i", $param);
        if ($stmt->execute()) {
            $queryResult = $stmt->get_result();
            $row = $queryResult->fetch_assoc();
            if ($row) { //produkt gefunden
                $result["success"] = true;
                $result["data"] = $row;
            } else {
                $result["success"] = false; //produkt nicht gefunden
                $result["error"] = "Produkt nicht gefunden";
            }
        } else {
            $result["error"] = "Versuchen Sie es später erneut!";
        }
        //Verbindung schließen und array zurückgeben
        $stmt->close();
        return $result;
    }
}
