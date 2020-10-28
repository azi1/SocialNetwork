const express = require("express");
const auth = require("../../config/middleware/auth");
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const config = require("config");
const jwt = require("jsonwebtoken");
const router = express.Router();

// @route    GET api/auth/
// @desc     get user
// @access   private

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (e) {
    console.log(e);
    res.status(500).json("Server error");
  }
});

// @route    POST api/auth/
// @desc     login user
// @access   public

router.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch, user, "isMatch");

    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });
    }
    const payload = { user: { id: user.id } };
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
    console.log(e);
    res.status(500).json("Server error");
  }
});

module.exports = router;
