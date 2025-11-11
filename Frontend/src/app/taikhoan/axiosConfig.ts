import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

const DOMAIN = process.env.NEXT_PUBLIC_HOSTDOMAIN ?? '';

function isTokenExpired(token: string) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now();
    } catch (e) {
        return true;
    }
}

const axiosInstance = axios.create({
    baseURL: DOMAIN,
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = Cookies.get('token');
        console.log("Interceptor token:", token);

        if (!token || isTokenExpired(token)) {
            Cookies.remove('token');
            Cookies.remove('user');
            toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");

            // Delay để toast hiển thị trước khi redirect
            setTimeout(() => {
                window.location.href = "/login";
            }, 1000);

            return Promise.reject(new Error("Token expired"));
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor cho response (xử lý lỗi 401)
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            Cookies.remove('token');
            Cookies.remove('user');
            toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
            setTimeout(() => {
                window.location.href = "/login";
            }, 1000);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;