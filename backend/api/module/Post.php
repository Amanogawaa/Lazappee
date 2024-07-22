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

            $sql = "SELECT id FROM user_carts WHERE user_id = :user_id";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(['user_id' => $user['id']]);
            $cart = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$cart) {
                $sql = "INSERT INTO user_carts (user_id) VALUES (:user_id)";
                $stmt = $this->pdo->prepare($sql);
                $stmt->execute(['user_id' => $user['id']]);
                $id = $this->pdo->lastInsertId();
            } else {
                $id = $cart['id'];
            }

            $JwtController = new Jwt($_ENV["SECRET_KEY"]);
            $tokenData = [
                "id" => $user['id'],
                "email" => $user['email'],
                "cart_id" => $id
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
        $sql = "INSERT INTO products (name, price, description, stock, image) 
                VALUES (?, ?, ?, ?, ?)";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                $data->name,
                $data->price,
                $data->description,
                $data->stock,
                $data->image
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

    public function uploadImage($id)
    {
        $fileData = file_get_contents($_FILES["file"]["tmp_name"]);

        $sql = "UPDATE products SET image = ? WHERE id = ?";

        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                $fileData,
                $id
            ]);
            return $this->sendPayload(null, "success", "Successfully uploaded file", 200);
        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 400;
        }
        return $this->sendPayload(null, "failed", $errmsg, $code);
    }

    //function for user cart
    public function addProductToCart($data)
    {
        try {
            $this->pdo->beginTransaction();

            // Check if the user already has a cart
            $sql = "SELECT id FROM user_carts WHERE user_id = :user_id AND id = :cart_id";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(['user_id' => $data->user_id, 'cart_id' => $data->cart_id]);
            $cart = $stmt->fetch(PDO::FETCH_ASSOC);

            // If no cart exists, create one
            if (!$cart) {
                $sql = "INSERT INTO user_carts (user_id) VALUES (:user_id)";
                $stmt = $this->pdo->prepare($sql);
                $stmt->execute(['user_id' => $data->user_id]);

                $cartId = $this->pdo->lastInsertId();
            } else {
                $cartId = $cart['id'];
            }

            // Fetch product details
            $sql = "SELECT price, stock FROM products WHERE id = :product_id";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(['product_id' => $data->product_id]);
            $product = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($product) {
                $price = $product['price'];
                $stock = $product['stock'];

                // Check if sufficient stock is available
                if ($data->quantity > $stock) {
                    $this->pdo->rollBack();
                    return $this->sendPayload(null, 'failed', "Not enough stock available.", 400);
                }

                // Check if the product is already in the cart
                $sql = "SELECT id, quantity FROM user_cart_items WHERE cart_id = :cart_id AND product_id = :product_id";
                $stmt = $this->pdo->prepare($sql);
                $stmt->execute([
                    'cart_id' => $cartId,
                    'product_id' => $data->product_id
                ]);
                $existingItem = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($existingItem) {
                    // Update quantity if item is already in the cart
                    $newQuantity = $existingItem['quantity'] + $data->quantity;
                    $sql = "UPDATE user_cart_items SET quantity = :quantity WHERE id = :id";
                    $stmt = $this->pdo->prepare($sql);
                    $stmt->execute([
                        'quantity' => $newQuantity,
                        'id' => $existingItem['id']
                    ]);
                } else {
                    // Insert new item into user_cart_items
                    $sql = "INSERT INTO user_cart_items (cart_id, product_id, price, quantity) 
                        VALUES (:cart_id, :product_id, :price, :quantity)";
                    $stmt = $this->pdo->prepare($sql);
                    $stmt->execute([
                        'cart_id' => $cartId,
                        'product_id' => $data->product_id,
                        'price' => $price,
                        'quantity' => $data->quantity
                    ]);
                }

                // Update stock in products table
                $newStock = $stock - $data->quantity;
                $sql = "UPDATE products SET stock = :stock WHERE id = :product_id";
                $stmt = $this->pdo->prepare($sql);
                $stmt->execute([
                    'stock' => $newStock,
                    'product_id' => $data->product_id
                ]);

                if ($stmt->rowCount() > 0) {
                    $this->pdo->commit();
                    return $this->sendPayload(null, 'success', "Item added to cart successfully.", 200);
                } else {
                    $this->pdo->rollBack();
                    return $this->sendPayload(null, 'failed', "Failed to add item to cart.", 500);
                }
            } else {
                $this->pdo->rollBack();
                return $this->sendPayload(null, 'failed', "Product not found.", 404);
            }
        } catch (PDOException $e) {
            $this->pdo->rollBack();
            error_log("Database error: " . $e->getMessage());
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }

    public function createOrder($data)
    {
        if (empty($data->user_id) || empty($data->product_id) || empty($data->quantity) || empty($data->cart_id)) {
            return $this->sendPayload(null, 'failed', 'User ID, product ID, quantity, and cart ID are required.', 400);
        }

        try {
            $this->pdo->beginTransaction();

            // Fetch the specific cart item including quantity
            $sql = "SELECT ci.product_id, ci.price, ci.quantity, p.name
            FROM user_cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.cart_id = :cart_id AND ci.product_id = :product_id";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                'cart_id' => $data->cart_id,
                'product_id' => $data->product_id
            ]);
            $cartItem = $stmt->fetch(PDO::FETCH_ASSOC);

            if (empty($cartItem)) {
                return $this->sendPayload(null, 'failed', 'Item not found in cart.', 404);
            }

            // Validate the requested quantity
            if ($data->quantity > $cartItem['quantity']) {
                return $this->sendPayload(null, 'failed', 'Requested quantity exceeds available quantity.', 400);
            }

            // Calculate total price for this item
            $totalPrice = $cartItem['price'] * $data->quantity;

            // Insert into user_orders
            $sql = "INSERT INTO user_orders (user_id, total_price) VALUES (:user_id, :total_price)";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                'user_id' => $data->user_id,
                'total_price' => $totalPrice
            ]);

            $orderId = $this->pdo->lastInsertId();

            // Insert into user_order_items and update stock
            $sql = "INSERT INTO user_order_items (order_id, product_id, quantity, price) 
                VALUES (:order_id, :product_id, :quantity, :price)";
            $orderItemStmt = $this->pdo->prepare($sql);
            $updateStockStmt = $this->pdo->prepare("UPDATE products SET stock = stock - :quantity WHERE id = :product_id");

            $orderItemStmt->execute([
                'order_id' => $orderId,
                'product_id' => $data->product_id,
                'quantity' => $data->quantity,
                'price' => $cartItem['price']
            ]);

            // Update stock in products table
            $updateStockStmt->execute([
                'quantity' => $data->quantity,
                'product_id' => $data->product_id
            ]);

            $sql = "DELETE FROM user_cart_items WHERE cart_id = :cart_id AND product_id = :product_id";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                'cart_id' => $data->cart_id,
                'product_id' => $data->product_id
            ]);


            $this->pdo->commit();

            return $this->sendPayload(null, 'success', 'Order created successfully.', 200);
        } catch (PDOException $e) {
            $this->pdo->rollBack();
            error_log("Database error: " . $e->getMessage());
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }

    public function cancelOrder($data)
    {
        if (empty($data->user_id) || empty($data->order_id)) {
            return $this->sendPayload(null, 'failed', 'User ID and Order ID are required.', 400);
        }

        try {
            $this->pdo->beginTransaction();

            // Fetch the order and its items
            $sql = "SELECT oi.product_id, oi.quantity, p.stock
                    FROM user_order_items oi
                    JOIN products p ON oi.product_id = p.id
                    WHERE oi.order_id = :order_id";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(['order_id' => $data->order_id]);
            $orderItems = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (empty($orderItems)) {
                $this->pdo->rollBack();
                return $this->sendPayload(null, 'failed', 'Order not found or already canceled.', 404);
            }

            // Restore stock for each product
            foreach ($orderItems as $item) {
                $newStock = $item['stock'] + $item['quantity'];
                $sql = "UPDATE products SET stock = :stock WHERE id = :product_id";
                $stmt = $this->pdo->prepare($sql);
                $stmt->execute([
                    'stock' => $newStock,
                    'product_id' => $item['product_id']
                ]);
            }

            // Delete order items
            $sql = "DELETE FROM user_order_items WHERE order_id = :order_id";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(['order_id' => $data->order_id]);

            // Delete the order
            $sql = "DELETE FROM user_orders WHERE id = :order_id AND user_id = :user_id";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                'order_id' => $data->order_id,
                'user_id' => $data->user_id
            ]);

            if ($stmt->rowCount() > 0) {
                $this->pdo->commit();
                return $this->sendPayload(null, 'success', 'Order canceled successfully.', 200);
            } else {
                $this->pdo->rollBack();
                return $this->sendPayload(null, 'failed', 'Failed to cancel order.', 500);
            }
        } catch (PDOException $e) {
            $this->pdo->rollBack();
            error_log("Database error: " . $e->getMessage());
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }

    public function removeItemFromCart($data)
    {
        if (empty($data->user_id) || empty($data->product_id) || empty($data->cart_id)) {
            return $this->sendPayload(null, 'failed', 'User ID, Product ID, and Cart ID are required.', 400);
        }

        try {
            $this->pdo->beginTransaction();

            // Fetch the cart item
            $sql = "SELECT quantity FROM user_cart_items WHERE cart_id = :cart_id AND product_id = :product_id";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                'cart_id' => $data->cart_id,
                'product_id' => $data->product_id
            ]);
            $cartItem = $stmt->fetch(PDO::FETCH_ASSOC);

            if (empty($cartItem)) {
                $this->pdo->rollBack();
                return $this->sendPayload(null, 'failed', 'Item not found in cart.', 404);
            }

            // Remove the item from the cart
            $sql = "DELETE FROM user_cart_items WHERE cart_id = :cart_id AND product_id = :product_id";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                'cart_id' => $data->cart_id,
                'product_id' => $data->product_id
            ]);

            // Optional: Restore stock if you want to add stock back to the product
            // Fetch current stock
            $sql = "SELECT stock FROM products WHERE id = :product_id";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(['product_id' => $data->product_id]);
            $product = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($product) {
                $newStock = $product['stock'] + $cartItem['quantity'];
                $sql = "UPDATE products SET stock = :stock WHERE id = :product_id";
                $stmt = $this->pdo->prepare($sql);
                $stmt->execute([
                    'stock' => $newStock,
                    'product_id' => $data->product_id
                ]);
            }

            $this->pdo->commit();

            return $this->sendPayload(null, 'success', 'Item removed from cart successfully.', 200);
        } catch (PDOException $e) {
            $this->pdo->rollBack();
            error_log("Database error: " . $e->getMessage());
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }

    //function for buy now
    public function buyNow($data)
    {
        try {
            $this->pdo->beginTransaction();

            // Fetch user details
            $user_id = $data->user_id;

            // Fetch product details
            $sql = "SELECT price, stock FROM products WHERE id = :product_id";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(['product_id' => $data->product_id]);
            $product = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($product) {
                $price = $product['price'];
                $stock = $product['stock'];

                // Check if sufficient stock is available
                if ($data->quantity > $stock) {
                    $this->pdo->rollBack();
                    return $this->sendPayload(null, 'failed', "Not enough stock available.", 400);
                }

                // Deduct stock
                $newStock = $stock - $data->quantity;
                $sql = "UPDATE products SET stock = :stock WHERE id = :product_id";
                $stmt = $this->pdo->prepare($sql);
                $stmt->execute([
                    'stock' => $newStock,
                    'product_id' => $data->product_id
                ]);

                // Calculate total price
                $totalPrice = $price * $data->quantity;

                // Create a new order
                $sql = "INSERT INTO user_orders (user_id, total_price) VALUES (:user_id, :total_price)";
                $stmt = $this->pdo->prepare($sql);
                $stmt->execute([
                    'user_id' => $user_id,
                    'total_price' => $totalPrice
                ]);

                // Get the newly created order ID
                $orderId = $this->pdo->lastInsertId();

                // Insert order item
                $sql = "INSERT INTO user_order_items (order_id, product_id, quantity, price) VALUES (:order_id, :product_id, :quantity, :price)";
                $stmt = $this->pdo->prepare($sql);
                $stmt->execute([
                    'order_id' => $orderId,
                    'product_id' => $data->product_id,
                    'quantity' => $data->quantity,
                    'price' => $price
                ]);

                $this->pdo->commit();
                return $this->sendPayload(null, 'success', "Purchase successful.", 200);
            } else {
                $this->pdo->rollBack();
                return $this->sendPayload(null, 'failed', "Product not found.", 404);
            }
        } catch (PDOException $e) {
            $this->pdo->rollBack();
            error_log("Database error: " . $e->getMessage());
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }
}
