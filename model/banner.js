const mongoose = require('mongoose');

const { Schema } = mongoose;
const BannerSchema = new Schema(
  {
    image: String,
    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Banners = mongoose.model('banner', BannerSchema);
module.exports = Banners;
