// 
var httpProxy = require("http-proxy");
var apiProxy = httpProxy.createProxyServer();
var serverOne = process.env.DATA_URL || "http://localhost:8050"; // Defining the DB servers online or local

// Main end point for accessing the database server
module.exports = function (req, res) {
  if (!req.user || req.user.role != "manager") { //Checking if the user is has a manager role or not
    req.session.msg = "You are not allowed to acces the business data.";
    res.status(403).redirect("/");
  }
  console.log("redirecting to Server1");
  var urlParams = "Greece/545";
  res.render("data", { serverOne: serverOne + urlParams }); // Redirecting to the DB server
};
