const mongoose = require("mongoose");
const { Schema } = mongoose;

const purchaseSchema = new Schema({
  // productId: { type: Schema.Types.ObjectId, ref: "Product" },
  PackageId: { type: Schema.Types.ObjectId, ref: "Package"},
  userId: { type: Number, default: 1 },
  quantity: Number,
});

module.exports.Purchase = mongoose.model("Purchase", purchaseSchema);
