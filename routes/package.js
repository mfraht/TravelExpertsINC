//- Author: Mohamed Ibrahim
var express = require("express");
var router = express.Router();
// Requiring Models
const { Package } = require("../models/package");
const { Purchase } = require("../models/purchase");
const { Booking } = require("../models/booking");
const { Bookingdetail } = require("../models/bookingdetail");
const { Agencie } = require("../models/agencie");
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
  const PackageId = crypto.randomInt(1, 500) + 111000;
  pack._id = PackageId;
  pack.PackageId = PackageId;
  // Make sure the image starts with /images/, or add it to the image path
  if (pack.image && !pack.image.includes("/images/"))
    pack.image = "/images/" + pack.image;
  // Create a new record in the DB
  pack.save(function (err) {
    if (err) return processErrors(err, "packageadd", req, res, { add: true });
    res.redirect("/package"); // Redirect to packages page after you process the form submission
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
  req.body.PackageId = PackageId;
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
  Package.findOne({ PackageId: PackageId }, (err, pack) => {
    if (err) console.log(err);
    Package.findByIdAndDelete(PackageId, (err) => {
      if (err) console.log(err);
      req.session.msg = `Package ${pack.PkgName} is deleted`;
      res.redirect("/package");
    });
  });
  
});

//- Author:Emmanuel Ajoma and Mohamed Ibrahim
/* GET Packages listing. */
router.get("/", function (req, res, next) {
  Package.find().exec(function (err, packages) {
    if (err) throw err;
    res.render("packages", { packages: packages });
  });
});

// Shows a package details
router.get("/details/:purl", function (req, res, next) {
  const packurl = req.params.purl;
  Package.findOne({ PackageId: packurl }, (err, package) => {
    if (err) console.log(err);
    res.render("packagedetails", { pack: package });
  });
});

// Process the buy Package data
router.post("/buy", function (req, res, next) {
  // Check if the user is logged in or not before buying
  if (!req.user) {
    req.session.msg = "Please log in first";
    res.redirect("/package");
  }
  // Creating a purchase object from the pug file
  const purchase = new Purchase();
  const purchaseId = crypto.randomInt(1, 500) + 222000;
  purchase._id = purchaseId;
  purchase.purchaseId = purchaseId;
  purchase.PackageId = req.body.PackageId;
  purchase.userId = req.user.userId;
  purchase.TravelerCount = req.body.TravelerCount;
  purchase.save((err, result) => {
    if (err) {
      return processErrors(err, "packagedetails", req, res, req.body);
    }
    res.redirect("/package/purchases/" + purchase.userId);
  });
});

/* GET the purchases page. */
router.get("/purchases/:userId", function (req, res, next) {
  if (!req.user) {
    req.session.msg = "Please log in first";
    res.redirect("/package");
  }
  const userId = req.params.userId;
  req.session.PackageId = userId;
  Purchase.find({ userId: userId })
    // Replace the PackageId with the corresponding Package object from the Packages collection(table)
    .populate("PackageId")
    .exec((err, purchases) => {
      if (err) console.log(err);
      res.render("purchases", { purchases });
    });
});

// End point for purchase delete warring page 
router.get("/purchasesdelete/:purchase_id", function (req, res, next) {
  if (!req.user) {
    req.session.msg = "Please log in first";
    res.redirect("/package");
  }
  const purchase_id = req.params.purchase_id;
  Purchase.findById({ _id: purchase_id }, (err, purchase) => {
    if (err) console.log(err);
    PackageId = purchase.PackageId;
    Package.findOne({ PackageId: PackageId }, (err, Package) => {
      if (err) console.log(err);
      
      res.render("purchasesdelete", { purchase, Package }); // Redirect to the purchases delete page
    });
  });
});

// Router for deleting a purchase
router.get("/return/:purchase_id", function (req, res, next) {
  if (!req.user) {
    req.session.msg = "Please log in first";
    res.redirect("/package");
  }
  const purchase_id = req.params.purchase_id;
  Purchase.findById({ _id: purchase_id }, (err, purchase) => {
    PackageId = purchase.PackageId;
    const userID = purchase.userId;
    Package.findOne({ PackageId: PackageId }, (err, Package) => {
      var a = Package.PkgStartDate;
      var b = new Date();
      diff = Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60));
      if (diff < 0) {
        req.session.msg = `Package "${Package.PkgName}" start date is passed already, and it is deleted from your cart`;
        Purchase.findByIdAndDelete({ _id: purchase_id }, (err) => {
          if (err) console.log(err);
        });
      }
      else
        Purchase.findByIdAndDelete({ _id: purchase_id }, (err) => {
          req.session.msg = `Package "${Package.PkgName}" is deleted`;
          if (err) console.log(err);
        });
      res.redirect("/package/purchases/" + userID); // Redirect to the purchases page
    });
  });
});

// Router for deleting a purchase
router.get("/bookingdelete/:bookId", function (req, res, next) {
  if (!req.user) {
    req.session.msg = "Please log in first";
    res.redirect("/package");
  }
  const bookId = req.params.bookId;
  Booking.findById({ _id: bookId }, (err, booking) => {
    PackageId = booking.PackageId;
    const userID = booking.CustomerId;
    console.log(PackageId, userID )
    Package.findOne({ PackageId: PackageId }, (err, Package) => {
      var a = Package.PkgStartDate;
      var b = new Date();
      diff = Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60));
      if (diff > 24)
      Booking.findByIdAndDelete({ _id: bookId }, (err) => {
          req.session.msg = `Package "${Package.PkgName}" is deleted`;
          if (err) console.log(err);
        });
      else
        req.session.msg = `Package "${Package.PkgName}" can not be cancelled as it is less than 24 hours cancellation`;
      res.redirect("/package/userbookings/" + userID); // Redirect to the purchases page
    });
  });
});

// Router for paying a purchase
router.get("/payment/:purchaseId", function (req, res, next) {
  if (!req.user) {
    req.session.msg = "Please log in first";
    res.redirect("/package");
  }
  const purchaseId = req.params.purchaseId;
  // Validating the package date with the current date
  Purchase.findById({ _id: purchaseId }, (err, purchase) => {
    PackageId = purchase.PackageId;
    Package.findOne({ PackageId: PackageId }, (err, Package) => {
      var a = Package.PkgStartDate;
      var b = new Date();
      diff = Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60));
      if (diff < 0) {
        req.session.msg = `Package "${Package.PkgName}" start date is passed already, and it is deleted from your cart`;
        Purchase.findByIdAndDelete({ _id: purchaseId }, (err) => {
          if (err) console.log(err);
          res.redirect("/package/purchases/" + purchase.userID);
        });
      } else
        res.render("payment", {
          purchase,
          TravelerCount: purchase.TravelerCount,
        });
    });
  });
});

// Router for creating a new booking
router.get("/userbooking/:purchaseId", function (req, res, next) {
  if (!req.user) {
    req.session.msg = "Please log in first";
    res.redirect("/package");
  }
  const purchaseId = req.params.purchaseId;
  req.session.purchaseId = purchaseId;
  Purchase.findOne({ _id: purchaseId })
    // Replace the PackageId with the corresponding Package object from the Packages collection(table)
    .populate("PackageId")
    .exec((err, purchase) => {
      if (err) console.log(err);
      // Creating a booking object and save it in database
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
        // Removing the purchase from the cart after payment
        Purchase.findByIdAndDelete({ _id: purchaseId }, (err) => {
          if (err) console.log(err);
        });
        res.render("userbooking", { booking, purchase });
      });
    });
});

// Router for listing all purchases for a certain user
router.get("/userbookings/:userId", function (req, res, next) {
  if (!req.user) {
    req.session.msg = "Please log in first";
    res.redirect("/package");
  }
  const customerId = req.params.userId;
  Booking.find({ CustomerId: customerId }) 
    // Replace the PackageId with the corresponding Package object from the Packages collection(table)
    .populate("PackageId")
    .exec((err, bookings) => {
      if (err) console.log(err);
      res.render("userbookings", { bookings });
    });
});

/* GET agencies contact listing. */
router.get("/agencies", function (req, res, next) {
  Agencie.find().exec(function (err, agencies) {
    if (err) throw err;
    res.render("agencies", { agencies });
  });
});

// Handling errors
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