const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Función para leer carritos del archivo JSON
const readCarts = () => {
  try {
    const data = fs.readFileSync(path.join(__dirname, '..', 'data', 'carts.json'), 'utf-8');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error al leer el archivo de carritos:", error);
    return [];
  }
};

// Función para escribir carritos en el archivo JSON
const writeCarts = (carts) => {
  try {
    fs.writeFileSync(path.join(__dirname, '..', 'data', 'carts.json'), JSON.stringify(carts, null, 2));
  } catch (error) {
    console.error("Error al escribir el archivo de carritos:", error);
  }
};

// Ruta POST /api/carts/ para crear un nuevo carrito
router.post('/', (req, res) => {
  const carts = readCarts();
  const newCart = {
    id: carts.length ? carts[carts.length - 1].id + 1 : 1,
    products: [],
  };

  carts.push(newCart);
  writeCarts(carts);

  res.status(201).json(newCart);
});

// Ruta GET /api/carts/:cid para obtener los productos de un carrito
router.get('/:cid', (req, res) => {
  const { cid } = req.params;
  if (isNaN(cid)) {
    return res.status(400).json({ error: 'El id del carrito debe ser un número' });
  }

  const carts = readCarts();
  const cart = carts.find(c => c.id === parseInt(cid));

  if (!cart) {
    return res.status(404).json({ error: 'Carrito no encontrado' });
  }

  res.json(cart.products);
});

// Ruta POST /api/carts/:cid/product/:pid para agregar un producto a un carrito
router.post('/:cid/product/:pid', (req, res) => {
  const { cid, pid } = req.params;

  if (isNaN(cid) || isNaN(pid)) {
    return res.status(400).json({ error: 'El id del carrito y del producto deben ser números' });
  }

  const carts = readCarts();
  const cart = carts.find(c => c.id === parseInt(cid));
  
  // Verificar si el carrito existe
  if (!cart) {
    return res.status(404).json({ error: 'Carrito no encontrado' });
  }

  // Leer los productos para verificar que el producto existe
  const productsData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'products.json'), 'utf-8'));
  const productExists = productsData.find(p => p.id == pid);
  if (!productExists) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  // Verificar si el producto ya existe en el carrito
  const productIndex = cart.products.findIndex(p => p.product === pid);
  if (productIndex === -1) {
    cart.products.push({ product: pid, quantity: 1 });
  } else {
    cart.products[productIndex].quantity += 1;
  }

  writeCarts(carts);

  res.status(200).json(cart);
});

module.exports = router;
