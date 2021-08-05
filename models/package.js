const mongoose = require("mongoose");
const { Schema } = mongoose;

const packageSchema = new Schema({
  PackageId: { type: Number, required: "Please enter the package id." }, // String is shorthand for {type: String}
  PkgName: { type: String, required: "Please enter the package name." },
  PkgStartDate: {
    type: String,
    required: "Please enter the package start date.",
  },
  PkgEndDate: {
    type: String,
    required: "Please enter the package start date.",
  },
  PkgDesc: { type: String, required: "Please enter the package start date." },
  PkgBasePrice: {
    type: Number,
    required: "Please enter the package start date.",
  },
  PkgAgencyCommission: {
    type: Number,
    required: "Please enter the package start date.",
  },
  // description: String,
  // image: String,
});

module.exports.Package = mongoose.model("Package", packageSchema);
