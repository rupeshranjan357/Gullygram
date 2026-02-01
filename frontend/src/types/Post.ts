export interface Post {
    id: string;
    text: string;
    mediaUrls?: string[];
    videoUrl?: string;
    likes: number; // or likeCount
    comments: number; // or commentCount
    isLiked: boolean; // or likedByCurrentUser
    likedByCurrentUser?: boolean;
    likeCount?: number;
    commentCount?: number;
    createdAt: string;
    author: {
        userId: string;
        alias: string;
        name: string; // display name
        avatarUrl?: string; // Made optional to match FeedPost
        isFriend?: boolean; // Made optional
        realName?: string;
        realAvatarUrl?: string;
        trustLevel?: number;
    };
    visibility: 'PUBLIC' | 'FRIENDS_ONLY';
    type: 'GENERAL' | 'LOCAL_NEWS' | 'MARKETING' | 'EVENT_PROMO' | 'MARKETPLACE';
    distance?: number;
    interests?: { id: number; name: string }[];

    // Added fields to match FeedPost
    latitude?: number;
    longitude?: number;
    visibilityRadiusKm?: number;
}
