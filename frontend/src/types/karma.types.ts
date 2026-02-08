export interface KarmaTransaction {
    id: string;
    amount: number;
    sourceType: 'VIBE_CHECK' | 'HUDDLE_HOST' | 'DAILY_LOGIN' | 'REFERRAL' | 'CONTENT_CREATION';
    sourceId: string;
    description?: string;
    createdAt: string;
}

export interface SubmitVibeCheckRequest {
    huddleId: string;
    revieweeId: string;
    rating: number; // 1-5
    tags: string[]; // ["Chill", "On Time", "Fun", "Good Vibes", etc.]
}
