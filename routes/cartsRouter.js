const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Products');

// Eliminar un producto del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await Cart.findById(cid);

    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }

    const productIndex = cart.products.findIndex(item => item.product.toString() === pid);

    if (productIndex === -1) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado en el carrito' });
    }

    cart.products.splice(productIndex, 1);
    await cart.save();

    res.json({ status: 'success', message: 'Producto eliminado del carrito' });
  } catch (error) {
    console.error('Error al eliminar producto del carrito:', error);
    res.status(500).json({ status: 'error', message: 'Error al eliminar producto del carrito' });
  }
});

// Actualizar el carrito con un arreglo de productos
router.put('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;

    if (!Array.isArray(products)) {
      return res.status(400).json({ status: 'error', message: 'El cuerpo de la solicitud debe contener un arreglo de productos' });
    }

    const cart = await Cart.findById(cid);

    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }

    // Validar que cada producto en el arreglo exista en la base de datos
    const productIds = products.map(item => item.product);
    const existingProducts = await Product.find({ '_id': { $in: productIds } });

    if (existingProducts.length !== productIds.length) {
      return res.status(400).json({ status: 'error', message: 'Algunos productos no existen en la base de datos' });
    }

    // Reemplazar los productos del carrito
    cart.products = products;
    await cart.save();

    res.json({ status: 'success', message: 'Carrito actualizado' });
  } catch (error) {
    console.error('Error al actualizar carrito:', error);
    res.status(500).json({ status: 'error', message: 'Error al actualizar carrito' });
  }
});

// Actualizar la cantidad de un producto en el carrito
router.put('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (typeof quantity !== 'number' || quantity <= 0) {
      return res.status(400).json({ status: 'error', message: 'La cantidad debe ser un número positivo' });
    }

    const cart = await Cart.findById(cid);

    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }

    const productItem = cart.products.find(item => item.product.toString() === pid);

    if (!productItem) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado en el carrito' });
    }

    productItem.quantity = quantity;
    await cart.save();

    res.json({ status: 'success', message: 'Cantidad de producto actualizada' });
  } catch (error) {
    console.error('Error al actualizar cantidad de producto en carrito:', error);
    res.status(500).json({ status: 'error', message: 'Error al actualizar cantidad de producto en carrito' });
  }
});

// Eliminar todos los productos del carrito
router.delete('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await Cart.findById(cid);

    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }

    cart.products = [];
    await cart.save();

    res.json({ status: 'success', message: 'Todos los productos han sido eliminados del carrito' });
  } catch (error) {
    console.error('Error al eliminar productos del carrito:', error);
    res.status(500).json({ status: 'error', message: 'Error al eliminar productos del carrito' });
  }
});

// Obtener los productos del carrito con detalles completos
router.get('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await Cart.findById(cid).populate('products.product');

    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }

    res.json({ status: 'success', payload: cart });
  } catch (error) {
    console.error('Error al obtener productos del carrito:', error);
    res.status(500).json({ status: 'error', message: 'Error al obtener productos del carrito' });
  }
});

module.exports = router;