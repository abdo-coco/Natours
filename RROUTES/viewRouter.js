const express = require("express");
const router = express.Router();
const viewController = require("./../RROUTES/controller/viewController");
const authController = require("./../RROUTES/controller/authController");
const bookingController = require("./../RROUTES/controller/bookingController");
router.get("/me", authController.protect, viewController.getAccount);
router.get("/my-tours", authController.protect, viewController.getMyTours);
router.get(
  "/",
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewController.getOverview
);
router.get("/tour/:slug", authController.isLoggedIn, viewController.getTour);
router.get("/login", authController.isLoggedIn, viewController.getLoginForm);
router.get("/signup", viewController.getSignupForm);

module.exports = router;
