const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET = "mysecretkey";

// ================= REGISTER =================
router.post("/register", async (req, res) => {
  const { empId, name, email, password } = req.body;

  try {
    let user = await User.findOne({ empId });
    if (user) return res.status(400).json({ msg: "User exists" });

    const hashed = await bcrypt.hash(password, 10);

    user = new User({ empId, name, email, password: hashed });
    await user.save();

    res.json({ msg: "Registered successfully" });
  } catch {
    res.status(500).send("Server error");
  }
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  const { empId, password } = req.body;

  try {
    const user = await User.findOne({ empId });
    if (!user) return res.status(400).json({ msg: "Invalid user" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Wrong password" });

    const token = jwt.sign({ id: user._id }, SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch {
    res.status(500).send("Server error");
  }
});

module.exports = router;