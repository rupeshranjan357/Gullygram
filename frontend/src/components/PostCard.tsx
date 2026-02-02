import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, MapPin, Clock, Lock, UserCheck, Shield } from 'lucide-react';
import { LikeButton } from './LikeButton';
import { FeedPost } from '@/services/feedService';
import { formatDistanceToNow } from 'date-fns';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

interface PostCardProps {
    post: FeedPost;
}

const POST_TYPE_COLORS = {
    GENERAL: 'bg-blue-100 text-blue-800',
    LOCAL_NEWS: 'bg-purple-100 text-purple-800',
    MARKETING: 'bg-green-100 text-green-800',
    EVENT_PROMO: 'bg-yellow-100 text-yellow-800',
    MARKETPLACE: 'bg-orange-100 text-orange-800',
};

const POST_TYPE_LABELS = {
    GENERAL: 'General',
    LOCAL_NEWS: 'News',
    MARKETING: 'Marketing',
    EVENT_PROMO: 'Event',
    MARKETPLACE: 'Marketplace',
};

// Trust level badge colors
const TRUST_BADGE_COLORS: Record<number, string> = {
    1: 'bg-gray-100 text-gray-600',
    2: 'bg-blue-100 text-blue-600',
    3: 'bg-green-100 text-green-600',
    4: 'bg-purple-100 text-purple-600',
    5: 'bg-yellow-100 text-yellow-700',
};

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(`/post/${post.id}`);
    };

    const { userId } = useAuthStore();

    const handleAuthorClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (post.author.userId === userId) {
            navigate('/profile');
        } else {
            navigate(`/user/${post.author.userId}`);
        }
    };

    const formatDistance = (distanceKm?: number) => {
        if (!distanceKm) return null;
        if (distanceKm < 1) return `${Math.round(distanceKm * 1000)}m away`;
        return `${distanceKm.toFixed(1)}km away`;
    };

    // Ensure we handle UTC correctly. If string lacks 'Z', we assume it's UTC.
    const date = new Date(post.createdAt.endsWith('Z') ? post.createdAt : post.createdAt + 'Z');
    const timeAgo = formatDistanceToNow(date, { addSuffix: true });

    // Determine what name to show
    const displayName = post.author.isFriend && post.author.realName
        ? post.author.realName
        : `@${post.author.alias}`;

    // Determine avatar
    const avatarUrl = post.author.isFriend && post.author.realAvatarUrl
        ? post.author.realAvatarUrl
        : post.author.avatarUrl;

    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        if (url.startsWith('/')) {
            return `${api.defaults.baseURL?.replace('/api', '')}${url}`;
        }
        return url;
    };



    return (
        <div
            onClick={handleCardClick}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden animate-slide-up"
        >
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
                <div className="flex items-start justify-between">
                    <div
                        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={handleAuthorClick}
                    >
                        {/* Avatar */}
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={displayName}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold">
                                {post.author.alias[0]?.toUpperCase()}
                            </div>
                        )}

                        {/* Author Info */}
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="font-semibold text-gray-900">{displayName}</p>

                                {/* Friend indicator */}
                                {post.author.isFriend && (
                                    <span className="flex items-center gap-1 text-xs text-green-600">
                                        <UserCheck className="w-3 h-3" />
                                        <span>Friend</span>
                                    </span>
                                )}

                                {/* If not a friend and not showing real name, show lock */}
                                {!post.author.isFriend && !post.author.realName && (
                                    <span title="Add as friend to see real name">
                                        <Lock className="w-3 h-3 text-gray-400" />
                                    </span>
                                )}

                                {/* Trust badge */}
                                {post.author.trustLevel && post.author.trustLevel >= 3 && (
                                    <span
                                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs ${TRUST_BADGE_COLORS[post.author.trustLevel] || TRUST_BADGE_COLORS[1]}`}
                                        title={`Trust Level ${post.author.trustLevel}`}
                                    >
                                        <Shield className="w-3 h-3" />
                                        {post.author.trustLevel}
                                    </span>
                                )}
                            </div>

                            {/* Show alias if showing real name */}
                            {post.author.isFriend && post.author.realName && (
                                <p className="text-xs text-gray-500">@{post.author.alias}</p>
                            )}

                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>{timeAgo}</span>
                                {post.distance !== undefined && (
                                    <>
                                        <span>•</span>
                                        <MapPin className="w-3 h-3" />
                                        <span>{formatDistance(post.distance)}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Badges Container */}
                    <div className="flex items-center gap-2">
                        {/* Visibility Badge */}
                        {post.visibility === 'FRIENDS_ONLY' && (
                            <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                                <Lock className="w-3 h-3" />
                                Friends Only
                            </span>
                        )}

                        {/* Post Type Badge */}
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${POST_TYPE_COLORS[post.type]}`}>
                            {POST_TYPE_LABELS[post.type]}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <p className="text-gray-800 whitespace-pre-wrap break-words">{post.text}</p>

                {/* Media */}
                {post.mediaUrls && post.mediaUrls.length > 0 && (
                    <div className="mt-3 grid gap-2">
                        {post.mediaUrls.map((url, idx) => (
                            <img
                                key={idx}
                                src={getImageUrl(url)}
                                alt={`Post media ${idx + 1}`}
                                className="rounded-lg max-h-80 w-full object-cover"
                            />
                        ))}
                    </div>
                )}

                {/* Interest Tags */}
                {post.interests && post.interests.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {post.interests.map((interest) => (
                            <span
                                key={interest.id}
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                                #{interest.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="px-4 py-3 bg-gray-50 flex items-center gap-6">
                <LikeButton
                    postId={post.id}
                    initialLiked={post.likedByCurrentUser}
                    initialLikeCount={post.likeCount}
                />

                <button className="flex items-center gap-2 text-gray-600 hover:text-primary-purple transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-semibold">{post.commentCount}</span>
                </button>
            </div>
        </div>
    );
};
