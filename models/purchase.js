const mongoose = require("mongoose");
const { Schema } = mongoose;
// productId: { type: Schema.Types.ObjectId, ref: "Product" },
const purchaseSchema = new Schema({
  PackageId: { type: Number, ref: "Package" },
  userId: {
    type: Number,
    required: "userId is required",
    trim: true,
    unique: "The userId must be unique.",
    default: 1,
    ref: "user"},
  quantity: Number,
});

module.exports.Purchase = mongoose.model("Purchase", purchaseSchema);
