const express = require("express");
const router = express.Router();
const User = require("./../models/user");
const { jwtAuthMiddleware, generateToken } = require("./../jwt");

router.post("/signup", async (req, res) => {
  try {
    const data = req.body;
    const newUser = new User(data);
    const response = await newUser.save();
    console.log("response", response);
    console.log("data saved successfully");

    const payload = {
      id: response.id,
    };

    console.log(JSON.stringify(payload));
    const token = generateToken(payload);
    console.log("Token is:", token);
    res.status(200).json({ response: response, token: token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    //extract usename and password from the request body
    const { aadharCardNumber, password } = req.body;

    //find the user by username
    const user = await User.findOne({ aadharCardNumber: aadharCardNumber });

    //if user does not exist or password not match, return error
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid username and password" });
    }
    //generate Token
    const payload = {
      id: response.id,
    };

    // console.log(JSON.stringify(payload));
    const token = generateToken(payload);

    //return token as response
    res.json(token);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
});

router.get("/profile", jwtAuthMiddleware, async (req, res) => {
  try {
    const userData = req.user;
    const userId = userData.id;
    const user = await User.findById(userId);
    res.status(200).json({ user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
});

router.put("/profile/password", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user; //Extract the id from the tooken
    const { currentPassword, newPassword } = req.body; //Extract current and new password from the request body

    //find the user by userId
    const user = await User.findById(userId);

    //if  password not match, return error
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ error: "Invalid username and password" });
    }

    //update the User Password
    user.password = newPassword;
    await user.save();
    console.log("password updated");
    res.status(200).json({ message: "password updated" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "interval server error" });
  }
});

module.exports = router;
