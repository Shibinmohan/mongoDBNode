const express = require("express");

const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//load person model
const Person = require("../../models/Person");

//load profile model
const Profile = require("../../models/Profile");
//load Question profile model
const Question = require("../../models/Question");

//@type GET
//@route /api/question
//@desc route for showing all questions
//@access PRIVATE
router.get("/", (req, res) => {
  Question.find()
    .sort({ date: "desc" })
    .then((question) => {
      if (!question) {
        res.json({ questionerror: "no questions are available" });
      }
      res.json(question);
    })
    .catch((err) => console.log(err));
});

//@type POST
//@route /api/question/
//@desc route for submitting question
//@access PRIVATE
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const newQuestion = new Question({
      textone: req.body.textone,
      texttwo: req.body.texttwo,
      user: req.user.id,
      name: req.body.name,
    });
    newQuestion
      .save()
      .then((question) => {
        res.json(question);
      })
      .catch((err) => console.log("Unable to push questions " + err));
  }
);
//@type POST
//@route /api/answers/:id
//@desc route for submitting answers to questions
//@access PRIVATE

router.post(
  "/answers/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Question.findById(req.params.id)
      .then((question) => {
        const newAnswer = {
          user: req.user.id,
          name: req.body.name,
          text: req.body.text,
        };
        question.answers.unshift(newAnswer);
        question
          .save()
          .then((question) => res.json(question))
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }
);

//@type POST
//@route /api/question/upvote/:id
//@desc route for submitting answers to questions
//@access PRIVATE

router.post(
  "/upvote/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        Question.findById(req.params.id)
          .then((question) => {
            if (
              question.upvotes.filter(
                (upvotes) => upvotes.user.toString() === req.user.id.toString()
              ).length > 0
            ) {
              return res.status(400).json({ noupvote: "user already upvotes" });
            }
            question.upvotes.unshift({ user: req.user.id });
            question
              .save()
              .then((question) => res.json(question))
              .catch((err) => console.log(err));
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }
);

module.exports = router;
