//- Author: Mohamed Ibrahim

var express = require("express");
var router = express.Router();
const { Customer } = require("../models/customersMdl");


// Main end point for customers router
// It grapes the customer list from the DataBase
router.get("/", function (req, res, next) {
  Customer.find().exec(function (err, customers) {
    if (err) throw err;
    res.render("customers", { customers: customers });
    });
});
module.exports = router;
