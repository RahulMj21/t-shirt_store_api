const { BigPromise } = require("../utils");
const stripe = require("stripe")(process.env.STRIPE_API_SECRET);

class PaymentController {
  sendStripeApiKey = BigPromise(async (req, res, next) => {
    res.status(200).json({ key: process.env.STRIPE_API_KEY });
  });

  captureStripeSignature = BigPromise(async (req, res, next) => {
    const payment = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: "inr",
      metadata: { integration_check: "accept_a_payment" },
    });
    res.status(200).json({
      success: true,
      amount: req.body.amount,
      client_secret: payment.client_secret,
    });
  });

  sendRazorpayApiKey = BigPromise(async (req, res, next) => {
    res.status(200).json({ key: process.env.RAZORPAY_API_KEY });
  });

  captureRazorpaySignature = BigPromise(async (req, res, next) => {
    var instance = new Razorpay({
      key_id: process.env.RAZORPAY_API_KEY,
      key_secret: process.env.RAZORPAY_API_SECRET,
    });

    var options = {
      amount: req.body.amount, // amount in the smallest currency unit
      currency: "INR",
    };
    const myOrder = instance.orders.create(options);
    res.status(200).json({
      success: true,
      amount: req.body.amount,
      order: myOrder,
    });
  });
}

module.exports = new PaymentController();
