const express = require("express");
const morgan = require("morgan");
const tourRouter = require("./RROUTES/tourRouter");
const userRouter = require("./RROUTES/userRouter");
const reviewRouter = require("./RROUTES/reviewRouter");
const bookingRouter = require("./RROUTES/bookingRouter");
const viewRouter = require("./RROUTES/viewRouter");
const app = express();
const AppError = require("./utils/AppError");
const globalErrorHandler = require("./RROUTES/controller/errorController");
const rateLimit = require("express-rate-limit");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const hpp = require("hpp");
const path = require("path");
const cookieParser = require("cookie-parser");
require("dotenv").config({ path: "./config.env" });

app.use(express.static("static"));
app.use(express.static(path.resolve(__dirname, "public")));
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(helmet({ contentSecurityPolicy: false }));
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP. please try again in an hour.",
});

app.use("/api", limiter);
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(xss());
app.use(mongoSanitize());

app.use(
  hpp({
    whitelist: [
      "duration",
      "maxGroupSize",
      "difficulty",
      "price",
      "ratingsAverage",
      "ratingsQuantity",
    ],
  })
);
// app.use((req, res, next) => {
//   console.log(req.cookies);

//   next();
// });
app.use("/", viewRouter);
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/bookings", bookingRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
