import axios from 'axios';

const api = axios.create({
  // رابط الباك إند الخاص بك على Railway
  baseURL: 'https://conference-management-system-production-5983.up.railway.app/api',
});

// إضافة الـ Token تلقائياً من localStorage في كل طلب
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// التعامل مع أخطاء الـ Unauthorized (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;