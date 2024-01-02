const AppError = require("../../utils/AppError");

const handelCastError = (err) => {
  const message = `invalid ${err.path}: ${err.value}`;
  //console.log("sdffkdshfkjdshgf");
  return new AppError(message, 400);
};

const handelDuplicateError = (err) => {
  const value = err.keyValue["name"];

  const message = `Duplicate field value : ${value}. please enter another value`;
  return new AppError(message, 400);
};

const handelValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data : ${errors.join(". ")}`;

  return new AppError(message, 400);
};
const handelJWTtokenError = (err) =>
  new AppError("Invalid Token. please login again", 401);
const handleTokenExpiredError = (err) =>
  new AppError("Your Token has expired. please login again", 401);

const sentErrorPro = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    if (err.isOperationalError) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    console.error("Error: ", err);
    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
  if (err.isOperationalError) {
    return res.status(err.statusCode).render("error", {
      title: "Something went wrong",
      msg: err.message,
    });
  }
  return res.status(err.statusCode).render("error", {
    title: "Something went wrong",
    msg: "Please try again later",
  });
};
const sentErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    res.status(err.statusCode).render("error", {
      title: "Something went wrong",
      msg: err.message,
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // res.status(err.statusCode).json({
  //   status: err.status,
  //   message: err.message,
  // });

  if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    console.log(err);
    if (error.name === "TokenExpiredError")
      error = handleTokenExpiredError(error);
    if (error.name === "JsonWebTokenError") error = handelJWTtokenError(error);
    if (error._message === "Validation failed")
      error = handelValidationError(error);

    if (error.statusCode === 500 && error.path) error = handelCastError(error);
    if (error.code === 11000) error = handelDuplicateError(error);

    sentErrorPro(err, req, res);
  } else if (process.env.NODE_ENV === "development") {
    sentErrorDev(err, req, res);
  }

  //next();
};
