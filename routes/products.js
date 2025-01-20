const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const productsFilePath = path.join(__dirname, '../data/products.json');

router.get('/', (req, res) => {
  fs.readFile(productsFilePath, 'utf-8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error al leer los productos' });
    }

    let products = [];
    try {
      products = JSON.parse(data);
    } catch (e) {
      return res.status(500).json({ error: 'Error al parsear los productos' });
    }

    const limit = parseInt(req.query.limit, 10);
    if (limit) {
      products = products.slice(0, limit);
    }

    res.json(products);
  });
});

// Ruta GET para obtener un producto por su id
router.get('/:pid', (req, res) => {
  const { pid } = req.params;

  fs.readFile(productsFilePath, 'utf-8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error al leer los productos' });
    }

    let products = [];
    try {
      products = JSON.parse(data);
    } catch (e) {
      return res.status(500).json({ error: 'Error al parsear los productos' });
    }

    const product = products.find(p => p.id == pid);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(product);
  });
});

router.post('/', (req, res) => {
  const newProduct = req.body;

  if (!newProduct.title || !newProduct.description || !newProduct.code || !newProduct.price || !newProduct.stock || !newProduct.category) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios excepto thumbnails' });
  }

  newProduct.status = newProduct.status || true;
  newProduct.thumbnails = newProduct.thumbnails || [];

  fs.readFile(productsFilePath, 'utf-8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error al leer los productos' });
    }

    let products = [];
    try {
      products = JSON.parse(data);
    } catch (e) {
      return res.status(500).json({ error: 'Error al parsear los productos' });
    }

    const newId = products.length ? products[products.length - 1].id + 1 : 1;

    const productToAdd = { id: newId, ...newProduct };

    products.push(productToAdd);

    fs.writeFile(productsFilePath, JSON.stringify(products, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error al guardar el producto' });
      }

      res.status(201).json(productToAdd);
    });
  });
});

router.put('/:pid', (req, res) => {
  const { pid } = req.params;
  const updatedProduct = req.body;

  if (!updatedProduct.title || !updatedProduct.description || !updatedProduct.code || !updatedProduct.price || !updatedProduct.stock || !updatedProduct.category) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios excepto thumbnails' });
  }

  fs.readFile(productsFilePath, 'utf-8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error al leer los productos' });
    }

    let products = [];
    try {
      products = JSON.parse(data);
    } catch (e) {
      return res.status(500).json({ error: 'Error al parsear los productos' });
    }

    const productIndex = products.findIndex(p => p.id == pid);
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    updatedProduct.id = products[productIndex].id;

    products[productIndex] = { ...products[productIndex], ...updatedProduct };

    fs.writeFile(productsFilePath, JSON.stringify(products, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error al guardar los productos' });
      }

      res.status(200).json(products[productIndex]);
    });
  });
});

router.delete('/:pid', (req, res) => {
  const { pid } = req.params;

  fs.readFile(productsFilePath, 'utf-8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error al leer los productos' });
    }

    let products = [];
    try {
      products = JSON.parse(data);
    } catch (e) {
      return res.status(500).json({ error: 'Error al parsear los productos' });
    }

    const productIndex = products.findIndex(p => p.id == pid);
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    products.splice(productIndex, 1);

    fs.writeFile(productsFilePath, JSON.stringify(products, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error al eliminar el producto' });
      }

      res.status(200).json({ message: 'Producto eliminado' });
    });
  });
});

module.exports = router;
