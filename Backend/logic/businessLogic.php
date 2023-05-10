<?php
include('../config/dataHandler.php');
class businessLogic
{
    private $dh;
    function __construct()
    {
        $this->dh = new dataHandler();
    }
    /*  possibly add another Handler for non-DB-related services via backend, for example user that is already logged in
        private $uh; --> utilityHandler
        would need to be added to constructor of this class, i.e.:
        $this->uh = new utilityHandler();

        also consider session/cookie handling (see input in group-chat)
    */

    function handleRequest($method, $param)
    {
        switch ($method) {
            case 'registerUser':
                $res = $this->dh->registerUser($param);
                break;

            case "loginUser":
                $res = $this->dh->loginUser($param);
                break;
            case 'getSessionInfo':
                $res = $this->dh->getSessionInfo();
                break;

            case 'loadAllProducts':
                $res = $this->dh->loadAllProducts();
                break;

            case 'checkStock':
                $res = $this -> dh ->checkStock($param); 
                break; 
    

        }
        return $res;
    }
}
