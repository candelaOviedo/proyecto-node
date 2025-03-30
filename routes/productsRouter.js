const express = require("express");
const Product = require("../models/Products");
const router = express.Router();

// Ruta para obtener todos los productos con límite opcional
router.get("/", async (req, res) => {
  try {
    // Obtener parámetros de consulta con valores predeterminados
    const { limit = 10, page = 1, sort = "asc", query = "", category, availability } = req.query;

    // Convertir limit y page a números
    const limitNum = parseInt(limit, 10);
    const pageNum = parseInt(page, 10);

    // Validar que limit y page sean números positivos
    if (isNaN(limitNum) || limitNum <= 0) {
      return res.status(400).json({ status: "error", message: "El parámetro 'limit' debe ser un número positivo." });
    }
    if (isNaN(pageNum) || pageNum <= 0) {
      return res.status(400).json({ status: "error", message: "El parámetro 'page' debe ser un número positivo." });
    }

    // Construir el filtro de búsqueda
    const filter = {};
    if (query) {
      filter.name = new RegExp(query, "i");
    }
    if (category) {
      filter.category = new RegExp(category, "i");
    }
    if (availability !== undefined) {
      filter.availability = availability === "true";
    }

    // Determinar el orden de clasificación
    const sortOrder = sort === "desc" ? -1 : 1;

    // Consultar la base de datos con paginación, filtrado y ordenamiento
    const products = await Product.find(filter)
      .sort({ price: sortOrder })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    // Contar el total de productos que coinciden con el filtro
    const totalCount = await Product.countDocuments(filter);

    // Calcular el total de páginas
    const totalPages = Math.ceil(totalCount / limitNum);

    // Construir las URLs para las páginas anterior y siguiente
    const baseUrl = req.protocol + "://" + req.get("host") + req.baseUrl + req.path;
    const prevLink = pageNum > 1 ? `${baseUrl}?page=${pageNum - 1}&limit=${limitNum}` : null;
    const nextLink = pageNum < totalPages ? `${baseUrl}?page=${pageNum + 1}&limit=${limitNum}` : null;

    // Enviar la respuesta con la estructura solicitada
    res.json({
      status: "success",
      payload: products,
      totalPages,
      prevPage: pageNum - 1,
      nextPage: pageNum + 1,
      page: pageNum,
      hasPrevPage: pageNum > 1,
      hasNextPage: pageNum < totalPages,
      prevLink,
      nextLink,
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ status: "error", message: "Error al obtener productos." });
  }
});

// Ruta para obtener un producto por ID
router.get("/:pid", async (req, res) => {
  try {
    const productId = req.params.pid;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el producto" });
  }
});

// Ruta para agregar un nuevo producto
router.post("/", async (req, res) => {
  try {
    const { title, description, code, price, stock, category, thumbnails, status } = req.body;
    if (!title || !description || !code || !price || !stock || !category) {
      return res.status(400).json({ error: "Todos los campos son obligatorios excepto thumbnails." });
    }

    const existingProduct = await Product.findOne({ code });
    if (existingProduct) {
      return res.status(400).json({ error: "El código del producto ya existe." });
    }

    const newProduct = new Product({
      title,
      description,
      code,
      price,
      stock,
      category,
      thumbnails: thumbnails || [],
      status: status ?? true,
    });

    await newProduct.save();

    const io = req.app.get("socketio");
    io.emit("updateProducts", newProduct);

    res.status(201).json({ message: "Producto agregado con éxito", product: newProduct });
  } catch (error) {
    res.status(500).json({ error: "Error al agregar el producto" });
  }
});

module.exports = router;