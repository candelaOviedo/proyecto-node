const mongoose = require('mongoose');
const { Schema } = mongoose;

// Definir el esquema del carrito
const cartSchema = new Schema({
  products: [
    {
      product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true, min: 1 }
    }
  ]
});

// Crear el modelo del carrito
const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;