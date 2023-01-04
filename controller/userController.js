const mongoose = require("mongoose");
const User = require("../model/userSignup");
const mailer = require("../config/otp");
const Product = require("../model/product");
const Carts = require("../model/carts");
const Address = require('../model/address')
const Wishlist = require('../model/wishlist')
const dotenv = require("dotenv");

dotenv.config();

let count;
let wishCount
module.exports = {
    getHome: async (req, res) => {
        try {
            let userSession = req.session.userEmail;
            if (userSession) {
                const userData = await User.findOne({ email: userSession });
                const cartData = await Carts.find({ userId: userData._id });
                const wishlistData = await Wishlist.find({ userId: userData._id });

                if (cartData) {
                    count = cartData[0].product.length;
                } else {
                    count = 0;
                }
                if (wishlistData.length) {
                    wishCount = wishlistData[0].product.length;
                  } else {
                    wishCount = 0;
                  }
            }

            const product = await Product.find({ status: true }, (err, product) => {
                if (err) {
                    console.log(err);
                } else {
                    res.render("user/index", {
                        data: product,
                        sessionData: req.session.userEmail,
                        count,wishCount
                    });
                }
            });
        } catch (error) {
            console.log(error);
        }
    },
    getLogin: (req, res) => {
        res.render("user/login");
    },
    getSignUp: (req, res) => {
        res.render("user/signup");
    },
    postLogin: async (req, res) => {
        try {
            let email = req.body.email;
            let password = req.body.password;
            const userDetails = await User.findOne({ email: email });
            if (userDetails) {
                const blocked = userDetails.isBlocked;
                if (blocked === false) {
                    if (userDetails.password === password) {
                        req.session.userEmail = req.body.email;
                        console.log("session created");
                        res.redirect("/");
                    } else {
                        res.render("user/login", {
                            message: "Invalid login details",
                        });
                    }
                } else {
                    res.render("user/login", {
                        message: "You are blocked by the admin",
                    });
                }
            } else {
                res.render("user/login", { message: "Invalid login details" });
            }
        } catch (error) {
            res.status(400).send(error);
            console.log("error");
        }
    },
    postSignup: async (req, res) => {
        try {
            req.session.userData = req.body;
            const email = req.body.email;
            const user = await User.findOne({ email: email });
            if (email === user.email) {
                res.render("user/signup", {
                    wrong: "Email id is already registered",
                });
            }
        } catch (error) {
            let mailDetails = {
                from: "alanjosephclt@gmail.com",
                to: req.body.email,
                subject: "User Verification",
                html: `<p>Your OTP for registration is ${mailer.OTP}</p>`,
            };
            mailer.mailTransporter.sendMail(mailDetails, (err, data) => {
                console.log(data);
                if (err) {
                    console.log(err);
                } else {
                    res.render("user/otp");
                    console.log("otp mailed");
                }
            });
        }
    },
    otpVerification: async (req, res) => {
        try {
            if (req.body.otp == mailer.OTP) {
                const user1 = new User(req.session.userData);
                user1.save();
                req.session.destroy();
                res.redirect("/login");
            } else {
                res.render("user/otp", {
                    wrong: "You have entered the wrong otp",
                });
            }
        } catch (err) {
            console.log(err);
        }
    },
    getLogout: async (req, res) => {
        req.session.destroy();
        console.log(req.session);
        res.redirect("/login");
    },
    getUserProfile: async (req, res) => {
        try {
            await User.findOne({ email: req.session.userEmail }).then((userData) => {
                Address.find({ user_id: req.session.userEmail }).then((address) => {
                    res.render("user/userProfile", { data: userData, sessionData: req.session.userEmail, count, address,wishCount })
                })
            });
        } catch (error) {
            console.log(error);

        }
    },
    getAddAddress: (req, res) => {
        try {
            const sessionData = req.session.userEmail
            res.render('user/addAddress', { sessionData, count ,wishCount})
        } catch (error) {
            console.log(error);
        }
    },
    postAddAddress: async (req, res) => {
        const uid = req.session.userEmail;
        const addressDetails = await new Address({
            user_id: uid,
            address: req.body.address,
            city: req.body.city,
            district: req.body.district,
            state: req.body.state,
            pincode: req.body.pincode,
        });
        await addressDetails.save().then((results) => {
            if (results) {
                res.redirect('/checkout');
            } else {
                res.json({ status: false });
            }
        });
    },
    changePassword: (req, res) => {
        try {
            const sessionData = req.session.userEmail

            res.render('user/changePassword', { sessionData, count ,wishCount})
        } catch (error) {
            console.log(error);
        }

    },
    postChangePassword: async (req, res) => {
        try {
            const sessionData = req.session.userEmail;
            const data = req.body;
            const password = data.password
            const newPassword = data.newPassword
            const repeatPassword = data.repeatPassword
            const userData = await User.findOne({ email: sessionData })    
            console.log(`this is user data ${userData}`);
            if (userData) {
                if (userData.password === password) {
                    console.log(userData.password, password);
                    if (newPassword === repeatPassword) {
                        await User.updateOne({ email: sessionData }, { $set: { password: password } }).then(() => {
                            // req.session.destroy();
                            res.redirect('/login')
                        }).catch((err) => {
                            console.log(err);
                        })
                    } else {
                        res.render('user/changePassword', { err_message: 'new password and repeat password are not matching', sessionData, count ,wishCount})
                    }
                } else {
                    res.render('user/changePassword', { err_message: 'current password are not matching', sessionData, count ,wishCount})
                }
            } else {
                console.log('error');
            }

        } catch {
            console.error();

        }
    },

    getProductDetails: async (req, res) => {
        try {
            const id = req.query.id;
            const product = await Product.findById({ _id: id });

            if (product) {
                res.render("user/productView", {
                    product,
                    sessionData: req.session.userEmail,
                    count,wishCount
                });
            } else {
                res.redirect("/user/index");
            }
        } catch (error) {
            console.log(error.message);
        }
    },
    getCart: async (req, res) => {
        try {
            const userId = req.session.userEmail;
            const userData = await User.findOne({ email: userId });
            const cart = await Carts.aggregate([
                {
                    $match: { userId: userData._id },
                },
                {
                    $unwind: "$product",
                },
                {
                    $project: {
                        productItem: "$product.productId",
                        productQuantity: "$product.quantity",
                    },
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "productItem",
                        foreignField: "_id",
                        as: "productDetail",
                    },
                },
                {
                    $project: {
                        productItem: 1,
                        productQuantity: 1,
                        productDetail: { $arrayElemAt: ["$productDetail", 0] },
                    },
                },
                {
                    $addFields: {
                        productPrice: {
                            $sum: { $multiply: ['$productQuantity', '$productDetail.price'] },
                        },
                    },
                },
            ]);

            const sum = cart.reduce((accumulator, object) => accumulator + object.productPrice, 0);

            res.render("user/cart", { cart, userData, sessionData: req.session.userEmail, count, sum,wishCount });
        } catch (error) {
            console.log(error.message);
        }
    },
    addToCart: async (req, res) => {
        const id = req.params.id;
        const userId = req.session.userEmail;
        const data = await Product.findOne({ _id: id });
        const userData = await User.findOne({ email: userId });
        const objId = mongoose.Types.ObjectId(id);
        const idUser = mongoose.Types.ObjectId(userData._id);

        let proObj = {
            productId: objId,
            quantity: 1,
        };
        if (data.quantity >= 1) {
            const userCart = await Carts.findOne({ userId: userData._id });
            if (userCart) {
                let proExist = userCart.product.findIndex((product) => {
                    product.productId == id;
                });
                if (proExist != -1) {
                    res.json({ productExist: true });
                } else {
                    Carts.updateOne(
                        { userId: userData._id },
                        { $push: { product: proObj } }
                    ).then(() => {
                        res.json({ status: true });
                    });
                    // res.redirect(`/productDetails?id=${id}`);
                }
            } else {
                const newCart = new Carts({
                    userId: userData._id,
                    product: [
                        {
                            productId: objId,
                            quantity: 1,
                        },
                    ],
                });
                newCart.save().then(() => {
                    res.json({ status: true });
                    // res.redirect("/productDetails");
                });
            }
        } else {
            console.log("2");
            res.json({ stock: true });
        }
    },
    getWishlist: async (req, res) => {
        try {
            const sessionData = req.session.userEmail
            const userData = await User.findOne({ email: sessionData });
            const userId = mongoose.Types.ObjectId(userData._id);
            const cartData = await Carts.findOne({ userId: userData.id });
            const wishlistDetails = await Wishlist.findOne({ userId: userData._id });
            wishCount = wishlistDetails?.product?.length;
            if (wishlistDetails == null) {
                wishCount = 0;
            }
            const wishlistData = await Wishlist.aggregate([
                {
                  $match: { userId: userId },
                },
                {
                  $unwind: "$product",
                },
                {
                  $project: {
                    productItem: "$product.productId",
                  },
                },
                {
                  $lookup: {
                    from: "products",
                    localField: "productItem",
                    foreignField: "_id",
                    as: "productDetail",
                  },
                },
                {
                  $project: {
                    productItem: 1,
                    productDetail: { $arrayElemAt: ["$productDetail", 0] },
                  },
                },
              ]);
              res.render("user/wishlist", { sessionData, count, wishlistData, wishCount });
        } catch (error) {
            console.log(error);
        }
    },
    addToWishlist: async (req, res) => {
        try {
            const sessionData = req.session.userEmail
            const id = req.params.id
            const objId = mongoose.Types.ObjectId(id);
            let proObj = {
                productId: objId,
            };

            const userData = await User.findOne({ email: sessionData });
            const userId = mongoose.Types.ObjectId(userData._id);
            const userWishlist = await Wishlist.findOne({ userId: userId });
            const verify = await Carts.findOne(
                { userId: userId },
                { product: { $elemMatch: { productId: objId } } }
            );
            if (userWishlist) {
                let proExist = userWishlist.product.findIndex(
                    (product) => product.productId == id
                );
                if (proExist != -1) {
                    res.json({ productExist: true });
                } else {
                    Wishlist
                        .updateOne({ userId: userId }, { $push: { product: proObj } })
                        .then(() => {
                            res.json({ status: true });
                        });
                }
            } else {
                Wishlist
                    .create({
                        userId: userId,
                        product: [
                            {
                                productId: objId,
                            },
                        ],
                    })
                    .then(() => {
                        res.json({ status: true });
                    });
            }


        } catch (error) {
            console.log(error);
        }
    },
    removewishlistProduct:async (req, res) =>{
        try {
            const data = req.body;
            const objId = mongoose.Types.ObjectId(data.productId);
            await Wishlist.aggregate([
              {
                $unwind: "$product",
              },
            ]);
            await Wishlist
              .updateOne(
                { _id: data.wishlistId, "product.productId": objId },
                { $pull: { product: { productId: objId } } }
              )
              .then(() => {
                res.json({ status: true });
              });
          } catch {
            console.error();
           
          }
    },
    removeProduct: async (req, res) => {
        console.log("api called");
        const data = req.body;
        const objId = mongoose.Types.ObjectId(data.product);
        await Carts.aggregate([
            {
                $unwind: "$product",
            },
        ]);
        await Carts.updateOne(
            { _id: data.cart, "product.productId": objId },
            { $pull: { product: { productId: objId } } }
        ).then(() => {
            res.json({ status: true });
        });
    },
    changeQuantity: async (req, res, next) => {
        console.log('api called');
        const data = req.body
        console.log(data);
        data.count = Number(data.count)
        data.quantity = Number(data.quantity)
        const objId = mongoose.Types.ObjectId(data.product)
        const productDetail = await Product.findOne({ _id: data.product })
        console.log(objId);
        console.log(productDetail);
        if ((data.count == -1 && data.quantity == 1)) {
            res.json({ quantity: true })
        } else if ((data.count == 1 && data.quantity == productDetail.quantity)) {
            res.json({ stock: true });
        } else {
            await Carts
                .aggregate([
                    {
                        $unwind: '$product',
                    },
                ])
                .then(() => {
                    Carts
                        .updateOne(
                            { _id: data.cart, 'product.productId': objId },
                            { $inc: { 'product.$.quantity': data.count } },
                        )
                        .then(() => {
                            res.json({ status: true });
                            next();
                        });
                });
        }
    },
    getCheckout: async (req, res) => {
        try {
            const userId = req.session.userEmail;
            const userData = await User.findOne({ email: userId });
            const cart = await Carts.aggregate([
                {
                    $match: { userId: userData._id },
                },
                {
                    $unwind: "$product",
                },
                {
                    $project: {
                        productItem: "$product.productId",
                        productQuantity: "$product.quantity",
                    },
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "productItem",
                        foreignField: "_id",
                        as: "productDetail",
                    },
                },
                {
                    $project: {
                        productItem: 1,
                        productQuantity: 1,
                        productDetail: { $arrayElemAt: ["$productDetail", 0] },
                    },
                },
                {
                    $addFields: {
                        productPrice: {
                            $sum: { $multiply: ['$productQuantity', '$productDetail.price'] },
                        },
                    },
                },
            ]);
            const sum = cart.reduce((accumulator, object) => accumulator + object.productPrice, 0);
            Address.find({ user_id: userId }).then((address) => {
                res.render('user/checkout', { cart,wishCount, sessionData: req.session.userEmail, count, sum, address });
            })
        } catch (error) {
            console.log(error);
        }


    }
};
