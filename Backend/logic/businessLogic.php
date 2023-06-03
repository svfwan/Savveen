<?php
include('../config/dbaccess.php');
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

        what about db_obj->close(); -> where to put it?
    */

    function handleRequest($method, $param)
    {
        $res = array();
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
            case 'logoutUser':
                $res = $this->dh->logoutUser();
                break;
            case 'loadAllProducts':
                $res = $this->dh->loadAllProducts();
                break;
            case 'loadProductByID':
                $res = $this->dh->loadProductByID($param);
                break;
            case 'checkStock':
                $res = $this->dh->checkStock($param);
                break;
            case 'reduceStock':
                $res = $this->dh->reduceStock($param);
                break;
            case 'searchProducts':
                $res = $this->dh->searchProducts($param);
                break;
            case 'reduceStock';
                $res = $this->dh->reduceStock($param);
                break;
            case 'createProduct':
                $res = $this->dh->createProduct();
                break;
            case 'updateProduct':
                $res = $this->dh->updateProduct();
                break;
            default:
                $res = null;
                break;
        }
        return $res;
    }
}
