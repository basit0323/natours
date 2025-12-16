import { showAlert } from './alert';

export const login = async (email, password) => {
  try {
    const res = await fetch('http://127.0.0.1:3000/api/v1/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await res.json();

    if (data.status === 'success') {
      showAlert('success', 'user login successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }

    if (!res.ok) {
      throw new Error(data.message);
    }
  } catch (err) {
    showAlert('error', err);
  }
};

export const logout = async () => {
  try {
    const res = await fetch('http://127.0.0.1:3000/api/v1/users/logout');
    const data = await res.json();

    if (data.status === 'success') location.reload(true);
  } catch {
    showAlert('error', 'something went wrong while logging out! Try Again.');
  }
};
