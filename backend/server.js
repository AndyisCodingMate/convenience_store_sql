const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const session = require('express-session');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Configure session middleware
app.use(session({
    secret: 'your-secret-key', // Replace with a secure key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));
// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, '../public')));

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'cs', // MySQL user
    password: 'password', // MySQL password
    database: 'cs'
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Default route: Serve the Login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

// Signup route
app.post('/signup', async (req, res) => {
    const { firstName, lastName, email, password, userType } = req.body;
    try {
        const query = `
            INSERT INTO users (first_name, last_name, email, password, user_type)
            VALUES (?, ?, ?, ?, ?)
        `;
        db.query(query, [firstName, lastName, email, password, userType], (err) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).send('Email already exists');
                }
                return res.status(500).send('Database error');
            }
            res.status(201).json({ message: 'User registered successfully' });
        });
    } catch (error) {
        res.status(500).send('Server error');
    }
});

// Login route
// Login route with session creation
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const query = `SELECT * FROM users WHERE email = ?`;

    db.query(query, [email], (err, results) => {
        if (err) {
            return res.status(500).send('Database error');
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = results[0];

        // Direct string comparison for passwords (not recommended for production)
        if (password === user.password) {
            // Create a session for the user
            req.session.userId = user.id;
            req.session.userType = user.user_type;

            // Redirect based on user type
            if (user.user_type === 'vendor') {
                res.status(200).json({ redirectUrl: '/vendor.html' });
            } else {
                res.status(200).json({ redirectUrl: '/customer.html' });
            }
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    });
});

// Route for vendors to update inventory
app.post('/update-inventory', (req, res) => {
    const { itemName, quantity } = req.body;

    const query = `UPDATE inventory SET stock = stock + ? WHERE itemName = ?`;
    db.query(query, [quantity, itemName], (err, result) => {
        if (err) {
            return res.status(500).send('Database error');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Item not found');
        }
        res.status(200).json({ message: 'Inventory updated successfully' });
    });
});

// Route for customers to purchase items
app.post('/purchase', (req, res) => {
    // Ensure the user is logged in and has a session
    if (!req.session.userId) {
        return res.status(401).send('Unauthorized: Please log in first.');
    }

    const { itemName, quantity } = req.body;
    const buyerID = req.session.userId; // Get buyerID from session

    // Check stock availability and get itemID
    const checkStockQuery = 'SELECT * FROM inventory WHERE itemName = ?';
    db.query(checkStockQuery, [itemName], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Database error');
        }
        if (results.length === 0 || results[0].stock < quantity) {
            return res.status(400).send('Insufficient stock');
        }

        const itemID = results[0].itemid;
        const price = results[0].price;
        const totalCost = price * quantity; // Calculate total cost

        // Deduct stock and record transaction
        const updateStockQuery = 'UPDATE inventory SET stock = stock - ? WHERE itemid = ?';
        db.query(updateStockQuery, [quantity, itemID], (err) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Database error');
            }

            const recordTransactionQuery = `
                INSERT INTO transactions (buyerID, itemid, quantity, total_cost, datetime)
                VALUES (?, ?, ?, ?, NOW())
            `;
            db.query(recordTransactionQuery, [buyerID, itemID, quantity, totalCost], (err) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).send('Database error');
                }
                res.status(200).json({ message: 'Purchase successful', total: totalCost });
            });
        });
    });
});


// Route to get all inventory items
app.get('/inventory-items', (req, res) => {
    const query = 'SELECT itemName FROM inventory WHERE stock > 0';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).send('Database error');
        }
        res.status(200).json(results);
    });
});

// Fetch all inventory items
app.get('/inventory', (req, res) => {
    const query = 'SELECT * FROM inventory';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).send('Database error');
        }
        res.status(200).json(results);
    });
});

// Fetch sales data for bar chart
app.get('/sales-data', (req, res) => {
    const query = `
        SELECT inventory.itemName, SUM(transactions.total_cost) AS totalSales
        FROM transactions
        JOIN inventory ON transactions.itemid = inventory.itemid
        GROUP BY inventory.itemName
        ORDER BY totalSales DESC
        LIMIT 10;
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Database error');
        }
        res.status(200).json(results);
    });
});

app.post('/restock', (req, res) => {
    const { itemName, quantity } = req.body;

    if (!itemName || !quantity || quantity <= 0) {
        return res.status(400).json({ message: 'Invalid input' });
    }

    const query = 'UPDATE inventory SET stock = stock + ? WHERE itemName = ?';
    db.query(query, [quantity, itemName], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json({ message: 'Item restocked successfully' });
    });
});

// Start the server on port 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
