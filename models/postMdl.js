// Require the mongoose module
var mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const postSchema = new mongoose.Schema({
  posttitle: {
    type: String,
    required: "Please enter your name.",
    trim: true,
  },
  postbody: {
    type: String,
    required: "Please write your comments.",
    trim: true,
    validate: {
      validator: function (v) {
        return v.length > 10;
      },
      message: (props) => `${props.value} body is too short.`,
    },
  },
  posturl: {
    type: String,
    trim: true,
    // required: "Please enter your email",
  },
  // user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  // more fields defined below
});

postSchema.plugin(uniqueValidator);

module.exports.Post = mongoose.model("Post", postSchema);
