import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthState, AuthResponse } from '@/types';

interface AuthStoreWithHydration extends AuthState {
    _hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthStoreWithHydration>()(
    persist(
        (set) => ({
            userId: null,
            alias: null,
            token: null,
            isAuthenticated: false,
            profileComplete: false,
            _hasHydrated: false,
            isNewUser: false,

            setHasHydrated: (state: boolean) => {
                set({ _hasHydrated: state });
            },

            login: (response: AuthResponse, isSignup: boolean = false) => {
                set({
                    userId: response.userId,
                    alias: response.alias,
                    token: response.accessToken,
                    isAuthenticated: true,
                    profileComplete: response.profileComplete,
                    isNewUser: isSignup,
                });
            },

            logout: () => {
                set({
                    userId: null,
                    alias: null,
                    token: null,
                    isAuthenticated: false,
                    profileComplete: false,
                    isNewUser: false,
                });
            },

            setProfileComplete: (complete: boolean) => {
                set({ profileComplete: complete });
            },
        }),
        {
            name: 'gullygram-auth',
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
