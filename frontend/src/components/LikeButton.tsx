import React from 'react';
import { Heart } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { likeService } from '@/services/likeService';

interface LikeButtonProps {
    postId: string;
    initialLiked: boolean;
    initialLikeCount: number;
    size?: 'sm' | 'md' | 'lg';
}

export const LikeButton: React.FC<LikeButtonProps> = ({
    postId,
    initialLiked,
    initialLikeCount,
    size = 'md'
}) => {
    const queryClient = useQueryClient();
    const [liked, setLiked] = React.useState(initialLiked);
    const [likeCount, setLikeCount] = React.useState(initialLikeCount);

    const likeMutation = useMutation({
        mutationFn: () => likeService.toggleLike(postId),
        onMutate: async () => {
            // Optimistic update
            setLiked(!liked);
            setLikeCount(liked ? likeCount - 1 : likeCount + 1);
        },
        onSuccess: (data) => {
            // Update with server response
            setLiked(data.liked);
            setLikeCount(data.likeCount);
            // Invalidate feed queries to refresh
            queryClient.invalidateQueries({ queryKey: ['feed'] });
            queryClient.invalidateQueries({ queryKey: ['post', postId] });
        },
        onError: () => {
            // Revert on error
            setLiked(liked);
            setLikeCount(likeCount);
        }
    });

    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent post card click
        likeMutation.mutate();
    };

    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };

    return (
        <button
            onClick={handleLike}
            disabled={likeMutation.isPending}
            className={`flex items-center gap-2 transition-all ${
                likeMutation.isPending ? 'opacity-50' : ''
            }`}
        >
            <Heart
                className={`${sizeClasses[size]} transition-all ${
                    liked 
                        ? 'fill-red-500 text-red-500 scale-110' 
                        : 'text-gray-600 hover:text-red-500 hover:scale-110'
                }`}
            />
            <span className={`font-semibold ${liked ? 'text-red-500' : 'text-gray-600'}`}>
                {likeCount}
            </span>
        </button>
    );
};
