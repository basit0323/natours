import axios from 'axios';
import { showAlert } from './alert';

export const bookTour = async (tourId) => {
  try {
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );

    window.location.href = session.data.session.url;
  } catch (err) {
    showAlert('error', 'There is something wrong');
  }
};
