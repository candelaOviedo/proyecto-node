const express = require("express");
const router = express.Router();
const { products } = require("../data/productsData");

// Ruta para la vista Home (estática)
router.get("/", (req, res) => {
  res.render("home", { products });
});

// Ruta para la vista Real Time Products (actualización en tiempo real)
router.get("/realtimeproducts", (req, res) => {
  res.render("realTimeProducts", { products });
});

module.exports = router;