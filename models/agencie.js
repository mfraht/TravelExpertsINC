//- Author: Mohamed Ibrahim
const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const AgencieSchema = new mongoose.Schema({
  _id: Number,
  AgencyId: {
    type: Number,
    required: "AgentId is required",
    trim: true,
    unique: "The AgentId must be unique.",
    // lowercase: true,
  },
  AgncyAddress: {
    type: String,
    required: "First name is required",
    trim: true,
  },
  AgncyCity: {
    type: String,
    trim: true,
  },
  AgncyProv: {
    type: String,
    required: "Last name is required",
    trim: true,
  },
  AgncyPostal: {
    type: String,
    required: "Last name is required",
    trim: true,
  },
  AgncyCountry: {
    type: String,
    trim: true,
  },
  AgncyPhone: {
    type: String,
    trim: true,
  },
  AgncyFax: {
    type: String,
    trim: true,
  },
});

// Create a model Agent using the agentSchema
module.exports.Agencie = mongoose.model("agencie", AgencieSchema);
