// https://codeforgeek.com/reverse-proxy-using-expressjs/
var httpProxy = require("http-proxy");
var apiProxy = httpProxy.createProxyServer();
var serverOne = process.env.DATA_URL || "http://localhost:8050";

module.exports = function (req, res) {
  if (!req.user || req.user.role != "manager") {
    req.session.msg = "You are not allowed to acces the business data.";
    res.status(403).redirect("/");
  }
  console.log("redirecting to Server1");
  var urlParams = "Greece/545";
  res.render("data", { serverOne: serverOne + urlParams });
  // apiProxy.web(req, res, { target: serverOne });
};
