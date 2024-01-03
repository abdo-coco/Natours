const express = require("express");
const router = express.Router();
const userController = require("./controller/userController");
const authController = require("./controller/authController");

//router.param("id", userController.checkID);

router.post("/login", authController.login);
router.route("/signup").post(authController.signup);
router.get("/logout", authController.logout);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);
router.use(authController.protect);
router.patch(
  "/updateMyPassword",
  authController.protect,
  authController.updatePassword
);

router.get(
  "/Me",

  userController.getMe,
  userController.getUser
);
router.patch(
  "/updateMe",
  userController.uploadUserImage,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.delete("/deleteMe", userController.deleteMe);
router.use(authController.restrictTo("admin"));
router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

module.exports = router;
