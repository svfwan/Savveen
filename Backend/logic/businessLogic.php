<?php
include('../config/dataHandler.php');
include('profileLogic.php');
include('productLogic.php');
include('orderLogic.php');
include('adminLogic.php');
class businessLogic
{
    private $productLogic;
    private $profileLogic;
    private $orderLogic;
    private $adminLogic;
    function __construct()
    {
        $dh = new dataHandler();
        $this->productLogic = new productLogic($dh);
        $this->profileLogic = new profileLogic($dh);
        $this->orderLogic = new orderLogic($dh);
        $this->adminLogic = new adminLogic($dh);
        session_start();
    }

    function handleRequest($method, $param)
    {
        $res = array();
        switch ($method) {
            case 'registerUser':
                $res = $this->profileLogic->registerUser($param);
                break;
            case "loginUser":
                $res = $this->profileLogic->loginUser($param);
                break;
            case 'getSessionInfo':
                $res = $this->profileLogic->getSessionInfo();
                break;
            case 'logoutUser':
                $res = $this->profileLogic->logoutUser();
                break;
            case 'updateUserData';
                $res = $this->profileLogic->updateUserData($param);
                break;
            case 'getProfileData';
                $res = $this->profileLogic->getProfileData();
                break;
            case 'loadAllProducts':
                $res = $this->productLogic->loadAllProducts();
                break;
            case 'checkStock':
                $res = $this->productLogic->checkStock($param);
                break;
            case 'searchProducts':
                $res = $this->productLogic->searchProducts($param);
                break;
            case 'getCurrentReceipt_id':
                $res = $this->orderLogic->getCurrentReceipt_id();
                break;
            case 'getAddress':
                $res = $this->orderLogic->getAddress($param);
                break;
            case 'createReceipt':
                $res = $this->orderLogic->createReceipt($param);
                break;
            case 'processOrder':
                $res = $this->orderLogic->processOrder($param);
                break;
            case 'getOrderInfo':
                $res = $this->orderLogic->getOrderInfo($param);
                break;
            case 'getProductPrice':
                $res = $this->orderLogic->getProductPrice($param);
                break;
            case 'getTotal':
                $res = $this->orderLogic->getTotal($param);
                break;
            case 'getOrders':
                $res = $this->orderLogic->getOrders($param);
                break;
            case 'getUserid';
                $res = $this->orderLogic->getUserid($param);
                break;
            case 'createProduct':
                $res = $this->adminLogic->createProduct();
                break;
            case 'loadProductByID':
                $res = $this->adminLogic->loadProductByID($param);
                break;
            case 'updateProduct':
                $res = $this->adminLogic->updateProduct();
                break;
            case 'deleteProduct':
                $res = $this->adminLogic->deleteProduct($param);
                break;
            default:
                $res = null;
                break;
        }
        return $res;
    }
}
