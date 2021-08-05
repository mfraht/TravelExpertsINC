var express = require("express");
var router = express.Router();

const { Package } = require("../models/package");
const { Purchase } = require("../models/purchase");

//const bcrypt = require("bcryptjs");

/* GET the add form. */
router.get("/add", function (req, res, next) {
  res.render("packageadd", { add: true });
});

// Process the added package data
router.post("/add", function (req, res, next) {
  const data = req.body;
  const pack = new Package(data);
  // Make sure the image starts with /imagaes/, or add it to the image path
  if (pack.image && !pack.image.includes("/images/"))
    pack.image = "/images/" + pack.image;
    pack.save(function (err) {
    // Create a new record in the DB
    if (err) return processErrors(err, "packageadd", req, res, { add: true });
    res.redirect("/"); // Always redirect to another page after you process the form submission
  });
});

/* GET the Edit form with given a package Id. */
router.get("/edit/:PackageId", function (req, res, next) {
  const PackageId = req.params.PackageId;
  Package.findById(PackageId, (err, pack) => {
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
  Package.findByIdAndDelete(PackageId, (err) => {
    if (err) console.log(err);
    //req.session.msg = `Package deleted ${PackageId}`;
    res.redirect("/");
  });
});



/* GET Packages listing. */
router.get("/", function (req, res, next) {
  //console.log("packages");
  Package.find().exec(function (err, packages) {
    //console.log(customers);
    if (err) throw err;
    res.render("packages", { packages: packages });
  });

  // res.render("packages", { packages });
});

// Shows a single package
router.get("/:purl", function (req, res, next) {
  const packurl = req.params.purl;
  Package.findOne({ PackageId: packurl }, (err, package) => {
    // console.log(package)
    res.render("packagedetails", { blogpackage: package });
  });
});



// Process the buy Package data
router.post("/buy", function (req, res, next) {
  const purchase = new Purchase();
  purchase.userId = 3;
  PackageId = purchase.PackageId = req.body.PackageId;
  purchase.quantity = req.body.quantity;
  purchase.save(function (err) {
    if (err) return processErrors(err, "package", req, res);
    res.redirect("/package/purchases"); //package_s/purchases
  });
});


/* GET the purchases page. */
router.get("/purchases/", function (req, res, next) {
  console.log("I'm in purchases");
  Purchase.findOne({ userId: 3 })
    // Replace the PackageId with the corresponding Package object from the Packages collection(table)
    .populate("PackageId")
    .exec((err, purchases) => {
      if (err) console.log(err);
      console.log(purchases);
      res.render("purchases", { purchases });
    });
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
