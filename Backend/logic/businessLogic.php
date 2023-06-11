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
            case 'getSessionInfo':
                $res = $this->profileLogic->getSessionInfo();
                break;
            case 'registerUser':
                $res = $this->profileLogic->registerUser($param);
                break;
            case "loginUser":
                $res = $this->profileLogic->loginUser($param);
                break;
            case 'getProfileData';
                $res = $this->profileLogic->getProfileData($param);
                break;
            case 'updateUserData';
                $res = $this->profileLogic->updateUserData($param);
                break;
            case 'logoutUser':
                $res = $this->profileLogic->logoutUser();
                break;
            case 'loadAllProducts':
                $res = $this->productLogic->loadAllProducts();
                break;
            case 'searchProducts':
                $res = $this->productLogic->searchProducts($param);
                break;
            case 'loadProductByID':
                $res = $this->productLogic->loadProductByID($param);
                break;
            case 'processOrder':
                $res = $this->orderLogic->processOrder($param);
                break;
            case 'loadAllUsers':
                $res = $this->adminLogic->loadAllUsers();
                break;
            case 'createProduct':
                $res = $this->adminLogic->createProduct();
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
