<?php
header("Access-Control-Allow-Origin: *");
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE");
    header("Access-Control-Allow-Headers: Content-Type");
    http_response_code(200);
    exit;
}
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE");
header("Access-Control-Allow-Headers: Content-Type");
http_response_code(200);

require_once "./module/Post.php";
require_once "./module/GET.php";
require_once "./module/Global.php";

require_once "./config/database.php";
require_once __DIR__ . '/bootstrap.php';
require_once "./src/Jwt.php";


$con = new Connection();
$pdo = $con->connect();
$post = new Post($pdo);
$get = new Get($pdo);



if (isset($_REQUEST['request'])) {
    $request = explode('/', $_REQUEST['request']);
} else {
    echo "Not Found";

    http_response_code(404);
    exit();
}

switch ($_SERVER['REQUEST_METHOD']) {
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

            case 'addtocart':
                echo json_encode($post->addProductToCart($data));
                break;

            case 'orderitem':
                echo json_encode($post->createOrder($data));
                break;

            case 'buynow':
                echo json_encode($post->buyNow($data));
                break;

            default:
                echo "This is forbidden";
                http_response_code(403);
                break;
        }
        break;

    case 'GET':
        switch ($request[0]) {

            case 'products':
                if (isset($request[1])) {
                    echo json_encode($get->getAllProducts($request[1]));
                } else {
                    echo json_encode($get->getAllProducts());
                }
                break;

            case 'carts':
                if (isset($request[1])) {
                    echo json_encode($get->getCart($request[1]));
                } else {
                    echo json_encode($get->getCart());
                }
                break;

                // case 'cartitems':
                //     if (isset($request[1])) {
                //         echo json_encode($get->getCartItems($request[1]));
                //     } else {
                //         echo ("No id provided");
                //     }
                //     break;

            case 'cartitems':
                if (isset($request[1])) {
                    echo json_encode($get->getUserCartWithItems($request[1]));
                } else {
                    echo ("No id provided");
                }
                break;

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
