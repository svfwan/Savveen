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
            case 'searchProducts':
                $res = $this->dh->searchProducts($param);
                break;
            case 'getCurrentReceipt_id':
                $res = $this->dh->getCurrentReceipt_id();
                break;
            case 'getAddress':
                $res = $this->dh->getAddress($param);
                break;
            case 'createReceipt':
                $res = $this->dh->createReceipt($param);
                break;
            case 'createProduct':
                $res = $this->dh->createProduct();
                break;
            case 'deleteProduct':
                $res = $this->dh->deleteProduct($param);
                break;
            case 'updateProduct':
                $res = $this->dh->updateProduct();
                break;
            case 'processOrder':
                $res = $this->dh->processOrder($param);
                break;
            case 'getOrderInfo':
                $res = $this->dh->getOrderInfo($param);
                break;
            case 'getProductPrice':
                $res = $this->dh->getProductPrice($param);
                break;
            case 'getTotal':
                $res = $this->dh->getTotal($param);
                break;
            case 'getOrders':
                $res = $this->dh->getOrders($param);
                break;
            case 'updateUserData';
                $res = $this->dh->updateUserData($param);
                break;
            case 'getProfileData';
                $res = $this->dh->getProfileData();
                break;

                case 'getUserid';
                $res = $this->dh->getUserid($param);
                break;
            default:
                $res = null;
                break;
        }
        return $res;
    }
}
