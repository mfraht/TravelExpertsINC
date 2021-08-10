var express = require("express");
var router = express.Router();

const { Package } = require("../models/package");
const { Purchase } = require("../models/purchase");

const { customer } = require("../models/customersMdl");
const bcrypt = require("bcryptjs");
//const bcrypt = require("bcryptjs");



/* GET the add form. */
router.get("/add", function (req, res, next) {
  res.render("packageadd", { add: true });
});

// Process the added package data
router.post("/add", function (req, res, next) {
  const data = req.body;
  const pack = new Package(data);
  pack._id = pack.PackageId;
  // Make sure the image starts with /imagaes/, or add it to the image path
  if (pack.image && !pack.image.includes("/images/"))
    pack.image = "/images/" + pack.image;
    
  pack.save(function (err) {
    // Create a new record in the DB
    if (err) return processErrors(err, "packageadd", req, res, { add: true });
    res.redirect("/package"); // Always redirect to another page after you process the form submission
  });
});

/* GET the Edit form with given a package Id. */
router.get("/edit/:PackageId", function (req, res, next) {
  const PackageId = req.params.PackageId;

  Package.findOne({ PackageId: PackageId }, (err, pack) => {
    if (err) console.log(err);
    
    res.render("packageadd", { pack, add: false });
  });
});
// Process the edited Package data
router.post("/edit/:PackageId", function (req, res, next) {
  const PackageId = req.params.PackageId;
  new Package(req.body).validate((err) => {
    // To validate the data before updating
    if (err)
      return processErrors(err, "packageadd", req, res, {
        add: false,
        pack: { ...req.body, _id: PackageId },
      });
    Package.findByIdAndUpdate(PackageId, req.body, function (err) {
      if (err)
        return processErrors(err, "packageadd", req, res, { add: false });
      res.redirect("/package/details/" + PackageId);
    });
  });
});

/* Delete a book, given its Id. */
router.get("/delete/:PackageId", function (req, res, next) {
  const PackageId = req.params.PackageId;
  // console.log(PackageId);
  Package.findByIdAndDelete(PackageId, (err) => {
    if (err) console.log(err);
    req.session.msg = `Package ${PackageId} is deleted`;
    // message: (props) => `${props.value} is not a valid Email address.`,
    res.redirect("/");
  });
});

// /* GET the Package details page, for the given Package Id. */
// router.get("/details/:PackageId", function (req, res, next) {
//   const PackageId = req.params.PackageId;
//   Package.findById({ PackageId }, (err, pack) => {
//     if (err) console.log(err);
//     console.log(pack);
//     res.render("packagedetails", { pack });
//   });
// });
/* Process the package return, sent as GET request, for the given package Id. */

/* GET Packages listing. */
router.get("/", function (req, res, next) {
  //console.log("packages");
  Package.find().exec(function (err, packages) {
    //console.log(packages);
    if (err) throw err;
    res.render("packages", { packages: packages });
  });

  // res.render("packages", { packages });
});

// Shows a single package
router.get("/details/:purl", function (req, res, next) {
  const packurl = req.params.purl;
  Package.findOne({ PackageId: packurl }, (err, package) => {
    // console.log(package)
    res.render("packagedetails", { pack: package });
  });
});

// Process the buy Package data
router.post("/buy", function (req, res, next) {
  const purchase = new Purchase();
  
  // post.user = req.user._id;
  purchase.userId = req.user.userId;
  
  // purchase.userId = 3;
  purchase.PackageId = req.body.PackageId;
  purchase.quantity = req.body.quantity;

  purchase.save(function (err) {
    if (err) return processErrors(err, "packagedetails", req, res, req.body);
    res.redirect("/package/purchases/" + purchase.userId); //package_s/purchases
  });
});

/* GET the purchases page. */
router.get("/purchases/:userId", function (req, res, next) {

  const userId = req.params.userId;
  req.session.userId = userId;
  

  Purchase.find( {userId: userId} )
    // Replace the PackageId with the corresponding Package object from the Packages collection(table)
    .populate("PackageId")
    .exec((err, purchases) => {
      if (err) console.log(err);
      // console.log(purchases);
      res.render("purchases", { purchases });
    });
});

// // Show all posts for given username
// router.get("/auth/:uname", function (req, res, next) {
//   // Using the given username paramter, find the user(auther) object from the DB
//   // Use the user _id from the user object, to find all posts for the _id
//   User.findOne({ username: req.params.uname }, (err, author) => {
//     if (err) return processErrors(err, "blog", req, res);
//     Post.find({ user: author._id }, (err, posts) => {
//       if (err) return processErrors(err, "blog", req, res);
//       res.render("blog-author", { user: author.username, blogPosts: posts });
//     });
//   });
// });


router.get("/return/:purchase_id", function (req, res, next) {
  const purchase_id = req.params.purchase_id;
  // console.log(`PackageId is ${purchase_id}`);
    const userID  = req.session.userId
    Purchase.findById({ _id: purchase_id }, (err, purchase) => {
      PackageId = purchase.PackageId;
      Package.findOne({ PackageId: PackageId }, (err, Package) => {
        var a = Package.PkgStartDate;
        console.log(`Package date ${a}, its value ${a.getTime()}`);
        var b = new Date();
        console.log(`current date ${b}, its value ${b.getTime()}`);
        diff = Math.floor((a.getTime()-b.getTime())/(1000*60*60));
        console.log(`difference date ${diff}`);
        if (diff > 24)
          Purchase.findByIdAndDelete({ _id: purchase_id }, (err) => {
            req.session.msg = `Package ${PackageId} is deleted`;  
        if (err) console.log(err);
        });
        else if(diff < 0)
          req.session.msg = `Package ${PackageId} start date is passed already`;
        else 
          req.session.msg = `Package ${PackageId} can not be cancelled as it is less than 24 hours cancellation`;
        res.redirect("/package/purchases/" + userID); // Redirect to the purchases page
    });
  });
    // console.log(`PackageId is ${purchase_id}`);
    
      

  }); 

function processErrors(errs, pageTemplate, req, res, data) {
  // If there are errors from the Model schema
  const errorArray = [];
  const errorKeys = Object.keys(errs.errors);
  errorKeys.forEach((key) => errorArray.push(errs.errors[key].message));
  return res.render(pageTemplate, {
    // ...pageRegister,
    errors: errorArray,
    ...req.body,
    ...data,
  });
}

module.exports = router;
