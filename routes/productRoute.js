const express = require("express");
const router = express.Router();
const { productController } = require("../controllers");
const { checkAuth, checkUserRole } = require("../middlewares/checkUsers");

router.route("/products").get(productController.getProducts);

// admin
router
  .route("/admin/products")
  .get(checkAuth, checkUserRole("admin"), productController.getAdminProducts);

router
  .route("/product/create")
  .post(checkAuth, checkUserRole("admin"), productController.createProduct);
router
  .route("/product/delete/:id")
  .post(checkAuth, checkUserRole("admin"), productController.deleteProduct);

module.exports = router;
