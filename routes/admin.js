const express = require('express');
const router = express.Router()
const adminController = require("../controller/adminController");
const upload = require('../config/multer')


router.get("/", adminController.getLogin);
router.get('/home',adminController.getHome)
router.post('/home',adminController.postLogin)
router.get('/logout',adminController.getLogout)
router.get('/userManagement',adminController.getUser)
router.get('/blockuser/:id',adminController.blockuser)
router.get('/unblockuser/:id',adminController.unblockuser)
router.get('/addCategory',adminController.getAddCategory)
router.get('/category',adminController.getCategory)
router.post('/addCategory', upload.single('image'), adminController.insertCategory);
router.get('/editCategory',adminController.geteditCategory)
router.post('/editCategory', upload.single('image'), adminController.editCategory);
router.get('/updateCategory',adminController.updateCategory)
router.get('/product',adminController.getProduct)
router.post('/addProduct', upload.single('image'), adminController.insertProduct);
router.get('/addProduct',adminController.getAddProduct)
router.get('/statusProduct',adminController.statusProduct)
router.get('/editProduct',  adminController.editProduct)
router.post('/editProduct', upload.single('image'), adminController.updateProduct);




module.exports = router;


