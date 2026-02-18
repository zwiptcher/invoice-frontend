import axios from 'axios';

const api = axios.create({
    baseURL: 'https://invoice-backend-wku1.onrender.com/api',
});

// Add a request interceptor to attach the auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle 401s
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            window.location.href = '/login?session=expired';
        }
        return Promise.reject(error);
    }
);

export const getInvoices = () => api.get('/invoices');
export const getInvoiceById = (id) => api.get(`/invoices/${id}`);
export const createInvoice = (data) => api.post('/invoices', data);
export const deleteInvoice = (id) => api.delete(`/invoices/${id}`);
export const generateInvoiceFromAI = (description) => api.post('/ai/generate', { description });
export const getAnalytics = () => api.get('/analytics');
export const getDashboardData = () => api.get('/dashboard');
export const logoutUser = () => api.post('/auth/logout');

export default api;
