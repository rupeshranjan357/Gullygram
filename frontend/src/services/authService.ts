import { api } from './api';
import {
    SignupRequest,
    LoginRequest,
    OtpRequest,
    OtpVerifyRequest,
    AuthResponse,
    ApiResponse,
} from '@/types';

export const authService = {
    async signup(data: SignupRequest): Promise<AuthResponse> {
        const response = await api.post<ApiResponse<AuthResponse>>('/auth/signup', data);
        return response.data.data;
    },

    async login(data: LoginRequest): Promise<AuthResponse> {
        const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
        return response.data.data;
    },

    async requestOtp(data: OtpRequest): Promise<{ message: string }> {
        const response = await api.post<ApiResponse<void>>('/auth/otp/request', data);
        return { message: response.data.message };
    },

    async verifyOtp(data: OtpVerifyRequest): Promise<AuthResponse> {
        const response = await api.post<ApiResponse<AuthResponse>>('/auth/otp/verify', data);
        return response.data.data;
    },
};
