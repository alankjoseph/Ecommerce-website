const express = require("express");
const session = require("express-session");
const router = express.Router();
const userController = require("../controller/userController");
const sessionMV = require('../middleware/session')

router.get("/", userController.getHome);
router.get("/login", sessionMV.verifyLoginUserWithoutSession, userController.getLogin);
router.get("/signup", userController.getSignUp);
router.post('/login', userController.postLogin)
router.post('/otp', userController.otpVerification);
router.post('/signup', userController.postSignup)
router.get('/logout', sessionMV.verifyLoginUser, userController.getLogout)


router.get('/userProfile',sessionMV.verifyLoginUser, userController.getUserProfile)
router.get('/addAddress', userController.getAddAddress)
router.post('/addAddress', sessionMV.verifyLoginUser, userController.postAddAddress)
router.get('/changePassword', sessionMV.verifyLoginUser, userController.changePassword)
router.post("/newPassword", sessionMV.verifyLoginUser, userController.postChangePassword);
router.get('/editProfile',sessionMV.verifyLoginUser,userController.getEditProfile)
router.post('/editProfile',sessionMV.verifyLoginUser,userController.postEditProfile)

router.get('/productDetails', userController.getProductDetails)
router.get('/cart', sessionMV.verifyLoginUser, userController.getCart)
router.get('/addToCart/:id', sessionMV.verifyLoginUser, userController.addToCart)
router.post('/removeProduct', sessionMV.verifyLoginUser, userController.removeProduct)
router.post('/changeQuantity', sessionMV.verifyLoginUser, userController.changeQuantity)


router.get('/wishlist', sessionMV.verifyLoginUser, userController.getWishlist)
router.get("/addToWishlist/:id", sessionMV.verifyLoginUser, userController.addToWishlist);
router.post("/removewishlistProduct",sessionMV.verifyLoginUser,userController.removewishlistProduct);


router.get('/checkout', sessionMV.verifyLoginUser, userController.getCheckout)
router.post('/placeOrder',sessionMV.verifyLoginUser,userController.placeOrder)
module.exports = router;
