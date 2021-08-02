var express = require("express");
var router = express.Router();
const { customer } = require("../models/customersMdl");
const bcrypt = require("bcryptjs");

router.get("/", function (req, res, next) {
  // const message = req.query.msg;
  // const message = req.session.msg; // Read the message from the session variable
  // req.session.msg = null; // Delete the message, as we no longer need it
  customer
    .find()
    // .populate("user") //This populates the user id with actual user information!
    .exec(function (err, customers) {
      console.log(customers);
      if (err) throw err;
      res.render("customers", { customers: customers });
    });
});

// const pageRegister = {
//   pagetitle: "Sign-Up",
//   pageheading: "Create a new account",
//   pagemessage: "Please enter the required information to create a new account.",
//   hideLogin: true,
// };
// const pageShowPosts = {
//   pagetitle: "Blog posts",
//   pageheading: "List all posts",
//   pagemessage: "These are all postets.",
// };

// /* Sign-up page. */
// router.get("/sign-up", function (req, res, next) {
//   res.render("sign-up", pageRegister);
// });

router.post("/sign-up", function (req, res, next) {
  // Create a new customer object from the customer Model
  const customer = new customer(req.body);
  const errs = customer.validateSync(); // Run the model validation
  if (errs) {
    return processErrors(errs, req, res);
  }
  bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
    if (err) throw err;
    // Replace the plain password with the hashed password
    ////customer.password = hashedPassword;
    // Store the use object in the DB
    customer.save((err, result) => {
      if (err) {
        return processErrors(err, req, res);
      }
      //console.log(result);
      const headermessage = `Account created ${result.fname}`;
      res.redirect("/?headermessage=" + headermessage);
    });
  });
});

function processErrors(errs, req, res) {
  // If there are errors from the Model schema
  const errorArray = [];
  const errorKeys = Object.keys(errs.errors);
  errorKeys.forEach((key) => errorArray.push(errs.errors[key].message));
  return res.render("sign-up", {
    ...pageRegister,
    errors: errorArray,
    ...req.body,
  });
}

module.exports = router;
