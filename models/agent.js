// Using Node.js `require()`
// npm i mongoose
// npm i mongoose-unique-validator

const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const agentSchema = new mongoose.Schema({
  _id: Number,
  AgentId: {
    type: Number,
    required: "AgentId is required",
    trim: true,
    unique: "The AgentId must be unique.",
    // lowercase: true,
  },
  AgtFirstName: {
    type: String,
    required: "First name is required",
    trim: true,
  },
  AgtMiddleInitial: {
    type: String,
    trim: true,
  },
  AgtLastName: {
    type: String,
    required: "Last name is required",
    trim: true,
  },
  AgtBusPhone: {
    type: Number,
    trim: true,
  },
  AgtEmail: {
    type: String,
    trim: true,
    validate: {
      validator: function (v) {
        return /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})*$/.test(v);
      },
      message: (props) => `${props.value} is not a valid Email address.`,
    },
  },
  AgtPosition: {
    type: String,
    trim: true,
    default: "-",
  },
  AgencyId: {
    type: Number,
    trim: true,
  },
  //   registeredOn: {
  //   type: Date,
  //   default: new Date(),
  // },
});

agentSchema.plugin(uniqueValidator);
// Create a model Agent using the agentSchema
module.exports.Agent = mongoose.model("agent", agentSchema);
