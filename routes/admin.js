const express = require('express');
const router = express.Router()
const adminController = require("../controller/adminController");
const upload = require('../config/multer')


router.get("/", adminController.getLogin);
router.get('/home', adminController.getHome)
router.post('/home', adminController.postLogin)
router.get('/logout', adminController.getLogout)
router.get('/userManagement', adminController.getUser)
router.get('/blockuser/:id', adminController.blockuser)
router.get('/unblockuser/:id', adminController.unblockuser)
router.get('/addCategory', adminController.getAddCategory)
router.get('/category', adminController.getCategory)
router.post('/addCategory', upload.single('image'), adminController.insertCategory);
router.get('/editCategory', adminController.geteditCategory)
router.post('/editCategory', upload.single('image'), adminController.editCategory);
router.get('/updateCategory', adminController.updateCategory)
router.get('/product', adminController.getProduct)
router.post('/addProduct', upload.single('image'), adminController.insertProduct);
router.get('/addProduct', adminController.getAddProduct)
router.get('/statusProduct', adminController.statusProduct)
router.get('/editProduct', adminController.editProduct)
router.post('/editProduct', upload.single('image'), adminController.updateProduct);

router.get("/coupons", adminController.getCoupons);
router.post("/addCoupon", adminController.addCoupon);
router.post("/editCoupon/:id",adminController.editCoupon);
router.get('/deleteCoupon/:id', adminController.deleteCoupon);
router.get("/orders", adminController.orders);
router.post('/changeStatus',  adminController.changeStatus);
router.post('/orderCompleted',  adminController.orderCompeleted);
router.post('/orderCancel',  adminController.orderCancel);
router.get('/salesReport', adminController.getSalesReport);

router.get('/banner',  adminController.getBanner);
router.get('/addBanner', adminController.getAddBanner);
router.post('/addBanner', upload.single('image'),  adminController.postAddBanner);
router.get('/deleteBanner/:id',  adminController.getDeleteBanner);


module.exports = router;


