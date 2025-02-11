const express = require('express')
const app = express();

app.use(express.json());

const productsRouter = require("./routes/productsRouter");
app.use("/api/products", productsRouter);

const cartsRouter = require("./routes/cartsRouter");
app.use("/api/carts", cartsRouter)

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
});