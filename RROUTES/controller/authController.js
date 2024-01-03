const User = require("./../../model/usermodel");
const catchAsync = require("./../../RROUTES/controller/catchAsync");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const AppError = require("../../utils/AppError.js");
const Email = require("../../utils/email.js");
const crypto = require("crypto");
const userToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createSendToken = (user, statusCode, req, res) => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  user.password = undefined;
  const token = userToken(user._id);
  res.cookie("jwt", token, cookieOptions);
  res.status(statusCode).json({
    token,
    status: "success",
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  console.log("signup");
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  // Send welcome email in the background
  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please enter a valid email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  const correct = await user.correctConfirm(password, user.password);
  if (!user || !correct) {
    return next(new AppError("Incorrect email or password", 401));
  }

  createSendToken(user, 200, req, res);
});
exports.logout = (req, res) => {
  res.cookie("jwt", "loggout", {
    expires: new Date(Date.now() + 10000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  // console.log(token);
  if (!token) {
    next(
      new AppError("You are not logged in! please login in to get access", 401)
    );
  }
  let decode;
  try {
    decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    //  console.log(decode);
  } catch (err) {
    // Handle the JWT verification error here
    console.error(err);
    next(new AppError("JWT verification failed", 401));
  }
  const currentUser = await User.findById(decode.id);
  // console.log(currentUser);

  if (currentUser === null) {
    return next(
      new AppError(
        "The User belonging to this Token does no longer exist.",
        401
      )
    );
  }
  if (currentUser.passwordChangeAT(decode.iat)) {
    return next(
      new AppError("User Recently change password. please login again", 401)
    );
  }
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      let decode;

      decode = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      if (!decode) {
        return next();
      }

      const currentUser = await User.findById(decode.id);

      if (currentUser === null) {
        return next();
      }

      if (currentUser.passwordChangeAT(decode.iat)) {
        return next();
      }
      res.locals.user = currentUser;

      return next();
    } catch (err) {
      return next();
    }
  }

  next();
});
exports.restrictTo = function (...users) {
  return (req, res, next) => {
    if (!users.includes(req.user.role)) {
      return next(
        new AppError(
          "Sorry. You do not have permission to perform this action",
          403
        )
      );
    }
    next();
  };
};
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // get user based on email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with email address"), 404);
  }
  // create random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validatBeforeSave: false });

  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();
    //console.log(resetURL);
    //    const message = `Forgot your password ? submit a PATCH request with your new password and passwordConfirm to : ${resetURL}./n If you did not forget your password, please ignore this email`;
    // await sendEmail({
    //   email: req.body.email,
    //   subject: "Your password reset token (valid for 10 minutes)",
    //   message,
    // });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save({ validatBeforeSave: false });
    return next(new AppError(err, 500));
  }
  res.status(200).json({
    status: "success",
    message: "Token send to email",
  });
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError("Token is Invalid or has Expired "), 400);
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;
  await user.save();

  createSendToken(user, 201, req, res);
});
exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  // console.log("hhhhhhhh", user);

  if (!(await user.correctConfirm(req.body.currentPassword, user.password))) {
    return next(
      new AppError("Incorrect Password. please write the correct Password", 401)
    );
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  createSendToken(user, 200, req, res);
});
