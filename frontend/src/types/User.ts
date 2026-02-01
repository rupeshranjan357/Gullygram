export interface UserSummary {
    userId: string;
    alias: string;
    name?: string; // Optional display name
    realName?: string;
    avatarUrl: string; // Alias avatar
    realAvatarUrl?: string;
    isFriend: boolean;
    trustLevel?: number;
    bio?: string;
    distanceKm?: number;
}
