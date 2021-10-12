//- Updated by: Mohamed Ibrahim
const mongoose = require("mongoose");
const { Schema } = mongoose;

const purchaseSchema = new Schema({
  _id: Number,
  purchaseId: {
    type: Number,
    unique: "The purchaseId must be unique."},
  PackageId: { type: Number, ref: "Package" },
  userId: {
    type: Number,
    required: "userId is required",
    trim: true,
    default: 1},
  TravelerCount: Number,
});

module.exports.Purchase = mongoose.model("Purchase", purchaseSchema);
