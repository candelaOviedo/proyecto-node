const fs = require("fs").promises;
const path = require("path");

const productsFilePath = path.join(__dirname, "products.json");

// Función para obtener los productos
async function getProducts() {
  try {
    const data = await fs.readFile(productsFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      return []; // Si el archivo no existe, devolver un array vacío
    } else {
      throw error;
    }
  }
}

// Función para guardar productos en el archivo JSON
async function saveProductsToFile(products) {
  await fs.writeFile(productsFilePath, JSON.stringify(products, null, 2));
}

module.exports = { getProducts, saveProductsToFile };