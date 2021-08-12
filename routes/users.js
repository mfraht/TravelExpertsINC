var express = require("express");
var router = express.Router();
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

router.get("/", function (req, res, next) {
  User.find().exec(function (err, users) {
    console.log("->-> Line 26");
    if (err) throw err;
    res.render("users", { users: users });
  });
});


/* GET Agents contact listing. */
router.get("/agents", function (req, res, next) {
  //console.log("packages");
  Agent.find().exec(function (err, agents) {
    //console.log(packages);
    if (err) throw err;
    res.render("agents", { agents });
  });

  // res.render("packages", { packages });
});


/* Sign-up page. */
router.get("/sign-up", function (req, res, next) {
  console.log("->-> Line 33");
  const userId = crypto.randomInt(1, 500) + 124000;
  req.session.userId = userId;
  console.log(userId)
  res.render("sign-up", { pageRegister, userId: userId });
});

router.post("/sign-up", function (req, res, next) {
  // Create a new user object from the User Model
  console.log("->-> Line 42");
  const user = new User(req.body);
  const errs = user.validateSync(); // Run the model validation
  if (errs) {
    const userId = crypto.randomInt(1, 500) + 124000;
    return processErrors(errs, "sign-up", req, res);
  }
  user._id = req.body.userId;
  user.customerId = req.body.userId;
  // console.log(user);
  
  bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
    if (err) throw err;
    // Replace the plain password with the hashed password
    user.password = hashedPassword;
    const custId = req.session.custId;

    const customer = new Customer();
    customer.CustomerId = user.userId;
    customer.CustFirstName = user.fname;
    customer.CustLastName = user.lname;
    customer._id = user._id;
    // console.log(customer);
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

router.get("/useradddetails/:userId", function (req, res, next) {
  console.log("->-> Line 85");
  const userId = req.params.userId;
  var add = true;
  User.findOne({ userId: userId }, (err, user) => {
    // console.log(user.userHomePhone );
    if (parseInt(user.userHomePhone)) {
      add = false;
    }
    // console.log(add);
    res.render("userprofileadd", { user: user, add: add });
  });
});



// Process the added user profile data
router.post("/useradddetails/:userId", function (req, res, next) {
  const data = req.body;
  console.log("->-> Line 105");
  console.log(data);
  const user = new User(data);
  console.log(user);
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
      // console.log("I'm in line 119 ");
      res.redirect("/users/userprofile/" + user.userId); // Always redirect to another page after you process the form submission
    }
  );
});

// Process the edited user profile data
router.get("/edit/:userId", function (req, res, next) {
  console.log("->-> Line 133");
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
  console.log("->-> Line 146");
  const userId = req.params.userId;
  new User(req.body).validate((err) => {
    //To validate the data before updating
    if (err)
      //console.log(err);
      return processErrors(err, "userprofileadd", req, res, {
        add: false,
        user: { ...req.body, _id: userId },
      });
    console.log(req.body);
    User.findByIdAndUpdate(
      userId,
      req.body,
      { new: false, useFindAndModify: false },
      function (err) {
        if (!parseInt(user.userHomePhone)) {
          add = true;
        }
        if (err) {
          //console.log(err);
          return processErrors(err, "userprofileadd", req, res, { add: add });
        }

        res.redirect("/users/userprofile/" + userId);
      }
    );
  });
});

/* Delete a book, given its Id. */
router.get("/delete/:userId", function (req, res, next) {
  console.log("->-> Line 178");
  const userId = req.params.userId;
  // console.log(userId);
  User.findByIdAndDelete(userId, (err) => {
    if (err) console.log(err);
    req.session.msg = `User ${userId} is deleted`;
    // message: (props) => `${props.value} is not a valid Email address.`,
    res.redirect("/");
  });
});

//
router.get("/switchrole/:userId", function (req, res, next) {
  console.log("->-> Line 191");
  const userId = req.params.userId;
  // console.log("I'm in line 190");
  var add = true;
  User.findOne({ userId: userId }, (err, user) => {
    if (err) console.log(err);
    // console.log(user.userHomePhone );
    if (parseInt(user.userHomePhone)) {
      add = false;
    }
    console.log(user);
    res.render("switchrole", { user, add: add }); //{ user: user, add: add }
  });
});

//
router.post("/switchrole/:userId", function (req, res, next) {
  const userId = req.params.userId;
  var add = true;
  User.findOne({ userId: userId }, (err, user) => {
    if (err) console.log(err);
    // console.log(user.userHomePhone );
    if (parseInt(user.userHomePhone)) {
      add = false;
    }
    console.log(user);
    const data = req.body;
    console.log("->-> Line 218");
    console.log(data.role);

    if (!req.user || req.user.role !== "manager") {
      req.session.msg = "You are not allowed to change user roles.";
      return res.redirect("/");
    }
    // const userId = req.params.userId;
    const newrole = data.role;
    console.log(`New Role is ${newrole}`)
    if (!userId) return res.redirect("/");
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
  // Check if the user is not logged in or the user is not a manager,
  // redirect to home page /:newRol
  // const newRol = req.params.newRol;
  console.log("->-> Line 250");
  const data = req.body;
  // var newrole = data.role;
  console.log(data);
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

// router.post("/sign-up", function (req, res, next) {
//   // Create a new user object from the User Model

//   const user = new User(req.body);
//   const errs = user.validateSync(); // Run the model validation

//   if (errs) {
//     return processErrors(errs, req, res);
//   }
//   bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
//     if (err) throw err;
//     // Replace the plain password with the hashed password
//     user.password = hashedPassword;
//     // Store the use object in the DB
//     user.save((err, result) => {
//       if (err) {
//         return processErrors(err, req, res);
//       }
//       //console.log(result);
//       const headermessage = `Account created ${result.fname}`;
//       res.redirect("/?headermessage=" + headermessage);
//     });
//   });
// });

//  
router.get("/userprofile/:userId", function (req, res, next) {
  console.log("->-> Line 295");
  const userId = req.params.userId;
  var add = true;
  User.findOne({ userId: userId }, (err, user) => {
    if (!parseInt(user.userHomePhone)) {
      add = true;
    }
    try {
      // console.log(user.userHomePhone); //await
      if (!parseInt(user.userHomePhone)) {
        add = true;
      } else {
        add = false;
      }
    } catch {
      add = true;
    }
    // console.log(user);
    // console.log(add);

    // if (user.userHomePhone == "undefined") { add=true;};
    res.render("userprofile", { user: user, add: add });
  });
});



function processErrors(errs, pageTemplate, req, res, data) {
  // If there are errors from the Model schema
  const errorArray = [];
  const errorKeys = Object.keys(errs.errors);
  errorKeys.forEach((key) => errorArray.push(errs.errors[key].message));
  return res.render(pageTemplate, {
    errors: errorArray,
    ...req.body,
    ...data,
    // ...pageRegister,
    // errors: errorArray,
    // ...req.body,
  });
}

module.exports = router;
