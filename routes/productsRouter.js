const express = require("express");
const router = express.Router();
const { products, saveProductsToFile } = require("../data/productsData");

// Obtener todos los productos con límite opcional
router.get("/", (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : products.length;
  res.json(products.slice(0, limit));
});

// Obtener un producto por ID
router.get("/:pid", (req, res) => {
  const productId = parseInt(req.params.pid);
  const product = products.find((p) => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }
  res.json(product);
});

// Agregar un nuevo producto
router.post("/", (req, res) => {
  const { title, description, code, price, stock, category, thumbnails, status } = req.body;

  if (!title || !description || !code || !price || !stock || !category) {
    return res.status(400).json({ error: "Todos los campos son obligatorios excepto thumbnails." });
  }

  if (
    typeof title !== "string" ||
    typeof description !== "string" ||
    typeof code !== "string" ||
    typeof price !== "number" ||
    typeof stock !== "number" ||
    typeof category !== "string"
  ) {
    return res.status(400).json({ error: "Tipos de datos incorrectos." });
  }

  const existingProduct = products.find((p) => p.code === code);
  if (existingProduct) {
    return res.status(400).json({ error: "El código del producto ya existe." });
  }

  const newId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;

  const newProduct = {
    id: newId,
    title,
    description,
    code,
    price,
    stock,
    category,
    thumbnails: thumbnails || [],
    status: status ?? true,
  };

  products.push(newProduct);
  saveProductsToFile();

  const io = req.app.get("socketio");
  io.emit("updateProducts", products);

  res.status(201).json({ message: "Producto agregado con éxito", product: newProduct });
});

// PUT - Actualizar un producto por ID
router.put("/:pid", (req, res) => {
  const productId = parseInt(req.params.pid);
  const productIndex = products.findIndex((p) => p.id === productId);

  if (productIndex === -1) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  const { id, ...updatedFields } = req.body;
  if (updatedFields.price !== undefined && typeof updatedFields.price !== "number") {
    return res.status(400).json({ error: "El precio debe ser un número" });
  }
  if (updatedFields.stock !== undefined && typeof updatedFields.stock !== "number") {
    return res.status(400).json({ error: "El stock debe ser un número" });
  }

  products[productIndex] = { ...products[productIndex], ...updatedFields };
  saveProductsToFile();

  const io = req.app.get("socketio");
  io.emit("updateProducts", products);

  res.json({
    message: "Producto actualizado con éxito",
    product: products[productIndex],
  });
});

// DELETE - Eliminar un producto por ID
router.delete("/:pid", (req, res) => {
  const productId = parseInt(req.params.pid);
  const productIndex = products.findIndex((p) => p.id === productId);

  if (productIndex === -1) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  const deletedProduct = products.splice(productIndex, 1)[0];
  saveProductsToFile();


  const io = req.app.get("socketio");
  io.emit("updateProducts", products);

  res.json({
    message: "Producto eliminado con éxito",
    product: deletedProduct,
  });
});

module.exports = router;
