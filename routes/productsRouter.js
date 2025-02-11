const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const productsFilePath = path.join(__dirname, "../data/productos.json");

// Cargar los productos desde el archivo al iniciar
let products = [];
try {
  const data = fs.readFileSync(productsFilePath, "utf-8");
  products = JSON.parse(data);
} catch (error) {
  console.error("Error al leer el archivo de productos:", error);
  products = [];
}

// Función auxiliar para guardar productos en el archivo
function saveProductsToFile() {
  fs.writeFile(productsFilePath, JSON.stringify(products, null, 2), (err) => {
    if (err) {
      console.error("Error al guardar el archivo de productos:", err);
    }
  });
}

// Obtener todos los productos con límite opcional
router.get("/", (req, res) => {
  const limit = req.query.limit
    ? parseInt(req.query.limit, 10)
    : products.length;
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
  const {
    title,
    description,
    code,
    price,
    stock,
    category,
    thumbnails,
    status,
  } = req.body;

  // Validar que todos los campos obligatorios estén presentes
  if (!title || !description || !code || !price || !stock || !category) {
    return res
      .status(400)
      .json({ error: "Todos los campos son obligatorios excepto thumbnails." });
  }

  // Validar tipos de datos
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

  // Verificar si el código ya existe
  const existingProduct = products.find((p) => p.code === code);
  if (existingProduct) {
    return res.status(400).json({ error: "El código del producto ya existe." });
  }

  // Generar ID único
  const newId =
    products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;

  // Crear nuevo producto
  const newProduct = {
    id: newId,
    title,
    description,
    code,
    price,
    stock,
    category,
    thumbnails: thumbnails || [],
    status: status ?? true, // Si status no está definido, será true
  };

  // Agregar el producto a la lista
  products.push(newProduct);
  saveProductsToFile();

  res
    .status(201)
    .json({ message: "Producto agregado con éxito", product: newProduct });
});

// PUT - Actualizar un producto por ID
router.put("/:pid", (req, res) => {
  const productId = parseInt(req.params.pid);
  const productIndex = products.findIndex((p) => p.id === productId);

  if (productIndex === -1) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  const { id, ...updatedFields } = req.body; // Evita que se modifique el id

  // Validar tipos de datos si se envían en la actualización
  if (
    updatedFields.price !== undefined &&
    typeof updatedFields.price !== "number"
  ) {
    return res.status(400).json({ error: "El precio debe ser un número" });
  }
  if (
    updatedFields.stock !== undefined &&
    typeof updatedFields.stock !== "number"
  ) {
    return res.status(400).json({ error: "El stock debe ser un número" });
  }

  // Actualizar solo los campos proporcionados
  products[productIndex] = { ...products[productIndex], ...updatedFields };
  saveProductsToFile();

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

  // Eliminar producto del array
  const deletedProduct = products.splice(productIndex, 1)[0];
  saveProductsToFile();

  res.json({
    message: "Producto eliminado con éxito",
    product: deletedProduct,
  });
});

module.exports = router;
