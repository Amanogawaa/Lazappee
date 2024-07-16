CREATE TABLE Products (
id INT PRIMARY KEY,
title VARCHAR(255) NOT NULL,
description TEXT,
category VARCHAR(100),
price DECIMAL(10, 2) NOT NULL,
discountPercentage DECIMAL(5, 2),
rating DECIMAL(3, 1),
stock INT,
brand VARCHAR(100),
images TEXT,
thumbnail VARCHAR(255)
);

CREATE TABLE Reviews (
id INT PRIMARY KEY,
productId INT,
rating DECIMAL(3, 1) NOT NULL,
comment TEXT,
date DATE,
reviewerName VARCHAR(100),
reviewerEmail VARCHAR(255),
FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE CASCADE
);