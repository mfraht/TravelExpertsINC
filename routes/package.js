var express = require("express");
var router = express.Router();

const { Package } = require("../models/package");
const { Purchase } = require("../models/purchase");
const { Booking } = require("../models/booking");
const { Bookingdetail } = require("../models/bookingdetail");

const { customer } = require("../models/customersMdl");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

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
  // console.log(packurl)
  Package.findOne({ PackageId: packurl }, (err, package) => {
    if (err) console.log(err);
    
    res.render("packagedetails", { pack: package });
  });
});

// Process the buy Package data
router.post("/buy", function (req, res, next) {
  // if (!req.user) {
  //   req.session.msg = "Please log in first";
  //   res.redirect("/package");
  //   // return
  // }

  const purchase = new Purchase();
  // post.user = req.user._id;
  
  
  console.log(req.user.userId)
  // purchase.userId = 3;
  const purchaseId = crypto.randomInt(1, 500) + 222000;
  purchase._id = purchaseId;
  purchase.purchaseId = purchaseId;
  purchase.PackageId = req.body.PackageId;
  purchase.userId = req.user.userId;
  purchase.TravelerCount = req.body.TravelerCount;
  console.log(purchase);
  purchase.save((err, result) => {
    if (err) {
      return processErrors(err, "packagedetails", req, res, req.body);
    }
    res.redirect("/package/purchases/" + purchase.userId); //package_s/purchases
  // purchase.save(function (err) {
  //   if (err) return processErrors(err, "packagedetails", req, res, req.body);
  //   console.log("purchased");
  //   res.redirect("/package/purchases/" + purchase.userId); //package_s/purchases
  });
});

/* GET the purchases page. */
router.get("/purchases/:userId", function (req, res, next) {
  
  const userId = req.params.userId;
  console.log(userId)
  req.session.userId = userId;

  Purchase.find({ userId: userId })
    // Replace the PackageId with the corresponding Package object from the Packages collection(table)
    .populate("PackageId")
    .exec((err, purchases) => {
      if (err) console.log(err);
      console.log(purchases);
      res.render("purchases", { purchases });
    });
});

router.get("/purchasesdelete/:purchase_id", function (req, res, next) {
  const purchase_id = req.params.purchase_id;
  // console.log(`PackageId is ${purchase_id}`);
  Purchase.findById({ _id: purchase_id }, (err, purchase) => {
    if (err) console.log(err);
    PackageId = purchase.PackageId;
    Package.findOne({ PackageId: PackageId }, (err, Package) => {
      if (err) console.log(err);
      // req.session.msg = `Are you sure you want to delete this purchase ${Package.PkgName}?`;
      res.render("purchasesdelete", { purchase, Package }); // Redirect to the purchases delete page
    });
  });
});

router.get("/return/:purchase_id", function (req, res, next) {
  const purchase_id = req.params.purchase_id;
  // console.log(`PackageId is ${purchase_id}`);
  const userID = req.session.userId;
  Purchase.findById({ _id: purchase_id }, (err, purchase) => {
    PackageId = purchase.PackageId;
    Package.findOne({ PackageId: PackageId }, (err, Package) => {
      var a = Package.PkgStartDate;
      console.log(`Package date ${a}, its value ${a.getTime()}`);
      var b = new Date();
      console.log(`current date ${b}, its value ${b.getTime()}`);
      diff = Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60));
      console.log(`difference date ${diff}`);
      if (diff > 24)
        Purchase.findByIdAndDelete({ _id: purchase_id }, (err) => {
          req.session.msg = `Package "${Package.PkgName}" is deleted`;
          if (err) console.log(err);
        });
      else if (diff < 0) {
        req.session.msg = `Package "${Package.PkgName}" start date is passed already, and it is deleted from your cart`;
        Purchase.findByIdAndDelete({ _id: purchase_id }, (err) => {
          if (err) console.log(err);
        });
      } else
        req.session.msg = `Package "${Package.PkgName}" can not be cancelled as it is less than 24 hours cancellation`;
      res.redirect("/package/purchases/" + userID); // Redirect to the purchases page
    });
  });
  // console.log(`PackageId is ${purchase_id}`);
});

router.get("/payment/:purchaseId", function (req, res, next) {
  console.log("->-> Line 188");
  const purchaseId = req.params.purchaseId;
  // console.log(`PackageId is ${purchase_id}`);
  Purchase.findOne({ _id: purchaseId }, (err, purchase) => {
    if (err) console.log(err);
    console.log(`Purchases are: ${purchase}`);
    console.log(`Purchases are: ${purchase.TravelerCount}`);
    res.render("payment", { purchase, TravelerCount: purchase.TravelerCount });
  });
});

router.get("/userbooking/:purchaseId", function (req, res, next) {
  console.log("->-> Line 201");
  const purchaseId = req.params.purchaseId;
  console.log(`purchaseId ${purchaseId}`);
  req.session.purchaseId = purchaseId;
  Purchase.findOne({ _id: purchaseId }) //, (err, purchase) => {
    // Replace the PackageId with the corresponding Package object from the Packages collection(table)
    .populate("PackageId")
    .exec((err, purchase) => {
      if (err) console.log(err);
      console.log(purchase);
      ///
      const booking = new Booking();
      const _id = crypto.randomInt(1, 500) + 333000;
      booking._id = _id;
      booking.BookingId = _id;
      booking.BookingDate = new Date();
      booking.BookingNo = _id;
      booking.TravelerCount = purchase.TravelerCount;
      booking.CustomerId = purchase.userId;
      booking.TripTypeId = "L";
      booking.PackageId = purchase.PackageId;
      booking.save(function (err) {
        // Create a new record in the DB
        if (err)
          return processErrors(err, "packageadd", req, res, { add: true });
        Purchase.findByIdAndDelete({ _id: purchaseId }, (err) => {
          if (err) console.log(err);
        });
        console.log(booking);
        res.render("userbooking", { booking, purchase });
      });
    });
});

router.get("/userbookings/:userId", function (req, res, next) {
  console.log("->-> Line 227");
  const customerId = req.params.userId;
  console.log(`customerId ${customerId}`);
  Booking.find({ CustomerId: customerId })//, (err, bookings) => {
    // Replace the PackageId with the corresponding Package object from the Packages collection(table)
    .populate("PackageId")
    .exec((err, bookings) => {
    if (err) console.log(err);
    console.log(bookings);
    // console.log(bookings[0].PackageId.PackageId);
    res.render("userbookings", { bookings });
  });
});

// Handling errors
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
