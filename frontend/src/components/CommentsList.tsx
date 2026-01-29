import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, MessageCircle } from 'lucide-react';
import { commentService, Comment } from '@/services/commentService';
import { formatDistanceToNow } from 'date-fns';
import { Button } from './ui/Button';

interface CommentsListProps {
    postId: string;
}

export const CommentsList: React.FC<CommentsListProps> = ({ postId }) => {
    const queryClient = useQueryClient();
    const [commentText, setCommentText] = useState('');

    const { data: commentsData, isLoading } = useQuery({
        queryKey: ['comments', postId],
        queryFn: () => commentService.getComments(postId, 0, 20),
    });

    const addCommentMutation = useMutation({
        mutationFn: (text: string) => commentService.addComment(postId, { text }),
        onSuccess: () => {
            setCommentText('');
            queryClient.invalidateQueries({ queryKey: ['comments', postId] });
            queryClient.invalidateQueries({ queryKey: ['post', postId] });
            queryClient.invalidateQueries({ queryKey: ['feed'] });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (commentText.trim()) {
            addCommentMutation.mutate(commentText.trim());
        }
    };

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const comments = commentsData?.content || [];

    return (
        <div className="space-y-6">
            {/* Add Comment Form */}
            <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4">
                <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                        U
                    </div>
                    <div className="flex-1">
                        <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Add a comment..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent resize-none"
                            rows={2}
                            maxLength={500}
                        />
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                                {commentText.length}/500
                            </span>
                            <Button
                                type="submit"
                                variant="primary"
                                size="sm"
                                disabled={!commentText.trim() || addCommentMutation.isPending}
                                loading={addCommentMutation.isPending}
                            >
                                <Send className="w-4 h-4 mr-1" />
                                Post
                            </Button>
                        </div>
                    </div>
                </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Comments ({commentsData?.totalElements || 0})
                </h3>

                {comments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No comments yet. Be the first to comment!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {comments.map((comment) => (
                            <CommentItem key={comment.id} comment={comment} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const CommentItem: React.FC<{ comment: Comment }> = ({ comment }) => {
    const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });

    return (
        <div className="flex gap-3 animate-slide-up">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {comment.authorAlias[0]?.toUpperCase()}
            </div>
            <div className="flex-1 bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-gray-900">
                        @{comment.authorAlias}
                    </span>
                    <span className="text-xs text-gray-500">{timeAgo}</span>
                </div>
                <p className="text-gray-700 text-sm whitespace-pre-wrap break-words">
                    {comment.text}
                </p>
            </div>
        </div>
    );
};
