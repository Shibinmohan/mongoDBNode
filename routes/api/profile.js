const express = require("express");

const router = express.Router();

const mongoose = require("mongoose");
const passport = require("passport");
//load person model
const Person = require("../../models/Person");

//load profile model
const Profile = require("../../models/Profile");

//@type GET
//@route /api/profile
//@desc route for personal user profile
//@access PRIVATE
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        if (!profile) {
          return res.status(404).json({ profilenotfound: "No profile found" });
        }
        res.json(profile);
      })
      .catch((err) => console.log("Error in profile " + err));
  }
);

//@type POST
//@route /api/profile
//@desc routeUpdateing for personal user profile
//@access PRIVATE
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const profileValues = {};
    profileValues.user = req.user.id;
    if (req.body.username) profileValues.username = req.body.username;
    if (req.body.website) profileValues.website = req.body.website;
    if (req.body.country) profileValues.country = req.body.country;
    if (req.body.portfolio) profileValues.portfolio = req.body.portfolio;
    if (typeof req.body.languges !== undefined) {
      profileValues.languges = req.body.languges.split(",");
    }
    //get social links
    profileValues.social = {};
    if (req.body.youtube) profileValues.social.youtube = req.body.youtube;
    if (req.body.facebook) profileValues.social.facebook = req.body.facebook;
    if (req.body.instagram) profileValues.social.instagram = req.body.instagram;

    //Do database stuff
    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        if (profile) {
          Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileValues },
            { new: true }
          )
            .then((profile) => res.json(profile))
            .catch((err) => console.log("Problem in update " + err));
        } else {
          Profile.findOne({ username: profileValues.username })
            .then((profile) => {
              if (profile) {
                res.status(400).json({ username: "username already exisis" });
              }
              //save user
              new Profile(profileValues)
                .save()
                .then((profile) => res.json(profile))
                .catch((err) => console.log(err));
            })
            .catch((err) => console.log(err));
        }
      })
      .catch((err) => {
        console.log("Problem in fetching profile " + err);
      });
  }
);

//@type GET
//@route /api/profile/:username
//@desc route for getting personal user profile by username
//@access PUBLIC

router.get("/:username", (req, res) => {
  Profile.findOne({ username: req.params.username })
    .populate("user", ["name", "profilepic"])
    .then((profile) => {
      if (!profile) {
        res.status(404).json({ usernotfound: "user not found" });
      }
      res.json(profile);
    })
    .catch((err) => console.log("Error in fetching username " + err));
});
//@type GET
//@route /api/profile/find/everyone
//@desc route for getting profile of every one
//@access PUBLIC
router.get("/find/everyone", (req, res) => {
  Profile.find()
    .populate("user", ["name", "profilepic"])
    .then((profiles) => {
      if (!profiles) {
        res.status(404).json({ profilenotfound: "No profile was found" });
      }
      res.json(profiles);
    })
    .catch((err) => console.log("Error in fetching username " + err));
});

//@type DELETE
//@route /api/profile/
//@desc route for deleting user by id
//@access PRIVATE

router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id });
    Profile.findOneAndRemove({ user: req.user.id })
      .then(() => {
        Person.findOneAndRemove({ _id: req.user.id })
          .then(() => res.json({ success: "Delete was success" }))
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }
);

//@type POST
//@route /api/profile/workrole
//@desc route for adding work profile of a person
//@access PRIVATE

router.post(
  "/workrole",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        const newWork = {
          role: req.body.role,
          company: req.body.company,
          from: req.body.from,
          to: req.body.to,
          current: req.body.current,
          details: req.body.details,
        };
        profile.workrole.unshift(newWork);
        profile
          .save()
          .then((profile) => res.json(profile))
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }
);

//@type DELETE
//@route /api/profile/workrole/:w_id
//@desc route for deleting work role
//@access PRIVATE
router.delete(
  "/workrole/:w_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        const removethis = profile.workrole
          .map((item) => item.id)
          .indexOf(req.params.w_id);

        profile.workrole.splice(removethis,1);
        profile
          .save()
          .then(profile => res.json(profile))
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }
);

module.exports = router;
