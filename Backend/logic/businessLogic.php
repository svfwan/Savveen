<?php
include('../config/dataHandler.php');
class businessLogic
{
    private $dh;
    function __construct()
    {
        $this->dh = new dataHandler();
    }

    function handleRequest($method, $param)
    {
        switch ($method) {
            case "registerUser":
                $res = $this->dh->registerUser($param);
                break;
            
            case "loginUser":
                $res=$this->dh->loginUser($param);
        }
        return $res;
    }
}
