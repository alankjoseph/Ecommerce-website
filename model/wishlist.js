const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const wishlistSchema = new Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
    },
    product: [
      {
        productId: {
          type: ObjectId,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Wishlist = mongoose.model("wishlist", wishlistSchema);
module.exports = Wishlist;
