const express = require("express");
const { body, validationResult } = require("express-validator");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const router = express.Router();
const User = require("../../models/User");

// @route    POST api/user/
// @desc     create user
// @access   public

router.post(
  "/",
  [
    body("name", "Name is required").not().isEmpty(),
    body("email", "Please enter a valid email").isEmail(),
    body(
      "password",
      "Please enter a password with minimum 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, name, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Email already exist" }] });
      }
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });
      user = new User({
        name,
        email,
        password,
        avatar,
      });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      const newUser = await user.save();
      console.log(newUser);
      const payload = { user: { id: newUser.id } };
      jwt.sign(
        payload,
        config.get("jwtsecret"),
        { expiresIn: 3600000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (e) {
      console.log(e, "error");
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
