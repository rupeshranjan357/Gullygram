import { api } from './api';
import {
    SignupRequest,
    LoginRequest,
    OtpRequest,
    OtpVerifyRequest,
    AuthResponse,
} from '@/types';

export const authService = {
    async signup(data: SignupRequest): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/signup', data);
        return response.data;
    },

    async login(data: LoginRequest): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/login', data);
        return response.data;
    },

    async requestOtp(data: OtpRequest): Promise<{ message: string }> {
        const response = await api.post('/auth/otp/request', data);
        return response.data;
    },

    async verifyOtp(data: OtpVerifyRequest): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/otp/verify', data);
        return response.data;
    },
};
