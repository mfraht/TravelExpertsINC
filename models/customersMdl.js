// Using Node.js `require()`
const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const customerSchema = new mongoose.Schema({
  CustomerId: {
    type: Number,
    required: "CustomerId is required",
    trim: true,
    unique: "The CustomerId must be unique.",
    // lowercase: true,
  },
  CustFirstName: {
    type: String,
    required: "First name is required",
    trim: true,
  },
  CustLastName: {
    type: String,
    required: "Last name is required",
    trim: true,
  },
  CustAddress: {
    type: String,
    trim: true,
  },
  CustCity: {
    type: String,
    trim: true,
  },
  CustProv: {
    type: String,
    trim: true,
  },
  CustPostal: {
    type: String,
    trim: true,
  },
  CustCountry: {
    type: String,
    trim: true,
  },
  CustHomePhone: {
    type: Number,
    trim: true,
  },
  CustBusPhone: {
    type: Number,
    trim: true,
  },
  CustEmail: {
    type: String,
    trim: true,
    validate: {
      validator: function (v) {
        return /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})*$/.test(v);
      },
      message: (props) => `${props.value} is not a valid Email address.`,
    },
    AgentId: {
      type: Number,
      trim: true,
    },
  },
});

customerSchema.plugin(uniqueValidator);
// Create a model User using the userSchema
module.exports.customer = mongoose.model("customer", customerSchema);
