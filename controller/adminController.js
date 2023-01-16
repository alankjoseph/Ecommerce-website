const dotenv = require("dotenv");
const User = require("../model/userSignup");
const Category = require('../model/category')
const Product = require('../model/product');
const Coupon = require('../model/coupon')
const { text } = require("express");
const coupon = require("../model/coupon");
const Order = require("../model/order");
const Banner = require("../model/banner")
const moment = require('moment');
dotenv.config();

const adminDetails = {

    email: "admin@gmail.com",
    password: "admin123",
};
module.exports = {
    getLogin: (req, res) => {
        res.render("admin/adminLogin");
    },
    getHome: async (req, res) => {
        try {
            const orderData = await Order.find({
                orderStatus: { $ne: "Cancelled" },
            });
            const totalAmount = orderData.reduce((accumulator, object) => {
                return (accumulator += object.totalAmount);
            }, 0);
            const orderToday = await Order.find({
                orderStatus: { $ne: "Cancelled" },
                order_placed_on: moment().format('DD-MM-YYYY'),
            });
            const totalOrderToday = orderToday.reduce((accumulator, object) => {
                return (accumulator += object.totalAmount);
            }, 0);

            const start = moment().startOf("month");
            const end = moment().endOf("month");
            const amountPendingList = await Order.find({
                orderStatus: { $ne: "Cancelled" },
                createdAt: {
                    $gte: start,
                    $lte: end,
                },
            });
            const amountPending = amountPendingList.reduce(
                (accumulator, object) => {
                    return (accumulator += object.totalAmount);
                },
                0
            );
            const allOrders = orderData.length;
            const pendingOrder = await Order.find({ orderStatus: "Pending" });
            const pending = pendingOrder.length;
            const processingOrder = await Order.find({ orderStatus: "Shipped" });
            const processing = processingOrder.length;
            const deliveredOrder = await Order.find({ orderStatus: "Delivered" });
            const delivered = deliveredOrder.length;
            const cancelledOrder = await Order.find({ orderStatus: "Cancelled" });
            const cancelled = cancelledOrder.length;
            


            res.render("admin/adminHome", {
                totalAmount: Math.ceil(totalAmount),
                totalOrderToday: Math.ceil(totalOrderToday),
                amountPending: Math.ceil(amountPending),
                allOrders,
                pending,
                processing,
                delivered,
                cancelled,
            });
        } catch (error) {
            console.log(error);
        }

    },
    postLogin: (req, res) => {
        try {
            if (req.body.email === adminDetails.email && req.body.password === adminDetails.password) {
                res.redirect('/admin/home')
            }
        } catch (error) {
            console.log(error);
        }
    },
    getLogout: (req, res) => {
        try {
            res.redirect('/admin')
        } catch (error) {
            console.log(error);
        }
    },
    getUser: (req, res) => {
        try {
            User.find({}, (err, allUsers) => {
                if (err) {
                    console.log(err);
                }
                else {
                    res.render('admin/userDetails', { data: allUsers })
                }
            })

        } catch (error) {
            console.log(error);
        }
    },
    blockuser: async (req, res) => {
        try {
            await User.findByIdAndUpdate({ _id: req.params.id }, { $set: { isBlocked: true } }).then(() => {
                console.log(req.params.id);
                res.redirect('/admin/userManagement');
            });
        } catch (error) {
            console.log(error.message);

        }
    },
    unblockuser: async (req, res) => {
        try {
            await User.updateOne({ _id: req.params.id }, { $set: { isBlocked: false } }).then(() => {
                res.redirect('/admin/userManagement');
            });
        } catch (error) {
            console.log(error.message);
        }
    },
    getAddCategory: (req, res) => {
        res.render('admin/addCategory')
    },
    insertCategory: async (req, res) => {
        try {

            const categoryData = req.body.name.toUpperCase();
            const allCategories = await Category.find();
            const verify = await Category.findOne({ name: categoryData });
            // let category = new Category({
            //     name: req.body.name,
            //     image: req.file.filename,
            // })
            // category.save();
            // res.redirect('/admin/category');
            if (verify == null) {
                const newCategory = new Category({
                    name: categoryData,
                    image: req.file.filename,
                });
                newCategory.save().then(() => {
                    res.redirect("/admin/category");
                });
            } else {
                res.render("admin/addCategory", {
                    err_message: "category already exists",
                    allCategories,
                });
            }

        } catch (error) {
            console.log(error.message);
        }
    },
    getCategory: async (req, res) => {
        try {
            Category.find({}, (err, categoryDetails) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log(categoryDetails)
                    res.render('admin/category', { details: categoryDetails })
                }
            })
        } catch (error) {
            console.log(error.message);
        }
    },
    getAddProduct: async (req, res) => {
        try {

            Category.find({}, (err, categorydetails) => {
                if (err) {
                    console.log(err);
                } else {

                    res.render('admin/addProduct', { user: categorydetails })

                }
            })
        } catch (error) {
            console.log(error.message);
        }
    },
    insertProduct: async (req, res) => {
        try {
            let product = new Product({
                name: req.body.name,
                description: req.body.description,
                category: req.body.category,
                image: req.file.filename,
                price: req.body.price,
                quantity: req.body.quantity,
            })
            await product.save();
            res.redirect('/admin/product');
        } catch (error) {
            console.log(error.message);
        }
    },
    getProduct: async (req, res) => {
        try {
            Product.find({}, (err, productDetails) => {
                if (err) {
                    console.log(err);
                } else {
                    res.render('admin/product', { details: productDetails })
                }
            })
        } catch (error) {
            console.log(error.message);
        }
    },
    geteditCategory: async (req, res) => {
        try {
            const id = req.query.id;
            const userData = await Category.findById({ _id: id });
            if (userData) {

                res.render('admin/editCategory', { user: userData });
            } else {
                res.redirect('/admin/category');
            }

        } catch (error) {
            console.log(error.message);
        }
    },
    editCategory: async (req, res) => {
        try {
            const id = req.query.id;
            await Category.findByIdAndUpdate({ _id: id }, { $set: { name: req.body.name, image: req.file.filename } });

            res.redirect('/admin/category');
        } catch (error) {
            console.log(error.message);
        }
    },
    updateCategory: async (req, res) => {
        try {
            const check = await Category.findById({ _id: req.query.id });

            if (check.status == true) {
                await Category.findByIdAndUpdate({ _id: req.query.id }, { $set: { status: false } });
                console.log(check.status)
            } else {
                await Category.findByIdAndUpdate({ _id: req.query.id }, { $set: { status: true } });
                console.log(check.status)
            }
            res.redirect('/admin/category');
        } catch (error) {
            console.log(error.message);
        }
    },
    statusProduct: async (req, res) => {
        try {
            const check = await Product.findById({ _id: req.query.id });

            if (check.status == true) {
                await Product.findByIdAndUpdate({ _id: req.query.id }, { $set: { status: false } });
                console.log(check.status)
            } else {
                await Product.findByIdAndUpdate({ _id: req.query.id }, { $set: { status: true } });
                console.log(check.status)
            }
            res.redirect('/admin/product');
        } catch (error) {
            console.log(error.message);
        }
    },
    editProduct: async (req, res) => {
        try {
            const id = req.query.id;
            const product = await Product.findById({ _id: id });
            const categoryDetails = await Category.find();
            if (product) {
                res.render('admin/editProduct', { product, category: categoryDetails });
            } else {
                res.redirect('/admin/product');
            }
        } catch (error) {
            console.log(error.message);
        }
    },
    updateProduct: async (req, res) => {
        await Product.findByIdAndUpdate({ _id: req.query.id }, {
            $set: {

                name: req.body.name,
                description: req.body.description,
                category: req.body.category,
                // image: req.file.filename,
                price: req.body.price,
                quantity: req.body.quantity,
                color: req.body.color
            }
        })
        if (req?.files?.filename) {
            // const image = req.files.filename;
            await Product.findByIdAndUpdate({ _id: req.query.id }, {
                $set: {
                    image: req.file.filename,
                }
            })
            res.redirect('/admin/product');
        } else {
            res.redirect('/admin/product');
        }

    },
    getCoupons: (req, res) => {
        try {
            coupon.find().then((coupons) => {
                res.render("admin/coupons", { coupons });
            });
        } catch {
            console.error();

        }
    },
    addCoupon: (req, res) => {
        try {
            const data = req.body;
            const dis = parseInt(data.discount);
            const max = parseInt(data.max);
            const discount = dis / 100;

            Coupon
                .create({
                    couponName: data.coupon,
                    discount: discount,
                    maxLimit: max,
                    expirationTime: data.exdate,
                })
                .then(() => {
                    res.redirect("/admin/coupons");
                });
        } catch {
            console.error();
        }
    },
    editCoupon: (req, res) => {
        try {
            const id = req.params.id;
            const cName = req.body.coupon.toUpperCase()
            const data = req.body;
            Coupon
                .updateOne(
                    { _id: id },
                    {
                        couponName: cName,
                        discount: data.discoun / 100,
                        maxLimit: data.max,
                        expirationTime: data.exdate,
                    }
                )
                .then(() => {
                    res.redirect("/admin/coupons");
                });
        } catch {
            console.error();

        }
    },
    deleteCoupon: (req, res) => {
        const id = req.params.id;
        Coupon.deleteOne({ _id: id }).then(() => {
            res.redirect('/admin/coupons');
        })
    },
    orders: (req, res) => {
        try {
            Order
                .aggregate([
                    {
                        $lookup: {
                            from: "products",
                            localField: "products.productId",
                            foreignField: "_id",
                            as: "productDetails",
                        },
                    },
                    {
                        $lookup: {
                            from: "userdetails",
                            localField: "user_id",
                            foreignField: "_id",
                            as: "user",
                        },
                    },
                    {
                        $lookup: {
                            from: 'addresses',
                            localField: 'address',
                            foreignField: '_id',
                            as: 'userAddress',
                        },
                    },
                    {
                        $unwind: '$user',
                    },
                    { $sort: { createdAt: -1 } },
                ])
                .then((orderDetails) => {
                    console.log(orderDetails);
                    res.render("admin/orders", { orderDetails });
                });
        } catch {
            console.error();
            res.render("user/error");
        }

    },
    changeStatus: async (req, res) => {
        try {
            const { orderID, paymentStatus, orderStatus } = req.body;
            Order.updateOne(
                { _id: orderID },
                {
                    paymentStatus, orderStatus,
                },
            ).then(() => {
                res.send('success');
            }).catch(() => {
                res.redirect('/500');
            });
        } catch (error) {
            res.redirect('/500');
        }

    },
    orderCompeleted: (req, res) => {
        try {
            const { orderID } = req.body;
            Order.updateOne(
                { _id: orderID },
                { orderStatus: 'Completed' },
            ).then(() => {
                res.send('done');
            });
        } catch (error) {
            res.redirect('/500');
        }
    },
    orderCancel: (req, res) => {
        try {
            const { orderID } = req.body;
            Order.updateOne(
                { _id: orderID },
                { orderStatus: 'Cancelled', paymentStatus: 'Cancelled' },
            ).then(() => {
                res.send('done');
            });
        } catch (error) {
            res.redirect('/500');
        }
    },
    getSalesReport: async (req, res) => {
        try {
            const today = moment().startOf('day');
            const endtoday = moment().endOf('day');
            const monthstart = moment().startOf('month');
            const monthend = moment().endOf('month');
            const yearstart = moment().startOf('year');
            const yearend = moment().endOf('year');
            const daliyReport = await Order.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: today.toDate(),
                            $lte: endtoday.toDate(),
                        },
                    },
                },
                {
                    $lookup:
                    {
                        from: 'userdetails',
                        localField: 'user_id',
                        foreignField: '_id',
                        as: 'user',
                    },
                },

                {
                    $project: {
                        order_id: 1,
                        user: 1,
                        paymentStatus: 1,
                        finalAmount: 1,
                        orderStatus: 1,
                    },
                },
                {
                    $unwind: '$user',
                },
            ]);
            console.log(daliyReport);
            const monthReport = await Order.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: monthstart.toDate(),
                            $lte: monthend.toDate(),
                        },
                    },
                },
                {
                    $lookup:
                    {
                        from: 'userdetails',
                        localField: 'user_id',
                        foreignField: '_id',
                        as: 'user',
                    },
                },

                {
                    $project: {
                        order_id: 1,
                        user: 1,
                        paymentStatus: 1,
                        finalAmount: 1,
                        orderStatus: 1,
                    },
                },
                {
                    $unwind: '$user',
                },
            ]);
            console.log(monthReport);
            const yearReport = await Order.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: yearstart.toDate(),
                            $lte: yearend.toDate(),
                        },
                    },
                },
                {
                    $lookup:
                    {
                        from: 'userdetails',
                        localField: 'user_id',
                        foreignField: '_id',
                        as: 'user',
                    },
                },
                {
                    $project: {
                        order_id: 1,
                        user: 1,
                        paymentStatus: 1,
                        totalAmount: 1,
                        orderStatus: 1,
                    },
                },
                {
                    $unwind: '$user',
                },
            ]);
            res.render('admin/salesReport', { today: daliyReport, month: monthReport, year: yearReport });
        } catch (error) {
            console.log(error);
        }
    }

};

