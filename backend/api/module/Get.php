<?php

require_once 'Global.php';

class Get extends GlobalMethods
{
    private $pdo;

    public function __construct(\PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    private function get_records($table, $conditions = null, $columns = '*')
    {
        $sqlStr = "SELECT $columns FROM $table";
        if ($conditions != null) {
            $sqlStr .= " WHERE " . $conditions;
        }
        $result = $this->executeQuery($sqlStr);

        if ($result['code'] == 200) {
            return $this->sendPayload($result['data'], 'success', "Successfully retrieved data.", $result['code']);
        }
        return $this->sendPayload(null, 'failed', "Failed to retrieve data.", $result['code']);
    }

    private function executeQuery($sql, $params = [])
    {
        $data = array();
        $errmsg = "";
        $code = 0;

        try {
            // Prepare the SQL statement
            $statement = $this->pdo->prepare($sql);

            // Execute the SQL statement with parameters
            $statement->execute($params);

            // Fetch the results
            $result = $statement->fetchAll(PDO::FETCH_ASSOC);
            foreach ($result as $record) {
                if (isset($record['file_data'])) {
                    $record['file_data'] = base64_encode($record['file_data']);
                }
                array_push($data, $record);
            }
            $code = 200;
            return array("code" => $code, "data" => $data);
        } catch (\PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 403;
        }
        return array("code" => $code, "errmsg" => $errmsg);
    }


    public function getAllProducts($id = null, $categoryId = null)
    {
        // Define the columns to select, including categories
        $columns = "p.id, p.name, p.price, p.description, p.stock, discount, discount_expiry, total_sold,
                    GROUP_CONCAT(c.name SEPARATOR ', ') as categories";

        // Base SQL query with JOINs
        $sql = "SELECT $columns 
                FROM products p
                LEFT JOIN product_categories pc ON p.id = pc.product_id
                LEFT JOIN categories c ON pc.category_id = c.id";

        // Add conditions if an ID or category ID is provided
        $conditions = [];
        if ($id !== null) {
            $conditions[] = "p.id = :id";
        }
        if ($categoryId !== null) {
            $conditions[] = "pc.category_id = :categoryId";
        }

        if (count($conditions) > 0) {
            $sql .= " WHERE " . implode(' AND ', $conditions);
        }

        $sql .= " GROUP BY p.id";

        // Execute the query with parameter binding
        $params = [];
        if ($id !== null) {
            $params['id'] = $id;
        }
        if ($categoryId !== null) {
            $params['categoryId'] = $categoryId;
        }

        $result = $this->executeQuery($sql, $params);

        // Process the result
        if ($result['code'] == 200) {
            // Return data in the expected format
            return $this->sendPayload($result['data'], 'success', "Successfully retrieved data.", $result['code']);
        }
        return $this->sendPayload(null, 'failed', "Failed to retrieve data.", $result['code']);
    }


    public function getCategories()
    {
        $result = $this->get_records('categories');

        if ($result['status']['remarks'] === 'success' && !empty($result['payload'])) {
            return $result['payload'];
        } else {
            return $result['payload']['id'];
        }
    }


    public function getByEmail(string $email = null): array|false
    {
        $conditions = ($email !== null) ? "email = '$email'" : null;
        $result = $this->get_records('user', $conditions);

        if ($result['status']['remarks'] === 'success' && !empty($result['payload'])) {
            return $result['payload'][0];
        } else {
            return false;
        }
    }


    public function getCart($id = null)
    {
        $conditions = ($id !== null) ? "id = '$id'" : null;
        $result = $this->get_records('user_carts', $conditions);

        if ($result['status']['remarks'] === 'success' && !empty($result['payload'])) {
            return $result['payload'];
        } else {
            return $result['payload']['id'];
        }
    }

    public function getCartItems($cartId)
    {
        $query = "
            SELECT 
                user_cart_items.id AS item_id,
                user_cart_items.product_id,
                user_cart_items.price,
                user_cart_items.created_at,
                user_cart_items.quantity,
                user_carts.created_at AS cart_created_at
            FROM user_cart_items
            JOIN user_carts ON user_cart_items.cart_id = user_carts.id
            WHERE user_carts.id = '$cartId'
        ";

        $result = $this->executeQuery($query);

        if ($result['code'] == 200) {
            return $this->sendPayload($result['data'], 'success', "Successfully retrieved cart items.", $result['code']);
        } else {
            return $this->sendPayload(null, 'failed', "Failed to retrieve cart items.", $result['code']);
        }
    }

    public function getUserCartWithItems($userId)
    {
        // Retrieve the user's cart
        $conditions = "user_id = '$userId'";
        $result = $this->get_records('user_carts', $conditions);

        if ($result['status']['remarks'] === 'success' && !empty($result['payload'])) {
            $cart = $result['payload'][0];

            $cartId = $cart['id'];

            $query = "
            SELECT 
                user_cart_items.id AS item_id,
                user_cart_items.product_id,
                user_cart_items.price,
                user_cart_items.created_at AS item_created_at,
                user_cart_items.quantity,
                user_carts.created_at AS cart_created_at,
                products.description AS product_description,
                products.name AS product_name,
                products.discount AS product_discount,
                products.stock AS product_stock
            FROM user_cart_items
            JOIN user_carts ON user_cart_items.cart_id = user_carts.id
            JOIN products ON user_cart_items.product_id = products.id
            WHERE user_carts.id = '$cartId'
        ";

            $itemsResult = $this->executeQuery($query);

            if ($itemsResult['code'] == 200) {
                // Combine cart details and items
                $cart['items'] = $itemsResult['data'];
                return $this->sendPayload($cart, 'success', "Successfully retrieved cart and items.", $itemsResult['code']);
            } else {
                return $this->sendPayload(null, 'failed', "Failed to retrieve cart items.", $itemsResult['code']);
            }
        } else {
            return $this->sendPayload(null, 'failed', "Failed to retrieve cart details.", $result['status']['code']);
        }
    }

    public function getAllUserOrders($userId)
    {
        // Validate the user ID
        if (empty($userId)) {
            return $this->sendPayload(null, 'failed', 'User ID is required.', 400);
        }

        // Query to get all orders for the user
        $ordersQuery = "
            SELECT 
                uo.id AS order_id,
                uo.user_id,
                uo.total_price,
                uo.created_at AS order_created_at
            FROM user_orders uo
            WHERE uo.user_id = :user_id
        ";

        try {
            // Execute the query to get all orders
            $stmt = $this->pdo->prepare($ordersQuery);
            $stmt->execute(['user_id' => $userId]);
            $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (empty($orders)) {
                return $this->sendPayload(null, 'success', 'No orders found for the user.', 200);
            }

            // Prepare an array to hold orders with items
            $ordersWithItems = [];

            foreach ($orders as $order) {
                $orderId = $order['order_id'];

                // Query to get items for each order
                $itemsQuery = "
                    SELECT 
                        ooi.product_id,
                        ooi.quantity,
                        ooi.price,
                        p.name AS product_name,
                        p.description AS product_description
                    FROM user_order_items ooi
                    JOIN products p ON ooi.product_id = p.id
                    WHERE ooi.order_id = :order_id
                ";

                $stmt = $this->pdo->prepare($itemsQuery);
                $stmt->execute(['order_id' => $orderId]);
                $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

                $order['items'] = $items;
                $ordersWithItems[] = $order;
            }

            return $this->sendPayload($ordersWithItems, 'success', 'Successfully retrieved user orders.', 200);
        } catch (\PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return $this->sendPayload(null, 'failed', 'Failed to retrieve user orders.', 500);
        }
    }

    public function getUserOrder($userId, $orderId)
    {
        // Validate the user ID and order ID
        if (empty($userId)) {
            return $this->sendPayload(null, 'failed', 'User ID is required.', 400);
        }

        if (empty($orderId)) {
            return $this->sendPayload(null, 'failed', 'Order ID is required.', 400);
        }

        // Query to get the specific order for the user
        $orderQuery = "
        SELECT 
            uo.id AS order_id,
            uo.user_id,
            uo.total_price,
            uo.created_at AS order_created_at
        FROM user_orders uo
        WHERE uo.user_id = :user_id AND uo.id = :order_id
    ";

        try {
            // Execute the query to get the specific order
            $stmt = $this->pdo->prepare($orderQuery);
            $stmt->execute(['user_id' => $userId, 'order_id' => $orderId]);
            $order = $stmt->fetch(PDO::FETCH_ASSOC);

            if (empty($order)) {
                return $this->sendPayload(null, 'success', 'Order not found for the user.', 404);
            }

            // Query to get items for the specific order
            $itemsQuery = "
            SELECT 
                ooi.product_id,
                ooi.quantity,
                ooi.price,
                p.name AS product_name,
                p.description AS product_description
            FROM user_order_items ooi
            JOIN products p ON ooi.product_id = p.id
            WHERE ooi.order_id = :order_id
        ";

            $stmt = $this->pdo->prepare($itemsQuery);
            $stmt->execute(['order_id' => $orderId]);
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $order['items'] = $items;

            return $this->sendPayload($order, 'success', 'Successfully retrieved order details.', 200);
        } catch (\PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            return $this->sendPayload(null, 'failed', 'Failed to retrieve order details.', 500);
        }
    }



    // getting image 
    public function getProductImage($id)
    {
        $fileInfo = $this->geteventImg($id);

        if ($fileInfo['image'] !== null) {
            $fileData = $fileInfo['image'];

            header('Content-Type: image/png');
            header('Cache-Control: no-cache, no-store, must-revalidate');
            echo $fileData;
            exit();
        } else {
            echo "Event image not found or not uploaded.";
            return array("image" => null);
        }
    }

    public function geteventImg($id = null)
    {
        $columns = "image";
        $condition = ($id !== null) ? "id = $id" : null;
        $result = $this->get_records('products', $condition, $columns);

        if ($result['status']['remarks'] === 'success' && isset($result['payload'][0]['image'])) {
            $fileData = $result['payload'][0]['image'];
            return array("image" => $fileData);
        } else {
            return array("image" => null);
        }
    }
}
