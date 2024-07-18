<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: *");
header("Access-Control-Allow-Headers: *");
header("Cache-Control: no-cache, must-revalidate");

require_once "./module/Post.php";
require_once "./module/GET.php";
require_once "./module/Global.php";

require_once "./config/database.php";
require_once __DIR__ . '/bootstrap.php';
require_once "./src/Jwt.php";

if (isset($_REQUEST['request'])) {
    $request = explode('/', $_REQUEST['request']);
} else {
    echo "Not Found";

    http_response_code(404);
    exit();
}

$con = new Connection();
$pdo = $con->connect();
$post = new Post($pdo);
$get = new Get($pdo);

switch ($_SERVER['REQUEST_METHOD']) {
    case 'OPTIONS':
        http_response_code(200);
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        switch ($request[0]) {

            case 'login':
                $data = json_decode(file_get_contents("php://input"), true);

                if (!isset($data['email']) || !isset($data['password'])) {
                    throw new Exception("Missing login credentials", 400);
                }

                $user = $get->getByEmail($data['email']);
                $post->login($data, $user);
                break;

            case 'adduser':
                echo json_encode($post->add_user($data));
                break;

            case 'addproduct':
                echo json_encode($post->addProduct($data));
                break;

            case 'createcart':
                echo json_encode($post->createCart($data));
                break;
            case 'addtocart':
                echo json_encode($post->addProductToCart($data));
                break;

            default:
                echo "This is forbidden";
                http_response_code(403);
                break;
        }
        break;

    case 'GET':
        switch ($request[0]) {
            default:
                echo "This is forbidden";
                http_response_code(403);
                break;
        }
        break;

    default:
        echo "This is forbidden";
        http_response_code(403);
        break;
}
