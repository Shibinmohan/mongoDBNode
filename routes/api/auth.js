const express = require("express");

const router = express.Router();

const bcrypt = require("bcryptjs");
const jsonwt = require("jsonwebtoken");
const passport = require("passport");
const key = require("../../setup/myurls");

router.get("/", (req, res) => {
  res.json({ test: "Auth is tested" });
});

//import schema for person to register
const Person = require("../../models/Person");

// /api/auth/regitser

router.post("/register", (req, res) => {
  Person.findOne({ email: req.body.email })
    .then((person) => {
      if (person) {
        return res
          .status(400)
          .json({ emailerror: "Email is already registerd" });
      } else {
        const newPerson = new Person({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
        });
        //Encrypt password using bcrypt

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newPerson.password, salt, (err, hash) => {
            if (err) throw err;
            newPerson.password = hash;
            newPerson
              .save()
              .then((person) => res.json(person))
              .catch((err) => console.log(err));
          });
        });
      }
    })
    .catch((err) => console.log(err));
});

//@type POST
//@route /api/auth/login
//@desc route for login
//@access PUBLIC

router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  Person.findOne({ email })
    .then((person) => {
      if (!person) {
        return res
          .status(404)
          .json({ emailerror: "User not found with this email" });
      }
      bcrypt
        .compare(password, person.password)
        .then((isCorrect) => {
          if (isCorrect) {
            // res.json({ success: "user is able to login" });
            //Use payload and create tocken for user
            const payload = {
              id: person.id,
              name: person.name,
              email: person.email,
            };
            jsonwt.sign(
              payload,
              key.secret,
              { expiresIn: 3600 },
              (err, tocken) => {
                res.json({
                  success: true,
                  tocken: "Bearer " + tocken,
                });
              }
            );
          } else {
            res.status(400).json({ passworderror: "password is not correct" });
          }
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

//@type GET
//@route /api/auth/profile
//@desc route for user profile
//@access PRIVATE

router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      profilepic: req.user.profilepic
    })
  }
);



module.exports = router;
