const express = require('express');
const {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
  getMyTours
} = require('../controllers/viewsController');
const router = express.Router();
const { isLoggedIn, protect } = require('../controllers/authController');
const { createBookingCheckout } = require('../controllers/bookingController');

//ROUTES
router.get('/', isLoggedIn, getOverview);
router.get('/me', protect, getAccount);
router.get('/tour/:slug', isLoggedIn, getTour);
router.get('/login', isLoggedIn, getLoginForm);
router.get('/my-tours', createBookingCheckout, protect, getMyTours);

module.exports = router;
