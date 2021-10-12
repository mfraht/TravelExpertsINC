//- Author: Mohamed Ibrahim
const mongoose = require("mongoose");
const { Schema } = mongoose;
// productId: { type: Schema.Types.ObjectId, ref: "Product" },
const bookingSchema = new Schema({
  _id: Number,
  BookingId: { type: Number, ref: "bookingdetail"},
  BookingDate: {
    type: Date,
    required: "Please enter the package start date.",
  },
  BookingNo: { type: String, required: "Please enter the package Description." },
  TravelerCount: Number,
  CustomerId: Number,
  TripTypeId: String,
  PackageId: { type: Number, ref: "Package"},
});

module.exports.Booking = mongoose.model("booking", bookingSchema);
