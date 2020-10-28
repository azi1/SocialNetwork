const express = require("express");
const auth = require("../../config/middleware/auth");
const { body, validationResult } = require("express-validator");
const User = require("../../models/User");
const Profile = require("../../models/Profile");

const router = express.Router();

// @route    GET api/profile/me
// @desc     Get current users profile
// @access   Private

router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);
    if (!profile) {
      return res
        .status(400)
        .json({ errors: [{ msg: "There is no profile for this user" }] });
    }
    res.json({ profile });
  } catch (e) {
    res.status(500).json("Server Error");
  }
});

// @route    POST api/profile/
// @desc     create or update profile
// @access   Private

router.post(
  "/",
  [
    auth,
    body("status", "status is required").not().isEmpty(),
    body("skills", "skills are required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      company,
      location,
      website,
      bio,
      skills,
      status,
      githubusername,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
    } = req.body;

    const projectFields = {};
    projectFields.user = req.user.id;
    if (company) projectFields.company = company;
    if (location) projectFields.location = location;
    if (website) projectFields.website = website;
    if (status) projectFields.status = status;
    if (bio) projectFields.bio = bio;
    if (githubusername) projectFields.githubusername = githubusername;
    if (skills) {
      projectFields.skills = skills.split(",").map((skill) => skill.trim());
    }
    console.log(projectFields.skills, " projectFields.skills ");

    projectFields.social = {};

    if (instagram) projectFields.social.instagram = instagram;
    if (twitter) projectFields.social.twitter = twitter;
    if (facebook) projectFields.social.facebook = facebook;
    if (linkedin) projectFields.social.linkedin = linkedin;
    if (youtube) projectFields.social.youtube = youtube;
    try {
      let profile = await Profile.findOne({ user: req.user.id });
      console.log(profile, "profile");
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: projectFields },
          { new: true }
        );
        return res.json(profile);
      }
      // create new profile

      profile = new Profile(projectFields);
      await profile.save();
      res.json(profile);
    } catch (e) {
      res.status(500).json("Server Error");
    }
  }
);

// @route    GET api/profile/
// @desc     get all profiles
// @access   public

router.get("/", async (req, res) => {
  try {
    let profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (e) {
    res.status(500).json("Server Error");
  }
});

// @route    GET api/profile/id
// @desc     get profile by id
// @access   public

router.get("/:user_id", async (req, res) => {
  try {
    let profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);

    if (!profile) return res.status(400).json({ msg: "Profile not found" });
    res.json(profile);
  } catch (e) {
    if (e.kind == "ObjectId") {
      return res.status(400).json({ msg: "Profile not found" });
    }
    res.status(500).json("Server Error");
  }
});

// @route    DELETE api/profile/id
// @desc      DELETE user profile
// @access   private

router.delete("/", auth, async (req, res) => {
  try {
    await Profile.findOneAndRemove({ user: req.user.id });
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: "Profile removed succesfully" });
  } catch (e) {
    res.status(500).json("Server Error");
  }
});

// @route    put api/profile/experience
// @desc      add user profile experience
// @access   private

router.put(
  "/experience",
  [
    auth,
    body("title", "title is required").not().isEmpty(),
    body("company", "company is required").not().isEmpty(),
    body("from", "from is required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    let newExp = { title, company, from };
    if (location) newExp.location = location;
    if (to) newExp.to = to;
    if (current) newExp.current = current;
    if (description) newExp.description = description;
    console.log(newExp);
    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (!profile) return res.status(400).json({ msg: "Profile not found" });
      profile.experience.unshift(newExp);
      await profile.save();
      res.json({ profile });
    } catch (e) {
      res.status(500).json("Server Error");
    }
  }
);

// @route    DELETE api/profile/experience
// @desc      DELETE user profile experience
// @access   private

router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id });
    if (!profile) return res.status(400).json({ msg: "Profile not found" });
    let removeIndex = profile.experience
      .map((exp) => exp.id)
      .indexOf(req.params.exp_id);
    profile.experience.splice(removeIndex, 1);
    await profile.save();
    res.json({ profile });
  } catch (e) {
    res.status(500).json("Server Error");
  }
});
module.exports = router;
