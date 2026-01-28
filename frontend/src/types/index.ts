// User and Authentication Types
export interface User {
    id: number;
    email: string;
    phone?: string;
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    createdAt: string;
}

export interface Profile {
    id: number;
    userId: number;
    alias: string;
    realName?: string;
    bio?: string;
    avatarUrl?: string;
    realAvatarUrl?: string;
    dateOfBirth?: string;
    defaultRadius: number;
    homeLatitude?: number;
    homeLongitude?: number;
    lastSeenLatitude?: number;
    lastSeenLongitude?: number;
    lastSeenAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Interest {
    id: number;
    name: string;
    icon: string;
    colorClass?: string;
}

export interface AuthResponse {
    token: string;
    user: User;
    profile: Profile;
}

export interface ProfileResponse {
    user: User;
    profile: Profile;
    interests: Interest[];
}

// Request Types
export interface SignupRequest {
    email: string;
    password: string;
    alias: string;
    realName?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface OtpRequest {
    phone: string;
}

export interface OtpVerifyRequest {
    phone: string;
    code: string;
    alias?: string;
    realName?: string;
}

export interface UpdateProfileRequest {
    alias?: string;
    realName?: string;
    bio?: string;
    avatarUrl?: string;
    realAvatarUrl?: string;
    dateOfBirth?: string;
    defaultRadius?: number;
}

export interface UpdateLocationRequest {
    latitude: number;
    longitude: number;
}

export interface UpdateInterestsRequest {
    interestIds: number[];
}

// API Response Types
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
}

export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
    status: number;
}

// UI State Types
export interface AuthState {
    user: User | null;
    profile: Profile | null;
    token: string | null;
    isAuthenticated: boolean;
    isNewUser?: boolean;
    login: (response: AuthResponse, isSignup?: boolean) => void;
    logout: () => void;
    updateProfile: (profile: Profile) => void;
}

export interface OnboardingState {
    selectedInterests: number[];
    selectedRadius: number;
    setInterests: (ids: number[]) => void;
    setRadius: (radius: number) => void;
    reset: () => void;
}
