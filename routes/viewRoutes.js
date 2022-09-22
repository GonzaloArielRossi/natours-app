const express = require('express');
const {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
  getMyTours,
  alerts,
  getSignupForm,
  getMyReviews,
  createReview
} = require('../controllers/viewsController');
const router = express.Router();
router.use(alerts);
const { isLoggedIn, protect } = require('../controllers/authController');

//ROUTES
router.get('/', isLoggedIn, getOverview);
router.get('/me', protect, getAccount);
router.get('/tour/:slug', isLoggedIn, getTour);
router.get('/login', isLoggedIn, getLoginForm);
router.get('/signup', getSignupForm);
router.get('/my-tours', protect, getMyTours);
router.get('/my-reviews', protect, getMyReviews);
router.get('/:id/create-review', protect, createReview);

module.exports = router;
