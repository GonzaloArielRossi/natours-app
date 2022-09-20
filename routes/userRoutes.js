const express = require('express');
const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  uploadUserPhoto,
  resizeUserPhoto
} = require('./../controllers/userController');

const {
  signup,
  login,
  forgotPwd,
  resetPwd,
  updatePwd,
  protect,
  restrictTo,
  logout
} = require('../controllers/authController');
// ::::::::::::::::: Imports END :::::::::::::::::::::::

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgotPassword', forgotPwd);
router.patch('/resetPassword/:token', resetPwd);

// Protect routes after this point
router.use(protect);

router.patch('/updateMyPassword', updatePwd);
router.patch('/updateMe', uploadUserPhoto, resizeUserPhoto, updateMe);
router.delete('/deleteMe', deleteMe);

// Restric router after this point
router.use(restrictTo('admin'));
router
  .route('/')
  .get(getAllUsers)
  .post(createUser);

router
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

module.exports = router;
