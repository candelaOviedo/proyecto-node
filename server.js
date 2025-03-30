const express = require("express");
const mongoose = require("mongoose");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { engine } = require('express-handlebars');
const path = require("path");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Middleware para parsear JSON y URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de Handlebars
app.engine('handlebars', engine({
  extname: '.handlebars',
  defaultLayout: 'main', // Asegúrate de que 'main.handlebars' exista en tu carpeta de layouts
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Conexión a MongoDB
const mongoURI = 'mongodb://localhost:27017/node-coder';
mongoose.connect(mongoURI)
  .then(() => console.log('Conexión a MongoDB establecida'))
  .catch((error) => {
    console.error('Error de conexión a MongoDB:', error);
    process.exit(1);
  });

// Rutas
const productsRouter = require("./routes/productsRouter");
app.use("/api/products", productsRouter);

const cartsRouter = require("./routes/cartsRouter");
app.use("/api/carts", cartsRouter);

const viewsRouter = require("./routes/routerViews");
app.use("/", viewsRouter);

// Inicialización del servidor
const PORT = 8080;
httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});