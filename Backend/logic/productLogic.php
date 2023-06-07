<?php
class productLogic
{
    private $dh;

    public function __construct($dh)
    {
        $this->dh = $dh;
    }

    public function loadAllProducts()
    {
        //hier werden die fkt reingeschrieben. 


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

    //checkStock()
    public function checkStock($param)
    {
        $result = array();
        $id = $param['id'];

        // Check the database connection
        if (!$this->dh->checkConnection()) {
            $result["error"] = "Versuchen Sie es später erneut!";
            return $result;
        }

        // Prepare and execute the SQL query
        $stmt = $this->dh->db_obj->prepare("SELECT * FROM `products` WHERE `id` = ?");
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

    function searchProducts($param)
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
