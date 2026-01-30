import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, MapPin, Clock } from 'lucide-react';
import { LikeButton } from './LikeButton';
import { FeedPost } from '@/services/feedService';
import { formatDistanceToNow } from 'date-fns';

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

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(`/post/${post.id}`);
    };

    const formatDistance = (distanceKm?: number) => {
        if (!distanceKm) return null;
        if (distanceKm < 1) return `${Math.round(distanceKm * 1000)}m away`;
        return `${distanceKm.toFixed(1)}km away`;
    };

    const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

    return (
        <div
            onClick={handleCardClick}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden animate-slide-up"
        >
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold">
                            {post.author.alias[0]?.toUpperCase()}
                        </div>

                        {/* Author Info */}
                        <div>
                            <p className="font-semibold text-gray-900">@{post.author.alias}</p>
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

                    {/* Post Type Badge */}
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${POST_TYPE_COLORS[post.type]}`}>
                        {POST_TYPE_LABELS[post.type]}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <p className="text-gray-800 whitespace-pre-wrap break-words">{post.text}</p>

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
