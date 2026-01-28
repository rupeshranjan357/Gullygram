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
    description?: string;
}

export interface AuthResponse {
    accessToken: string;
    tokenType: string;
    userId: string;
    alias: string;
    profileComplete: boolean;
}

export interface ProfileResponse {
    userId: string;
    email?: string;
    phone?: string;
    alias: string;
    realName?: string;
    bio?: string;
    avatarUrlAlias?: string;
    avatarUrlReal?: string;
    dob?: string;
    homeLat?: number;
    homeLon?: number;
    defaultRadiusKm: number;
    lastSeenLat?: number;
    lastSeenLon?: number;
    lastSeenAt?: string;
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
    avatarUrlAlias?: string;
    avatarUrlReal?: string;
    dob?: string;
    defaultRadiusKm?: number;
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
    message: string;
    data: T;
}

export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
    status: number;
}

// UI State Types
export interface AuthState {
    userId: string | null;
    alias: string | null;
    token: string | null;
    isAuthenticated: boolean;
    isNewUser?: boolean;
    profileComplete: boolean;
    login: (response: AuthResponse, isSignup?: boolean) => void;
    logout: () => void;
    setProfileComplete: (complete: boolean) => void;
}

export interface OnboardingState {
    selectedInterests: number[];
    selectedRadius: number;
    setInterests: (ids: number[]) => void;
    setRadius: (radius: number) => void;
    reset: () => void;
}
