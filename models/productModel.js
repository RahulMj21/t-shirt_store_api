const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      minlength: [3, "product name should be atleast 3 character long"],
      maxlength: [120, "product name should be atleast 3 character long"],
      required: [true, "please provide product name"],
    },
    description: {
      type: String,
      required: [true, "please provide product description"],
    },
    images: [
      {
        public_id: {
          type: String,
          required: true,
        },
        secure_url: {
          type: String,
          required: true,
        },
      },
    ],
    category: {
      type: String,
      required: [
        true,
        "please select category between 'shortsleeves, longsleeves, sweatshirt, hoodies'",
      ],
      enum: {
        values: ["shortsleeves", "longsleeves", "sweatshirt", "hoodies"],
        message:
          "please select category ONLY from - shortsleeves, longsleeves, sweatshirts and hoodies",
      },
    },
    price: {
      type: Number,
      maxlength: [6, "please enter a valid price for this product"],
      required: [true, "please provide product price"],
    },
    brand: {
      type: String,
      required: [true, "please provide product brand"],
    },
    stock: {
      type: Number,
      default: 1,
    },
    rating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        user: Schema.Types.ObjectId,
        name: String,
        rating: Number,
        comment: String,
      },
    ],
    user: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
