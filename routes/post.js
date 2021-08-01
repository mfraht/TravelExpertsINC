var express = require("express");
var router = express.Router();
const Post = require("../models/postMdl").Post;
const { User } = require("../models/user");

/* GET all posts listing. */
router.get("/", function (req, res, next) {
  // const message = req.query.msg;
  // const message = req.session.msg; // Read the message from the session variable
  // req.session.msg = null; // Delete the message, as we no longer need it
  Post.find()
    .populate("user") //This populates the user id with actual user information!
    .exec(function (err, posts) {
      if (err) throw err;
      res.render("blog", { blogPosts: posts });
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

// middleware that is specific to this router,
// checks that the user must be logged in
router.use((req, res, next) => {
  //console.log('Time: ', Date.now());
  if (!req.user) res.status(403).redirect("/");
  //else if (req.user.role != "agent") res.status(403).redirect("/");
  else next();
});

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
// Show the create form
router.get("/create", function (req, res, next) {
  res.render("post-create");
});

// To recieve a new post data
router.post("/create", function (req, res, next) {
  // const post = new Post(req.body);
  const post = new Post();
  post.posttitle = req.body.posttitle;
  post.postbody = req.body.postbody;
  post.posturl = req.body.posturl;
  // console.log(req.user);
  post.user = req.user._id;
  post.save((err) => {
    // if(err) throw err;
    if (err) {
      const errorArray = [];
      const errorKeys = Object.keys(err.errors);
      errorKeys.forEach((key) => errorArray.push(err.errors[key].message));
      return res.render("post-create", {
        postdata: req.body,
        errors: errorArray,
      });
    }
    // Put the thank you message in a session variable
    req.session.msg = `Thank you for posting ${req.user.fname}`;
    // req.flash("thankyou", `Thank you for posting ${req.user.fname}`);
    // res.redirect("/post" + "?msg=Thank you for posting " + req.user.fname);
    res.redirect("/post");
  });
});

// Shows a single post
router.get("/:purl", function (req, res, next) {
  const psturl = req.params.purl;
  Post.findOne({ posturl: psturl }, (err, post) => {
    res.render("blog-post", { blogPost: post });
  });
});

module.exports = router;
