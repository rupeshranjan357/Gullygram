import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Clock, Loader } from 'lucide-react';
import { postService } from '@/services/postService';
import { LikeButton } from '@/components/LikeButton';
import { CommentsList } from '@/components/CommentsList';
import { formatDistanceToNow } from 'date-fns';

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

export const PostDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: post, isLoading, isError } = useQuery({
        queryKey: ['post', id],
        queryFn: () => postService.getPost(id!),
        enabled: !!id,
    });

    const formatDistance = (distanceKm?: number) => {
        if (!distanceKm) return null;
        if (distanceKm < 1) return `${Math.round(distanceKm * 1000)}m away`;
        return `${distanceKm.toFixed(1)}km away`;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-12 h-12 animate-spin text-primary-purple mx-auto mb-4" />
                    <p className="text-gray-600">Loading post...</p>
                </div>
            </div>
        );
    }

    if (isError || !post) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Failed to load post</p>
                    <button
                        onClick={() => navigate('/feed')}
                        className="text-primary-purple font-semibold hover:underline"
                    >
                        Back to Feed
                    </button>
                </div>
            </div>
        );
    }

    const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
                    <button
                        onClick={() => navigate('/feed')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">Post</h1>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* Post Card */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden animate-slide-up">
                    {/* Post Header */}
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                {/* Avatar */}
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold text-lg">
                                    {post.author.alias[0]?.toUpperCase()}
                                </div>

                                {/* Author Info */}
                                <div>
                                    <p className="font-bold text-lg text-gray-900">
                                        @{post.author.alias}
                                    </p>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Clock className="w-4 h-4" />
                                        <span>{timeAgo}</span>
                                        {post.distance !== undefined && (
                                            <>
                                                <span>•</span>
                                                <MapPin className="w-4 h-4" />
                                                <span>{formatDistance(post.distance)}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Post Type Badge */}
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${POST_TYPE_COLORS[post.type]}`}>
                                {POST_TYPE_LABELS[post.type]}
                            </span>
                        </div>

                        {/* Post Content */}
                        <div className="mt-4">
                            <p className="text-gray-800 text-lg whitespace-pre-wrap break-words leading-relaxed">
                                {post.text}
                            </p>
                        </div>

                        {/* Media */}
                        {post.mediaUrls && post.mediaUrls.length > 0 && (
                            <div className="mt-4 grid gap-4">
                                {post.mediaUrls.map((url, idx) => (
                                    <img
                                        key={idx}
                                        src={url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}${url}`}
                                        alt={`Post media ${idx + 1}`}
                                        className="w-full h-auto rounded-xl object-contain bg-gray-100 max-h-[600px]"
                                        onError={(e) => {
                                            // Fallback for relative paths if VITE_API_URL is tricky, 
                                            // but usually we want to point to backend. 
                                            // PostCard uses api.defaults.baseURL.
                                            const target = e.target as HTMLImageElement;
                                            if (url.startsWith('/') && !target.src.includes('localhost')) {
                                                // simplistic fallback
                                            }
                                        }}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Interest Tags */}
                        {post.interests && post.interests.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                                {post.interests.map((interest) => (
                                    <span
                                        key={interest.id}
                                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-semibold"
                                    >
                                        #{interest.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions Bar */}
                    <div className="px-6 py-4 bg-gray-50 flex items-center gap-6">
                        <LikeButton
                            postId={post.id}
                            initialLiked={post.likedByCurrentUser}
                            initialLikeCount={post.likeCount}
                            size="lg"
                        />

                        <div className="flex items-center gap-2 text-gray-600">
                            <span className="font-semibold text-lg">{post.commentCount}</span>
                            <span className="text-sm">comments</span>
                        </div>
                    </div>
                </div>

                {/* Comments Section */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <CommentsList postId={post.id} />
                </div>
            </div>
        </div>
    );
};
