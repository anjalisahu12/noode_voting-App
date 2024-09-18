const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

//define person schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },

  mobile: {
    type: String,
  },
  email: {
    type: String,
  },
  aadharCardNumber: {
    type: String,
    required: true,
    unique: true,
  },
  address: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["voter", "admin"],
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  isVoted: {
    type: Boolean,
    default: false,
  },
});

userSchema.pre("save", async function (next) {
  const user = this;

  //hash the password only if it has been modified(or is new)
  if (!user.isModified("password")) return next();
  try {
    //hash password generation
    const salt = await bcrypt.genSalt(10);

    //hash password
    const hashedPassword = await bcrypt.hash(user.password, salt);

    // overrride the plain password with the hashed one
    user.password = hashedPassword;
    next();
  } catch (err) {
    return next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    //use bcrypt to compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
  } catch (err) {
    throw err;
  }
};
//create user model
const User = mongoose.model("user", userSchema);
module.exports = User;
