const express = require("express");
const router = express.Router();
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys") // To sign our web tokens
const passport = require("passport");
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

// Route to register a user
router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }
  
  // Check to make sure nobody has already registered with a duplicate email
  User.findOne({ email: req.body.email })
  .then(user => {
    if (user) {
      // Use the validations to send the error
      errors.email = "Woops! An account with that email already exists!";
      return res.status(400).json(errors);
    } else {
      // Otherwise create a new user
      const newUser = new User({
        handle: req.body.handle,
        email: req.body.email,
        password: req.body.password
      });
      
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser.save()
          .then(user => res.json(user))
          .catch(err => console.log(err))
        })
      })
    }
  })
})

// Route to login a user
router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);
  
  if (!isValid) {
    return res.status(400).json(errors);
  }
  
  
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({email})
    .then(user => {
      if (!user) {
        // Use the validations to send the error
        errors.email = "User not found";
        return res.status(404).json(errors);
      }

      bcrypt.compare(password, user.password)
        .then(isMatch => {
          if (isMatch) {
            const payload = {id: user.id, name: user.name};

            // We want to return a signed web token with each login or
            // register request, in order to "sign the user in" on the frontend
            jwt.sign(
              payload,
              keys.secretOrKey,
              // Tell the key to expire in one hour
              {expiresIn: 3600},
              (err, token) => {
                res.json({
                  success: true,
                  token: 'Bearer ' + token
                });
              }
            )
          } else {
            return res.status(400).json({password: "Incorrect password"});
          }
        })
    });
})

// Private auth route
router.get("/current", passport.authenticate("jwt", {session: false}), (req, res) => {
  res.json({
    id: req.user.id,
    handle: req.user.handle,
    email: req.user.email
  });
});


module.exports = router;