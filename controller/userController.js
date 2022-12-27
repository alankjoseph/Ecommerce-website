const mongoose = require("mongoose");
const User = require("../model/userSignup");
const mailer = require("../config/otp");
const Product = require("../model/product");
const Carts = require("../model/carts");
const dotenv = require("dotenv");

dotenv.config();

module.exports = {
    getHome: (req, res) => {
        try {
            Product.find({}, (err, product) => {
                if (err) {
                    console.log(err);
                } else {
                    res.render("user/index", {
                        data: product,
                        sessionData: req.session.userEmail,
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
            userData = req.body;
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

        // try {
        //   const password = req.body.password;
        //   const cpassword = req.body.confirmPassword;
        //   if (password === cpassword) {
        //     const user = new User({
        //       firstName: req.body.firstName,
        //       lastName: req.body.lastName,
        //       address: req.body.address,
        //       email: req.body.email,
        //       phone: req.body.phone,
        //       password: password
        //     })
        //     await user.save()

        //     res.status(201).render("user/login");
        //   } else {
        //     res.render("user/index");

        //   }
        // } catch (error) {
        //   res.status(400).send(error);
        // }
    },
    otpVerification: async (req, res) => {
        try {
            if (req.body.otp == mailer.OTP) {
                console.log(userData.email);
                const user1 = new User(userData);
                user1.save();
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
            const userData = await User.findOne(
                { email: req.session.userEmail },
                (err, user) => {
                    console.log(user);
                    if (err) {
                        console.log(err);
                    } else {
                        res.render("user/userProfile", {
                            data: user,
                            sessionData: req.session.userEmail,
                        });
                    }
                }
            );
        } catch (error) {
            console.log(error);
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
            const productData = await Carts.aggregate([
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
                
            ]);
            console.log(`this is items ${productData}`);
            
            
            count = productData.length;
            res.render("user/cart", {productData, sessionData: req.session.userEmail });
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
        console.log(idUser);
        let proObj = {
            productId: objId,
            quantity: 1,
        };
        if (data.quantity >= 1) {
            const userCart = await Carts.findOne({ userId: userData._id });
            if (userCart) {
                Carts
                    .updateOne({ userId: userData._id }, { $push: { product: proObj } })
                    .then(() => {
                        res.redirect(`/productDetails`);
                    });
            }
            else {
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
                    // res.json({ status: true });
                    res.redirect("/productDetails");
                });
            }
        }
        else {
            res.json({ stock: true });
        }
    },

};
