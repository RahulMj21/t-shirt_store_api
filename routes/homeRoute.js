const express = require("express");
const router = express.Router();
const { homeController } = require("../controllers");

router
  .route("/")
  .get((req, res) => res.send("<h1>Welcome to our t-shirtstore</h1>"));

router.route("/api/v1").get(homeController.home);

module.exports = router;
