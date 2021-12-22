const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const tokenSchema = new Schema(
  {
    userId: String,
    token: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Token", tokenSchema);
