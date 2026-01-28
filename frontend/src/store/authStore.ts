import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthState, AuthResponse, Profile } from '@/types';

interface AuthStoreWithHydration extends AuthState {
    _hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthStoreWithHydration>()(
    persist(
        (set) => ({
            user: null,
            profile: null,
            token: null,
            isAuthenticated: false,
            _hasHydrated: false,
            isNewUser: false,

            setHasHydrated: (state: boolean) => {
                set({ _hasHydrated: state });
            },

            login: (response: AuthResponse, isSignup: boolean = false) => {
                set({
                    user: response.user,
                    profile: response.profile,
                    token: response.token,
                    isAuthenticated: true,
                    isNewUser: isSignup,
                });
            },

            logout: () => {
                set({
                    user: null,
                    profile: null,
                    token: null,
                    isAuthenticated: false,
                });
            },

            updateProfile: (profile: Profile) => {
                set({ profile });
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
