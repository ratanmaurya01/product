const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 4090;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(bodyParser.json());
app.use(cors());

// Routes for products
app.get('/api/products', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM products');
    const products = result.rows;
    client.release();
    res.json(products);
  } catch (err) {
    console.error('Error fetching products', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/products', async (req, res) => {
  const { name, price } = req.body;
  try {
    const client = await pool.connect();
    const result = await client.query('INSERT INTO products (name, price) VALUES ($1, $2) RETURNING *', [name, price]);
    const newProduct = result.rows[0];
    client.release();
    res.status(201).json(newProduct);
  } catch (err) {
    console.error('Error creating product', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Routes for orders
app.get('/api/orders', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM orders');
    const orders = result.rows;
    client.release();
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/orders', async (req, res) => {
  const { productId, quantity, totalPrice } = req.body;
  try {
    const client = await pool.connect();
    const result = await client.query('INSERT INTO orders (product_id, quantity, total_price) VALUES ($1, $2, $3) RETURNING *', [productId, quantity, totalPrice]);
    const newOrder = result.rows[0];
    client.release();
    res.status(201).json(newOrder);
  } catch (err) {
    console.error('Error creating order', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update product route
app.put('/api/products/:id', async (req, res) => {
  const productId = req.params.id;
  const { name, price } = req.body;
  try {
    const client = await pool.connect();
    const result = await client.query('UPDATE products SET name = $1, price = $2 WHERE id = $3 RETURNING *', [name, price, productId]);
    const updatedProduct = result.rows[0];
    client.release();
    res.status(200).json(updatedProduct);
  } catch (err) {
    console.error('Error updating product', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
