import axios from 'axios';
import { showAlert } from './alert';

export const updateSettings = async (data, type) => {
  const endPoint = type === 'data' ? 'updateMe' : 'updatePassword';

  try {
    const res = await axios({
      method: 'PATCH',
      url: `http://127.0.0.1:3000/api/v1/users/${endPoint}`,
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', `USER ${type.toUpperCase()} UPDATED SUCCESSFULLY`);
    }
  } catch (err) {
    console.log(err.response.data);
    showAlert('error', err.response.data.message);
  }
};
