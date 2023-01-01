const mongoose = require("mongoose");
const User = require("../model/userSignup");
const mailer = require("../config/otp");
const Product = require("../model/product");
const Carts = require("../model/carts");
const dotenv = require("dotenv");

dotenv.config();

let count;
module.exports = {
    getHome: async (req, res) => {
        try {
            let userSession = req.session.userEmail;
            if (userSession) {
                const userData = await User.findOne({ email: userSession });
                const cartData = await Carts.find({ userId: userData._id });
                console.log(cartData[0]);
                if (cartData) {
                    count = cartData[0].product.length;
                } else {
                    count = 0;
                }
                console.log(count);
            }

           const product= await Product.find({ status: true }, (err, product) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log(product);
                    res.render("user/index", {
                        data: product,
                        sessionData: req.session.userEmail,
                        count,
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
                            count,
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
                    count,
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
            console.log(sum);
            res.render("user/cart", {cart, userData, sessionData: req.session.userEmail,count,sum});
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
        console.log(userId);
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
        const data = req.body
        data.count = Number(data.count)
        data.quantity = Number(data.quantity)
        const objId = mongoose.Types.ObjectId(data.product)
        const productDetail = await Product.findOne({ _id: data.product })
        console.log(data);
        if ((data.count == -1 && data.quantity == 1) ) {
            res.json({ quantity: true })
        }else if((data.count == 1 && data.quantity == productDetail.quantity)){
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
    getCheckout: (req,res)=>{
        
        res.render('user/checkout',{sessionData: req.session.userEmail,count})
    }
};
