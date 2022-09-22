import axios from 'axios';
import { showAlert } from './alerts';

export const createReview = async (tour, review, rating) => {
  const reviewBtn = document.getElementById('reviewBtn');
  console.log(tour);
  try {
    const res = await axios({
      method: 'POST',
      url: `/api/v1/tours/${tour}/reviews`,
      data: {
        review,
        rating
      }
    });
    if ((res.data.status = 'success')) {
      showAlert('success', 'Review sent!');
      window.setTimeout(() => {
        location.assign('/me');
      }, 1500);
    }
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
  reviewBtn.disabled = false;
  reviewBtn.style.backgroundColor = '#7dd56f';
};
