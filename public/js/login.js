import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, pwd) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        pwd
      }
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout'
    });
    if ((res.data.status = 'success')) location.assign('/');
  } catch (err) {
    showAlert('error', 'Error logging out! Try again.');
  }
};

export const signup = async (email, name, pwd, pwdConfirm) => {
  const signupBtn = document.getElementById('signupBtn');

  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: {
        email,
        name,
        pwd,
        pwdConfirm
      }
    });
    if ((res.data.status = 'success')) {
      showAlert('success', 'Account created successfully!');
      window.setTimeout(() => {
        location.assign('/me');
      }, 1500);
    }
  } catch (err) {
    console.log(err.response.data.message);
    showAlert('error', err.response.data.message);
  }
  signupBtn.disabled = false;
  signupBtn.style.backgroundColor = '#7dd56f';
};
