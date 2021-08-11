const mongoose = require("mongoose");
const { Schema } = mongoose;

const bookingdetailSchema = new Schema({
  _id: Number,
  BookingDetailId: { type: Number, default: 0, required: "Please enter the package id." }, // String is shorthand for {type: String}
  BookingId: { type: Number, default: 0, required: "Please enter the package id." }, // String is shorthand for {type: String}
  ItineraryNo: Number,
  TripStart: {
    type: Date,
    required: "Please enter the package start date.",
    },
  TripEnd: {
    type: Date,
    required: "Please enter the package end date.",
    },
  Description: { type: String, required: "Please enter the package Description." },
  Destination: { type: String, required: "Please enter the package Description." },
  RegionId: String,
  ClassId: String,
  FeeId: String,
  ProductSupplierId: Number,
  BasePrice: {
    type: Number,
    required: "Please enter the package Base Price.",
    },
  AgencyCommission: {
    type: Number,
    required: "Please enter the package Agency Commission.",
    },
  image: String,
});

module.exports.Bookingdetail = mongoose.model("bookingdetail", bookingdetailSchema);
