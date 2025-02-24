const express = require("express");
const app = express();
const { createServer } = require("http");
const { Server } = require("socket.io");
const exphbs = require("express-handlebars");
const path = require("path");
const httpServer = createServer(app);
const io = new Server(httpServer);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));


const productsRouter = require("./routes/productsRouter");
app.use("/api/products", productsRouter);

const cartsRouter = require("./routes/cartsRouter");
app.use("/api/carts", cartsRouter);

const viewsRouter = require("./routes/routerViews");
app.use("/", viewsRouter);

const { getProducts, saveProductsToFile } = require("./data/productsData");
app.set("socketio", io);

io.on("connection", async (socket) => {
  console.log("Nuevo cliente conectado");

  // Obtener productos actuales y enviarlos al cliente
  let products = await getProducts();
  socket.emit("updateProducts", products);

  socket.on("newProduct", async (productData) => {
    try {
      let products = await getProducts(); // Leer productos desde el archivo
      const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;

      const newProduct = {
        id: newId,
        ...productData,
        thumbnails: [],
        status: true,
      };

      products.push(newProduct);
      await saveProductsToFile(products); // Guardar los productos actualizados en el JSON

      io.emit("updateProducts", products);
    } catch (error) {
      console.error("Error al agregar producto:", error);
    }
  });
});

// Iniciar el servidor en el puerto 8080
const PORT = 8080;
httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});