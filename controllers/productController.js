const { BigPromise, customErrorHandler, WhereClause } = require("../utils");
const { Product } = require("../models");
const cloudinary = require("cloudinary");

class ProductController {
  createProduct = BigPromise(async (req, res, next) => {
    if (!req.body)
      return next(new customErrorHandler("all fields are required", 400));
    const images = req.files.images ? req.files.images : req.body.images;
    if (!images)
      return next(new customErrorHandler("please provide product images", 400));

    const productImages = [];

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(
        typeof images[i] === "object" ? images[i].tempFilePath : images[i],
        {
          folder: `/tshirtstore/products/${req.body.name}`,
        }
      );
      productImages.push({
        public_id: result.public_id,
        secure_url: result.secure_url,
      });
    }

    if (productImages.length) {
      req.body.images = productImages;
      req.body.user = req.user._id;

      const product = await Product.create(req.body);

      res.status(201).json({
        success: true,
        product,
      });
    }
  });

  getProducts = BigPromise(async (req, res, next) => {
    const resultPerPage = 6;
    const whereClause = new WhereClause(Product.find(), req.query)
      .search()
      .filter();

    let products = await whereClause.base;

    const productCount = products.length;

    whereClause.pagination(resultPerPage);

    products = await whereClause.base.clone();

    res.status(200).json({ success: true, products, productCount });
  });

  getSingleProduct = BigPromise(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new customErrorHandler("product not found", 404));
    res.status(200).json({ success: true, product });
  });

  getAdminProducts = BigPromise(async (req, res, next) => {
    const products = await Product.find();
    res.status(200).json({ success: true, products });
  });

  updateProduct = BigPromise(async (req, res, next) => {
    let product = await Product.findById(req.params.id);
    if (!product) return next(new customErrorHandler("product not found", 404));

    const images = req.files.images
      ? req.files.images
      : req.body.images
      ? req.body.images
      : null;

    if (images) {
      for (let i = 0; i < product.images.length; i++) {
        await cloudinary.v2.uploader.destroy(product.images[i].public_id);
      }
      const imagesArray = [];
      for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(
          typeof images[i] === "object" ? images[i].tempFilePath : images[i],
          {
            folder: `/tshirtstore/products/${req.body.name}`,
          }
        );
        imagesArray.push({
          public_id: result.public_id,
          secure_url: result.secure_url,
        });
      }
      req.body.images = imagesArray;
    }
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      success: true,
      product,
    });
  });

  deleteProduct = BigPromise(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return next(new customErrorHandler("product not found", 400));

    for (let i; (i = product.images.length); i++) {
      await cloudinary.v2.uploader.destroy(images[i].public_id);
    }
    res.status(200).json({ success: true, message: "product deleted" });
  });

  writeAReview = BigPromise(async (req, res, next) => {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return next(new customErrorHandler("product not found", 404));

    const isReviewed =
      product.reviews.length &&
      product.reviews.find(
        (review) => toString(review.user) === toString(req.user._id)
      );
    console.log(isReviewed);
    if (isReviewed) {
      product.reviews.forEach((review) => {
        if (toString(review.user) === toString(req.user._id)) {
          review.rating = rating;
          review.comment = comment;
        }
      });
    } else {
      product.reviews.push({
        user: req.user._id,
        name: req.user.name,
        rating,
        comment,
      });
      product.numOfReveiws = product.reviews.length;
    }
    product.rating =
      product.reviews.reduce((accum, review) => review.rating + accum) /
      product.reviews.length;
    product.save({ validateBeforeSave: false });

    res
      .status(200)
      .json({ success: true, message: "review added successfully", product });
  });

  getAllReviews = BigPromise(async (req, res, next) => {
    const product = await Product.findById(req.parmas.id);
    if (!product) return next(new customErrorHandler("product not found", 404));
    if (!product.reviews.length)
      return next(new customErrorHandler("product is not reviewed yet", 404));

    res.status(200).json({
      success: true,
      reviews: product.reviews,
    });
  });

  deleteReview = BigPromise(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new customErrorHandler("product not found", 404));
    const reviews = product.reviews.filter(
      (review) => toString(review.user) !== toString(req.user._id)
    );
    product.reviews = reviews;
    product.numOfReveiws = reviews.length;
    product.rating =
      reviews.reduce((accum, review) => review.rating + accum) / reviews.length;
    product.save({ validateBeforeSave: false });
  });
}

module.exports = new ProductController();
