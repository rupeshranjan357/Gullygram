import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from '@/types';

// Use environment variable for production, proxy path for development
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const authData = localStorage.getItem('gullygram-auth');
        if (authData) {
            const { state } = JSON.parse(authData);
            if (state?.token) {
                config.headers.Authorization = `Bearer ${state.token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiError>) => {
        const apiError: ApiError = {
            message: error.response?.data?.message || error.message || 'An error occurred',
            status: error.response?.status || 500,
            errors: error.response?.data?.errors,
        };
        return Promise.reject(apiError);
    }
);
