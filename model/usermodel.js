const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    trim: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please enter correct email"],
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
  role: {
    type: String,
    default: "user",
    enum: {
      values: ["admin", "user", "guide", "lead-guide"],
      message: "role must be : admin or user or guide or lead guide",
    },
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minlength: [8, "Password must be at least 8 characters"],
    select: false,
  },
  passwordConfirm: {
    type: String,
    //required: [true, "Please enter correct password"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords must be a same ",
    },
  },
  passwordChangeAt: Date,
  passwordResetToken: String,
  passwordResetExpire: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre("find", function (next) {
  this.find({ active: { $ne: false } });
  next();
});
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangeAT = Date.now() - 1000;
  next();
});
userSchema.pre("save", async function (next) {
  // console.log(":testing");
  if (!this.isModified("password")) return next();

  try {
    this.password = await bcrypt.hash(this.password, 10);
    this.passwordConfirm = undefined;
  } catch (error) {
    console.error("Error hashing password:", error);
    return next(error);
  }

  next(); // Call next to continue the save operation
});
userSchema.methods.correctConfirm = function (passordCandidate, userPassword) {
  return bcrypt.compare(passordCandidate, userPassword);
};

userSchema.methods.passwordChangeAT = function (JWTtimeStamp) {
  if (this.passwordChangeAt) {
    const changedTimestamp = parseInt(
      this.passwordChangeAt.getTime() / 1000,
      10
    );
    return JWTtimeStamp < changedTimestamp;
  }
};

userSchema.methods.createPasswordResetToken = function () {
  const restToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(restToken)
    .digest("hex");
  this.passwordResetExpire = Date.now() + 10 * 60 * 1000;
  console.log({ restToken }, this.passwordResetToken);
  return restToken;
};
const User = mongoose.model("User", userSchema);

module.exports = User;
