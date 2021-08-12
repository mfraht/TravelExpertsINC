const mongoose = require("mongoose");
const { Schema } = mongoose;

const packageSchema = new Schema({
  _id: Number,
  PackageId: { type: Number, unique: "The AgentId must be unique.", default: 0, required: "Please enter the package id." }, // String is shorthand for {type: String}
  PkgName: { type: String, required: "Please enter the package name." },
  PkgStartDate: {
    type: Date,
    required: "Please enter the package start date.",
  },
  PkgEndDate: {
    type: Date,
    required: "Please enter the package end date.",
  },
  PkgDesc: { type: String, required: "Please enter the package Description." },
  PkgBasePrice: {
    type: Number,
    required: "Please enter the package Base Price.",
  },
  PkgAgencyCommission: {
    type: Number,
    required: "Please enter the package Agency Commission.",
  },
  // description: String,
  image: String,
});

module.exports.Package = mongoose.model("Package", packageSchema);
