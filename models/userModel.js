const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      minlength: [3, "Your name must contain atleast 3 characters"],
      maxlength: [40, "Your name cannot exceed 40 characters"],
      required: [true, "Please Enter your name"],
    },
    password: {
      type: String,
      minlength: [6, "Your password must contain atleast 6 characters"],
      maxlength: [40, "Your password cannot exceed 40 characters"],
      required: [true, "Please Enter a password"],
    },
    email: {
      type: String,
      validate: [validator.isEmail, "Please Enter a valid E-mail"],
      unique: [true, "email already taken"],
      required: true,
    },
    role: {
      type: String,
      default: "user",
    },
    avatar: {
      public_id: {
        type: String,
      },
      secure_url: {
        type: String,
      },
    },
    token: {
      type: String,
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Number,
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};

userSchema.methods.getForgotPasswordToken = function () {
  const forgotToken = crypto.randomBytes(20).toString("hex");
  const expiry = Date.now() + 1000 * 60 * 15;

  this.forgotPasswordToken = crypto
    .createHmac("sha256", process.env.FORGOT_TOKEN_SECRET)
    .update(forgotToken)
    .digest("hex");

  this.forgotPasswordExpiry = expiry;

  return forgotToken;
  // when data comes from user we should validate 'hash(forgotToken + expiry)'
};

module.exports = mongoose.model("User", userSchema);
