const express = require('express');
const router = express.Router();
const Producto = require('../models/Products'); // Asegúrate de que la ruta del modelo sea correcta
const Carrito = require('../models/Cart'); // Asegúrate de que la ruta del modelo sea correcta

// Ruta para mostrar todos los productos con paginación
router.get('/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const productos = await Producto.find()
      .skip(skip)
      .limit(limit)
      .lean();

    const totalProductos = await Producto.countDocuments();
    const totalPages = Math.ceil(totalProductos / limit);

    res.render('index', {
      productos,
      pagination: {
        currentPage: page,
        totalPages,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
        prevPage: page - 1,
        nextPage: page + 1,
      },
    });
  } catch (error) {
    res.status(500).send('Error al obtener productos');
  }
});

// Ruta para mostrar los detalles de un producto específico
router.get('/products/:pid', async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.pid).lean();
    if (!producto) {
      return res.status(404).send('Producto no encontrado');
    }
    res.render('productDetails', { producto });
  } catch (error) {
    res.status(500).send('Error al obtener producto');
  }
});

// Ruta para agregar un producto al carrito
router.post('/carts/:cid/products/:pid', async (req, res) => {
  try {
    const carrito = await Carrito.findById(req.params.cid);
    const producto = await Producto.findById(req.params.pid);

    if (!carrito || !producto) {
      return res.status(404).send('Carrito o producto no encontrado');
    }

    const existingProductIndex = carrito.products.findIndex(
      (item) => item.product.toString() === req.params.pid
    );

    if (existingProductIndex !== -1) {
      carrito.products[existingProductIndex].quantity += 1;
    } else {
      carrito.products.push({ product: req.params.pid, quantity: 1 });
    }

    await carrito.save();
    res.redirect(`/carts/${req.params.cid}`);
  } catch (error) {
    res.status(500).send('Error al agregar producto al carrito');
  }
});

// Ruta para mostrar los productos de un carrito específico
router.get('/carts/:cid', async (req, res) => {
  try {
    const carrito = await Carrito.findById(req.params.cid).populate('products.product').lean();
    if (!carrito) {
      return res.status(404).send('Carrito no encontrado');
    }
    res.render('cart', { carrito });
  } catch (error) {
    res.status(500).send('Error al obtener carrito');
  }
});

module.exports = router;