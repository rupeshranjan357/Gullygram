import { create } from 'zustand';
import { OnboardingState } from '@/types';

export const useOnboardingStore = create<OnboardingState>((set) => ({
    selectedInterests: [],
    selectedRadius: 10,

    setInterests: (ids: number[]) => {
        set({ selectedInterests: ids });
    },

    setRadius: (radius: number) => {
        set({ selectedRadius: radius });
    },

    reset: () => {
        set({ selectedInterests: [], selectedRadius: 10 });
    },
}));
