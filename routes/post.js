//- Author: Mohamed Ibrahim
var express = require("express");
var router = express.Router();

// Requiring Models
const Post = require("../models/postMdl").Post;
const { User } = require("../models/user");
const { Agent } = require("../models/agent");
const { Agencie } = require("../models/agencie");
const crypto = require("crypto");

/* GET all posts listing. */
router.get("/", function (req, res, next) {
  Post.find()
    .populate("user") //This populates the user id with actual user information!
    .exec(function (err, posts) {
      if (err) throw err;
      res.render("blog-author", { blogPosts: posts });
    });
});

// Show all posts for given username
router.get("/auth/:uname", function (req, res, next) {
  // Using the given username paramter, find the user(auther) object from the DB
  // Use the user _id from the user object, to find all posts for the _id
  User.findOne({ username: req.params.uname }, (err, author) => {
    if (err) return processErrors(err, "blog", req, res);
    Post.find({ user: author._id }, (err, posts) => {
      if (err) return processErrors(err, "blog", req, res);
      res.render("blog-author", { user: author.username, blogPosts: posts });
    });
  });
});



// Show the create form
router.get("/contact", function (req, res, next) {
  Agent.find().exec(function (err, agents) {
    if (err) throw err;
    Agencie.find().exec(function (err, agencies) {
      if (err) throw err;
      res.render("contact", { agents, agencies });
    });
    
    });
    
});

// To receive a new post data
router.post("/contact", function (req, res, next) {
    // Check if the user is logged in or not before posting
  if (!req.user){
    req.session.msg = `Please login first`;
    res.redirect("/post/contact");
  }
  const post = new Post();
  post.posttitle = req.body.posttitle;
  post.postbody = req.body.postbody;
  post.email = req.body.email;
  const postId = crypto.randomInt(1, 500) + 111000;
  post.postId=postId,
  post.save((err) => {
    if (err) {
      const errorArray = [];
      const errorKeys = Object.keys(err.errors);
      errorKeys.forEach((key) => errorArray.push(err.errors[key].message));
      return res.render("contact", {
              postdata: req.body,
        errors: errorArray,
      });
    }
    // Put the thank you message in a session variable
    req.session.msg = `Thank you for posting ${req.user.fname}`;
    res.redirect("/post/contact");
  });
});

// Shows a single post
router.get("/:purl", function (req, res, next) {
  const psturl = req.params.purl;
  Post.findOne({ email: psturl }, (err, post) => {
    if (err) throw err;
    res.render("blog-post", { blogPost: post });
  });
});

// process Errors
function processErrors(errs, pageTemplate, req, res) {
  // If there are errors from the Model schema
  const errorArray = [];
  const errorKeys = Object.keys(errs.errors);
  errorKeys.forEach((key) => errorArray.push(errs.errors[key].message));
  return res.render(pageTemplate, {
    ...pageRegister,
    errors: errorArray,
    ...req.body,
  });
}
module.exports = router;
