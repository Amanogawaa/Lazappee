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

    private function executeQuery($sql)
    {
        $data = array();
        $errmsg = "";
        $code = 0;

        try {
            $statement = $this->pdo->query($sql);
            if ($statement) {
                $result = $statement->fetchAll(PDO::FETCH_ASSOC);
                foreach ($result as $record) {
                    if (isset($record['file_data'])) {

                        $record['file_data'] = base64_encode($record['file_data']);
                    }
                    array_push($data, $record);
                }
                $code = 200;
                return array("code" => $code, "data" => $data);
            } else {
                $errmsg = "No data found.";
                $code = 404;
            }
        } catch (\PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 403;
        }
        return array("code" => $code, "errmsg" => $errmsg);
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

    public function getAllProducts($id = null)
    {
        $conditions = ($id !== null) ? "id = '$id'" : null;
        $result = $this->get_records('products', $conditions);

        if ($result['status']['remarks'] === 'success' && !empty($result['payload'])) {
            return $result['payload'];
        } else {
            return $result['payload']['id'];
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
            // Accessing the first cart from the result payload
            $cart = $result['payload'][0];  // Assuming there's only one cart for the user

            $cartId = $cart['id'];  // Accessing the cart ID

            // Retrieve the items within the cart
            $query = "
            SELECT 
                user_cart_items.id AS item_id,
                user_cart_items.product_id,
                user_cart_items.price,
                user_cart_items.created_at AS item_created_at,
                user_cart_items.quantity,
                user_carts.created_at AS cart_created_at,
                products.description AS product_description
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
}
