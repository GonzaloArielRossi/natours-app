const express = require('express');
const {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
  getMyTours,
  alerts
} = require('../controllers/viewsController');
const router = express.Router();
router.use(alerts);
const { isLoggedIn, protect } = require('../controllers/authController');

//ROUTES
router.get('/', isLoggedIn, getOverview);
router.get('/me', protect, getAccount);
router.get('/tour/:slug', isLoggedIn, getTour);
router.get('/login', isLoggedIn, getLoginForm);
router.get('/my-tours', protect, getMyTours);

module.exports = router;
