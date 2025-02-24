const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const router = express.Router();

// Ruta del archivo que almacenará la información de los carritos
const cartsFilePath = path.join(__dirname, "../data/carts.json");

async function readCarts() {
  try {
    const data = await fs.readFile(cartsFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    } else {
      throw error;
    }
  }
}

async function writeCarts(carts) {
  await fs.writeFile(cartsFilePath, JSON.stringify(carts, null, 2));
}

// POST /api/carts

router.post("/", async (req, res) => {
  try {
    const carts = await readCarts();
    // Generar ID único: si hay carritos, tomar el mayor y sumarle 1, sino 1.
    const newId =
      carts.length > 0 ? Math.max(...carts.map((c) => c.id)) + 1 : 1;
    const newCart = {
      id: newId,
      products: [],
    };

    carts.push(newCart);
    await writeCarts(carts);

    res.status(201).json({
      message: "Carrito creado con éxito",
      cart: newCart,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al crear el carrito", details: error.message });
  }
});

// GET /api/carts/:cid

router.get("/:cid", async (req, res) => {
  try {
    const carts = await readCarts();
    const cartId = parseInt(req.params.cid, 10);
    const cart = carts.find((c) => c.id === cartId);

    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    res.json(cart.products);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al leer el carrito", details: error.message });
  }
});

// POST /api/carts/:cid/product/:pid
router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const carts = await readCarts();
    const cartId = parseInt(req.params.cid, 10);
    const productId = parseInt(req.params.pid, 10);

    // Buscar el carrito
    const cartIndex = carts.findIndex((c) => c.id === cartId);
    if (cartIndex === -1) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    const cart = carts[cartIndex];
    // Buscar si el producto ya existe en el carrito
    const productIndex = cart.products.findIndex(
      (item) => item.product === productId
    );
    if (productIndex !== -1) {
      // Si ya existe, incrementar la cantidad en 1
      cart.products[productIndex].quantity += 1;
    } else {
      // Sino, agregar el producto con quantity 1
      cart.products.push({ product: productId, quantity: 1 });
    }

    carts[cartIndex] = cart;
    await writeCarts(carts);

    res.json({ message: "Producto agregado al carrito", cart });
  } catch (error) {
    res.status(500).json({
      error: "Error al agregar el producto al carrito",
      details: error.message,
    });
  }
});

module.exports = router;
