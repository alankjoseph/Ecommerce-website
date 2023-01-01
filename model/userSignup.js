const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: {
        type: String,
        // required:true
    },
    lastName: {
        type: String,
        // required: true
    },
    email: {
        type: String,
        // required: true,
        unique: true
    },
    phone: {
        type: String,
        // required: true
    },
    
    password: {
        type: String,
        // required:true
    },
    confirmPassword: {
        type: String,
        // required:true
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    shippingAddress: {
        housename: {
          type: String,
        },
        area: {
          type: String,
        },
        landmark: {
          type: String,
        },
        city: {
          type: String,
        },
        state: {
          type: String,
        },
        pincode: {
          type: String,
        },
      },
});
const User = mongoose.model("userDetails", userSchema);
module.exports = User;