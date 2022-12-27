const dotenv = require("dotenv");
const User = require("../model/userSignup");
const Category = require('../model/category')
const Product = require('../model/product')
dotenv.config();

const adminDetails = {

    email: "admin@gmail.com",
    password: "admin123",
};
module.exports = {
    getLogin: (req, res) => {
        res.render("admin/adminLogin");
    },
    getHome: (req, res) => {
        res.render("admin/adminHome");
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
    insertCategory: (req, res) => {
        try {
            let category = new Category({
                name: req.body.name,
                image: req.file.filename,
            })
            category.save();
            res.redirect('/admin/category');
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
    getAddProduct: async(req,res)=>{
        try {
            
                    Category.find({}, (err, categorydetails) => {
                        if (err) {
                            console.log(err);
                        } else {
                            
                            res.render('admin/addProduct', {user: categorydetails })
                           
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
    geteditCategory: async(req,res)=>{
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
    editCategory: async(req,res)=>{
        try {
            const id=req.query.id;
            await Category.findByIdAndUpdate({ _id:id }, { $set: { name: req.body.name, image: req.file.filename } });
            
            res.redirect('/admin/category');
        } catch (error) {
            console.log(error.message);
        }
    },
    updateCategory: async (req, res) => {
        try {
            const check=await Category.findById({_id:req.query.id});
            
            if(check.status==true){
                await Category.findByIdAndUpdate({ _id: req.query.id }, { $set: { status:false } });
            console.log(check.status)
            }else{
                await Category.findByIdAndUpdate({ _id: req.query.id }, { $set: { status:true} });
                console.log(check.status)
            }
            res.redirect('/admin/category');
        } catch (error) {
            console.log(error.message);
        }
    },
    statusProduct: async (req, res) => {
        try {
            const check=await Product.findById({_id:req.query.id});
            
            if(check.status==true){
                await Product.findByIdAndUpdate({ _id: req.query.id }, { $set: { status:false } });
            console.log(check.status)
            }else{
                await Product.findByIdAndUpdate({ _id: req.query.id }, { $set: { status:true} });
                console.log(check.status)
            }
            res.redirect('/admin/product');
        } catch (error) {
            console.log(error.message);
        }
    },
    editProduct : async(req,res)=>{
        try {
            const id = req.query.id;
            const product= await Product.findById({ _id: id });
            const categoryDetails=await Category.find();
            if (product) {
                        res.render('admin/editProduct', { product,category:categoryDetails});   
            } else {
                res.redirect('/admin/product');
            }
        } catch (error) {
            console.log(error.message);
        }
    },
    updateProduct: async(req,res)=>{
        await Product.findByIdAndUpdate({_id:req.query.id},{$set:{

            name:req.body.name,
            description:req.body.description,
            category:req.body.category,
            image:req.file.filename,
            price:req.body.price,
            quantity:req.body.quantity,
            color:req.body.color
        }})
        res.redirect('/admin/product');
    }
    

};

