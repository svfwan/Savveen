<?php
include('dbaccess.php');
class dataHandler
{
    public $db_obj;

    public function __construct()
    {
        global $host, $user, $password, $database;
        $this->db_obj = new mysqli($host, $user, $password, $database);
    }

    public function __destruct()
    {
        $this->db_obj->close();
    }

    public function checkConnection()
    {
        if ($this->db_obj->connect_error) {
            return false;
        } else {
            return true;
        }
    }
}
