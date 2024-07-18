<?php
require_once 'Global.php';
require __DIR__ . "/../../vendor/autoload.php";

class Post extends GlobalMethods
{
    private $pdo;
    public function __construct(\PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function login($data, $user)
    {
        if ($user !== false && isset($user['password'])) {
            if (!password_verify($data['password'], $user['password'])) {
                return $this->sendPayload(null, "failed", "Invalid Credentials.", 401);
            }

            $JwtController = new Jwt($_ENV["SECRET_KEY"]);
            $tokenData = [
                "user_id" => $user['user_id'],
                "email" => $user['email'],
            ];

            $token = $JwtController->encode($tokenData);

            http_response_code(200);
            echo json_encode(["token" => $token]);
        } else {
            if ($user === false) {
                return $this->sendPayload(null, "failed", "User not found.", 404);
            } else {
                return $this->sendPayload(null, "failed", "Invalid credentials or user data.", 401);
            }
        }
    }


    public function add_user($data)
    {

        if (
            !isset(
                $data->first_name,
                $data->last_name,
                $data->username,
                $data->email,
                $data->password,
            )
        ) {
            return $this->sendPayload(null, 'failed', "Incomplete user data.", 400);
        }

        if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
            return $this->sendPayload(null, 'failed', "Invalid email format.", 400);
        }

        if (strlen($data->password) < 8) {
            return $this->sendPayload(null, 'failed', "Password must be at least 8 characters long.", 400);
        }

        $first_name = $data->first_name;
        $last_name = $data->last_name;
        $user_name = $data->username;
        $email = $data->email;
        $password = $data->password;


        $hashed_password = password_hash($password, PASSWORD_DEFAULT);

        $sql = "INSERT INTO user (first_name, last_name, username, email,  password ) 
                VALUES (?, ?, ?, ?, ?)";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                $first_name,
                $last_name,
                $user_name,
                $email,
                $hashed_password
            ]);

            if ($stmt->rowCount() > 0) {

                return $this->sendPayload(null, 'success', "User added successfully.", 200);
            } else {
                return $this->sendPayload(null, 'failed', "Failed to add user.", 500);
            }
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }

    public function  addProduct($data)
    {
        $sql = "INSERT INTO products (name, price, description) 
                VALUES (?, ?, ?)";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                $data->name,
                $data->price,
                $data->description
            ]);

            if ($stmt->rowCount() > 0) {

                return $this->sendPayload(null, 'success', "Record added successfully.", 200);
            } else {
                return $this->sendPayload(null, 'failed', "Failed to add record.", 500);
            }
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }

    public function  createCart($data)
    {
        $sql = "INSERT INTO user_carts (user_id) 
                VALUES (?)";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                $data->user_id
            ]);

            if ($stmt->rowCount() > 0) {

                return $this->sendPayload(null, 'success', "Record added successfully.", 200);
            } else {
                return $this->sendPayload(null, 'failed', "Failed to add record.", 500);
            }
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }
    public function addProductToCart($data)
    {
        try {
            // fetch price
            $sql = "SELECT price FROM products WHERE id = :product_id";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(['product_id' => $data->product_id]);
            $product = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($product) {
                $price = $product['price'];

                // ambatuaddtukart
                $sql = "INSERT INTO user_cart_items (cart_id, product_id, price) 
                    VALUES (:cart_id, :product_id, :price)";
                $stmt = $this->pdo->prepare($sql);
                $stmt->execute([
                    'cart_id' => $data->cart_id,
                    'product_id' => $data->product_id,
                    'price' => $price
                ]);

                if ($stmt->rowCount() > 0) {
                    return $this->sendPayload(null, 'success', "Record added successfully.", 200);
                } else {
                    return $this->sendPayload(null, 'failed', "Failed to add record.", 500);
                }
            } else {
                return $this->sendPayload(null, 'failed', "Product not found.", 404);
            }
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }
}
