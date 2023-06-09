<?php
include('./businessLogic.php');
$requestType = $_SERVER['REQUEST_METHOD'];
$method = '';
$param = '';

switch ($requestType) {
    case 'GET':
        isset($_GET['method']) ? $method = $_GET['method'] : false;
        isset($_GET['param']) ? $param = json_decode($_GET['param'], true) : false;
        break;
    case 'POST':
        isset($_POST['method']) ? $method = $_POST['method'] : false;
        isset($_POST['param']) ? $param = json_decode($_POST['param'], true) : false;
        break;
    default:
        http_response_code(400);
        break;
}

$logic = new businessLogic();
$result = $logic->handleRequest($method, $param);

if ($result == null) {
    response('GET', 400, null);
} else {
    response($requestType, 200, $result);
}

function response($request, $httpStatus, $data)
{
    header('Content-Type: application/json');
    if (in_array($request, array('GET', 'POST'))) {
        http_response_code($httpStatus);
        echo (json_encode($data));
    } else {
        http_response_code(405);
        echo ('Method not supported yet!');
    }
}
