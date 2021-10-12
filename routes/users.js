//- Author: Mohamed Ibrahim
var express = require("express");
var router = express.Router();

// Requiring Models
const { User } = require("../models/user");
const { Agent } = require("../models/agent");
const bcrypt = require("bcryptjs");

// const processErrors = require("./processErrors");
const { Customer } = require("../models/customersMdl");
const switchUserRole = require("../models/switchUserRole");
const crypto = require("crypto");

const pageRegister = {
  pagetitle: "Sign-Up",
  pageheading: "Create a new account",
  pagemessage: "Please enter the required information to create a new account.",
  hideLogin: true,
};
const pageShowPosts = {
  pagetitle: "Blog posts",
  pageheading: "List all posts",
  pagemessage: "These are all postets.",
};

/* GET users  listing. */
router.get("/", function (req, res, next) {
  User.find().exec(function (err, users) {
    if (err) throw err;
    res.render("users", { users: users });
  });
});


/* GET Agents contact listing. */
router.get("/post/contact", function (req, res, next) {
  Agent.find().exec(function (err, agents) {
    if (err) throw err;
    res.render("/post/contact", { agents });
  });
});


/* Sign-up page. */
router.get("/sign-up", function (req, res, next) {
  const userId = crypto.randomInt(1, 500) + 124000;
  req.session.userId = userId;
  res.render("sign-up", { pageRegister, userId: userId });
});

router.post("/sign-up", function (req, res, next) {
  // Create a new user object from the User Model
  const user = new User(req.body);
  const errs = user.validateSync(); // Run the model validation
  if (errs) {
    const userId = crypto.randomInt(1, 500) + 124000;
    return processErrors(errs, "sign-up", req, res);
  }
  user._id = req.body.userId;
  user.CustomerId = req.body.userId;  
  bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
    if (err) throw err;
    // Replace the plain password with the hashed password
    user.password = hashedPassword;
    const custId = req.session.custId;
    const customer = new Customer();
    customer.CustomerId = user._id;
    customer.CustFirstName = user.fname;
    customer.CustLastName = user.lname;
    customer._id = user._id;
    // Store the use object in the DB
    customer.save((err, result) => {
      if (err) {
        return processErrors(err, "sign-up", req, res, req.body);
      }
      user.customerId = custId;
      user.save(function (err) {
        // Save the user data
        if (err) return processErrors(err, "sign-up", req, res, req.body);
        res.redirect("/");
      });
    });
  });
});

/* GET user details. */
router.get("/useradddetails/:userId", function (req, res, next) {
  const userId = req.params.userId;
  var add = true;
  User.findOne({ userId: userId }, (err, user) => {
    if (parseInt(user.userHomePhone)) {
      add = false;
    }
    res.render("userprofileadd", { user: user, add: add });
  });
});



// End point to the added user profile data
router.post("/useradddetails/:userId", function (req, res, next) {
  const data = req.body;
  const user = new User(data);
  user.userId = user.userId;
  user._id = user.userId;
  const userId = user.userId;
  // Make sure the image starts with /imagaes/, or add it to the image path
  if (user.image && !user.image.includes("/images/"))
    user.image = "/images/" + user.image;

  User.findByIdAndUpdate(
    userId,
    user,
    { new: false, useFindAndModify: false },
    function (err) {
      // Create a new record in the DB
      var add = false;
      if (err)
        return processErrors(err, "userprofileadd", req, res, { add: true });
      res.redirect("/users/userprofile/" + user.userId); // Always redirect to another page after you process the form submission
    }
  );
});

// End point to the edited user profile data
router.get("/edit/:userId", function (req, res, next) {
  const userId = req.params.userId;
  var add = true;
  User.findOne({ userId: userId }, (err, user) => {
    if (err) console.log(err);
    if (parseInt(user.userHomePhone)) {
      add = false;
    }
    res.render("userprofileadd", { user, add: add });
  });
});
// Process the edited user profile data
router.post("/edit/:userId", function (req, res, next) {
  const userId = req.params.userId;
  new User(req.body).validate((err) => {
    //To validate the data before updating
    if (err)
      return processErrors(err, "userprofileadd", req, res, {
        add: false,
        user: { ...req.body, _id: userId },
      });
    User.findByIdAndUpdate(
      userId,
      req.body,
      { new: false, useFindAndModify: false },
      function (err) {
        if (!parseInt(user.userHomePhone)) {
          add = true;
        }
        if (err) {
          return processErrors(err, "userprofileadd", req, res, { add: add });
        }
        res.redirect("/users/userprofile/" + userId);
      }
    );
  });
});

/* Delete a booking, given its Id. */
router.get("/delete/:userId", function (req, res, next) {
  const userId = req.params.userId;
  User.findByIdAndDelete(userId, (err) => {
    if (err) console.log(err);
    req.session.msg = `User ${userId} is deleted`;
    res.redirect("/");
  });
});

// End point to switching role pug file
router.get("/switchrole/:userId", function (req, res, next) {
  const userId = req.params.userId;
  var add = true;
  User.findOne({ userId: userId }, (err, user) => {
    if (err) console.log(err);
    if (parseInt(user.userHomePhone)) {
      add = false;
    }
    res.render("switchrole", { user, add: add }); //{ user: user, add: add }
  });
});

// Processing witching customer role
router.post("/switchrole/:userId", function (req, res, next) {
  const userId = req.params.userId;
  var add = true;
  User.findOne({ userId: userId }, (err, user) => {
    if (err) console.log(err);
    
    if (parseInt(user.userHomePhone)) {
      add = false;
    }
    const data = req.body;
    if (!req.user || req.user.role !== "manager") {
      req.session.msg = "You are not allowed to change user roles.";
      return res.redirect("/");
    }
    const newrole = data.role;
    switchUserRole(userId, newrole, (err) => {
      req.session.msg = `User role changed to ${newrole}`;
      if (err) {
        req.session.msg = err;
      }
      res.redirect("/");
    });
  }); 
});

/* Switch the user role. */
router.get("/switchnewrole/:userId", function (req, res, next) {
  const data = req.body;
  if (!req.user || req.user.role !== "manager") {
    req.session.msg = "You are not allowed to change user roles.";
    return res.redirect("/");
  }
  const userId = req.params.userId;
  if (!userId) return res.redirect("/");
  switchUserRole(userId, newrole, (err) => {
    req.session.msg = "User role changed.";
    if (err) {
      req.session.msg = err;
    }
    res.redirect("/");
  });
});


//  
router.get("/userprofile/:userId", function (req, res, next) {
  const userId = req.params.userId;
  var add = true;
  User.findOne({ userId: userId }, (err, user) => {
    if (!parseInt(user.userHomePhone)) {
      add = true;
    }
    try {
      if (!parseInt(user.userHomePhone)) {
        add = true;
      } else {
        add = false;
      }
    } catch {
      add = true;
    }
    res.render("userprofile", { user: user, add: add });
  });
});

// process Errors
function processErrors(errs, pageTemplate, req, res, data) {
  // If there are errors from the Model schema
  const errorArray = [];
  const errorKeys = Object.keys(errs.errors);
  errorKeys.forEach((key) => errorArray.push(errs.errors[key].message));
  return res.render(pageTemplate, {
    errors: errorArray,
    ...req.body,
    ...data,
  });
}

module.exports = router;
