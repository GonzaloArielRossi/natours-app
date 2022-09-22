import { displayMap } from './mapbox';
import { login, logout, signup } from './login';
import { createReview } from './createReview';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { showAlert } from './alerts';

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.form--signup');
const createReviewForm = document.querySelector('.form--review');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');
const signupBtn = document.getElementById('signupBtn');
const reviewBtn = document.getElementById('reviewBtn');

// DELEGATION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (createReviewForm) {
  createReviewForm.addEventListener('submit', e => {
    reviewBtn.disabled = true;
    reviewBtn.style.backgroundColor = 'grey';
    e.preventDefault();
    const review = document.getElementById('review').value;
    const rating = document.getElementById('rating').value;
    const tour = document.getElementById('tour').value;
    createReview(tour, review, rating);
  });
}
if (loginForm)
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const pwd = document.getElementById('password').value;
    login(email, pwd);
  });

if (signupForm)
  signupForm.addEventListener('submit', e => {
    signupBtn.disabled = true;
    signupBtn.style.backgroundColor = 'grey';
    e.preventDefault();
    const email = document.getElementById('email').value;
    const name = document.getElementById('name').value;
    const pwd = document.getElementById('password').value;
    const pwdConfirm = document.getElementById('passwordConfirm').value;
    signup(email, name, pwd, pwdConfirm);
  });

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataForm)
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateSettings(form, 'data');
  });

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const pwdCurrent = document.getElementById('password-current').value;
    const pwd = document.getElementById('password').value;
    const pwdConfirm = document.getElementById('password-confirm').value;
    await updateSettings({ pwdCurrent, pwd, pwdConfirm }, 'pwd');

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

if (bookBtn)
  bookBtn.addEventListener('click', e => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });

const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 20);
