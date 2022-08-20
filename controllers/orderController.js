const { Order, Product } = require("../models");
const { BigPromise, customErrorHandler } = require("../utils");

class OrderController {
  createOrder = BigPromise(async (req, res, next) => {
    const {
      shippingDetails,
      orderItems,
      paymentInfo,
      taxAmount,
      shippingAmount,
      totalAmount,
    } = req.body;
    if (
      !(
        shippingDetails &&
        orderItems &&
        paymentInfo &&
        taxAmount &&
        shippingAmount &&
        totalAmount
      )
    )
      return next(new customErrorHandler("all details are required", 400));

    req.body.user = req.user._id;
    const order = await Order.create(req.body);

    res.status(200).json({
      success: true,
      order,
    });
  });

  myOrders = BigPromise(async (req, res, next) => {
    const orders = await Order.find({ user: req.user._id });
    if (!orders) return next(new customErrorHandler("orders not found", 404));

    res.status(200).json({
      success: true,
      orders,
    });
  });

  getSingleOrder = BigPromise(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    if (!order) return next(new customErrorHandler("order not found", 404));
    if (order.user !== req.user._id)
      return next(
        new customErrorHandler("you are not allowed to this route", 403)
      );

    res.status(200).json({
      success: true,
      order,
    });
  });

  adminAllOrders = BigPromise(async (req, res, next) => {
    const orders = await Order.find().populate("user", "name email");
    if (!orders) return next(new customErrorHandler("orders not found", 404));

    res.status(200).json({
      success: true,
      orders,
    });
  });

  adminGetSingleOrder = BigPromise(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );
    if (!order) return next(new customErrorHandler("order not found", 404));

    res.status(200).json({
      success: true,
      order,
    });
  });

  adminUpdateOrder = BigPromise(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) return next(new customErrorHandler("order not found", 404));

    if (order.orderStatus === "delivered")
      return next(new customErrorHandler("this order already delivered", 400));

    if (order.orderStatus === req.body.orderStatus)
      return next(new customErrorHandler("nothing to change", 400));

    if (
      req.body.orderStatus === "processing" &&
      order.orderStatus === "shipped"
    )
      return next(new customErrorHandler("order already shipped", 400));

    if (req.body.orderStatus === "shipped") {
      order.orderItems.forEach(async (item) => {
        const product = await Product.findById(item.product);
        if (product.stock >= item.quantity) {
          product.stock = product.stock - item.quantity;
          product.save();
        }
      });
    }
    order.orderStatus = req.body.orderStatus;
    order.save();

    res.status(200).json({
      success: true,
      message: "order status updated",
    });
  });

  adminDeleteOrder = BigPromise(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    if (!order) return next(new customErrorHandler("order not found", 404));

    order.remove();

    res.status(200).json({
      success: true,
      message: "order deleted",
    });
  });
}

module.exports = new OrderController();
