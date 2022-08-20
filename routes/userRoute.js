const express = require("express");
const router = express.Router();
const { userController } = require("../controllers");
const { checkAuth, checkUserRole } = require("../middlewares/checkUsers");

router.route("/register").post(userController.register);
router.route("/login").post(userController.login);
router.route("/logout").get(checkAuth, userController.logout);
router.route("/getuserdetails").get(checkAuth, userController.getUserDetails);
router.route("/forgot_password").post(userController.forgotPassword);
router.route("/password/reset/:token").post(userController.resetPassword);
router.route("/password/update").put(checkAuth, userController.updatePassword);
router
  .route("/profile/update")
  .put(checkAuth, userController.updateUserProfile);

// admin
router
  .route("/admin/users")
  .get(checkAuth, checkUserRole("admin"), userController.adminAllUsers);
router
  .route("/admin/user/:id")
  .get(checkAuth, checkUserRole("admin"), userController.adminSingleUsers)
  .put(checkAuth, checkUserRole("admin"), userController.updateUserRole)
  .delete(checkAuth, checkUserRole("admin"), userController.deleteUser);

// manager
router
  .route("/manager/users")
  .get(checkAuth, checkUserRole("manager"), userController.managerAllUsers);

module.exports = router;
