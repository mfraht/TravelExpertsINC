// Using Node.js `require()`
const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const { Agent } = require("./agent");
const { Customer } = require("./customersMdl");

const userSchema = new mongoose.Schema({
  _id: Number,
  userId: {
    type: Number,
    required: "userId is required",
    trim: true,
    unique: "The userId must be unique.",
  },
  username: {
    type: String,
    required: "Username is required",
    trim: true,
    unique: "The username must be unique.",
    lowercase: true,
  },
  fname: {
    type: String,
    required: "Username First name is required",
    trim: true,
  },
  lname: {
    type: String,
    trim: true,
  },
  userAddress: {
    type: String,
    trim: true,
  },
  userCity: {
    type: String,
    trim: true,
  },
  userProv: {
    type: String,
    trim: true,
  },
  userPostal: {
    type: String,
    trim: true,
  },
  userCountry: {
    type: String,
    trim: true,
  },
  userHomePhone: {
    type: Number,
    trim: true,
    // default: 0,
  },
  userBusPhone: {
    type: Number,
    trim: true,
  },
  email: {
    type: String,
    required: "Please enter your email",
    trim: true,
    validate: {
      validator: function (v) {
        return /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})*$/.test(v);
      },
      message: (props) => `${props.value} is not a valid Email address.`,
    },
  },
  password: {
    type: String,
    required: "Please enter a password",
    trim: true,
    validate: {
      validator: function (v) {
        return /(?=(.*[0-9]))((?=.*[A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z]))^.{6,}$/.test(
          v
        );
      },
      message: (props) =>
        `Password should have 1 lowercase letter, 1 uppercase letter, 1 number, and be at least 6 characters.`,
    },
  }, // more fields defined below
  role: {
    type: String,
    trim: true,
    default: "customer",
  },
  customerId: { type: Number, ref: "Customer"  },
  agentId: { type: Number, ref: "Agent", default: 2 },
});

userSchema.virtual("userDetails").get(async function () {
  if (this.role === "customer") {
    return await Customer.findById(this.customerId);
  } else {
    return await Agent.findById(this.agentId);
  }
});

userSchema.plugin(uniqueValidator);
// Create a model User using the userSchema
module.exports.User = mongoose.model("User", userSchema);
