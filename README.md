## **Convenience Store Online Ordering System**

This project provides SQL queries to analyze sales and inventory data for a convenience store business. The queries help identify sales trends, best and worst sellers, profitability, and inventory management strategies.

## **Prerequisites**

1. MySQL Server installed on your machine.  
2. A MySQL client or command-line tool to execute SQL queries.  
3. Node.js (v14 or higher)  
4. `npm` (Node Package Manager)

## **Installation**

## **1\. Clone the Repository**

bash  
`git clone <repository-url>`  
`cd backend`

## **2\. Install Dependencies**

Run the following command to install all required Node.js packages:  
bash  
`npm install .`

## **3\. Start the Server**

Run the following command to start the server:  
bash  
`node server.js`

The server will run on [`http://localhost:3000`](http://localhost:3000).

## 

## **Database Setup**

## **Step 1: Create the Database**

First, create a new database for this project:  
text  
`CREATE DATABASE cs;`  
`USE cs;`

## **Step 2: Create Tables**

Create the necessary tables (`inventory`, `transactions`, `users`) with the following SQL: **Inventory Table**  
text  
`CREATE TABLE inventory (`  
    `itemid INT AUTO_INCREMENT PRIMARY KEY,`  
    `itemName VARCHAR(50) NOT NULL,`  
    `stock INT NOT NULL DEFAULT 0,`  
    `price DECIMAL(10, 2) NOT NULL,`  
    `cost DECIMAL(10, 2) NOT NULL,`  
    `item_type ENUM('food', 'drinks', 'medicine', 'cigarettes', 'miscellaneous') NOT NULL`  
`);`

**Transactions Table**  
text  
`CREATE TABLE transactions (`  
    `transactID INT AUTO_INCREMENT PRIMARY KEY,`  
    `buyerID INT NOT NULL,`  
    `itemid INT NOT NULL,`  
    `quantity INT DEFAULT 1,`  
    `total_cost DECIMAL(10, 2),`  
    `datetime DATETIME,`  
    `FOREIGN KEY (itemid) REFERENCES inventory(itemid)`  
`);`

**Users Table**  
text  
`CREATE TABLE users (`  
    `id INT AUTO_INCREMENT PRIMARY KEY,`  
    `first_name VARCHAR(50),`  
    `last_name VARCHAR(50),`  
    `email VARCHAR(100) UNIQUE,`  
    `password VARCHAR(255),`  
    `user_type ENUM('vendor', 'buyer') NOT NULL`  
`);`

## **Step 3: Insert Initial Data**

Populate the tables with initial data using the following SQL statements: **Insert Inventory Data**  
Text (please find dummy data in file)  
`INSERT INTO inventory (itemName, stock, price, cost, item_type) VALUES`   
`('Apple', 100, 0.50, 0.30, 'food'),`  
`('Orange Juice', 50, 1.20, 0.80, 'drinks'),`  
`('Aspirin', 200, 5.00, 3.00, 'medicine'),`  
`('Cigarettes', 300, 6.50, 4.00, 'cigarettes'),`  
`('Notebook', 150, 2.00, 1.20, 'miscellaneous');`  
`-- Add more items as needed`

**Insert Users Data**  
text  
`INSERT INTO users (first_name, last_name, email, password, user_type) VALUES`   
`('Alice', 'Smith', 'alice.smith@vendor.com', 'password123', 'vendor'),`  
`('Bob', 'Johnson', 'bob.johnson@vendor.com', 'password123', 'vendor'),`  
`('Charlie', 'Brown', 'charlie.brown@vendor.com', 'password123', 'vendor');`  
`-- Add more users as needed`

**Insert Transactions Data**  
text  
`INSERT INTO transactions (buyerID, itemid, quantity, total_cost, datetime) VALUES`   
`(9, 1, 5, 2.50 * 5, '2024-11-01'),`  
`(10, 2, 3, 1.20 * 3, '2024-11-05');`  
`-- Add more transactions as needed`