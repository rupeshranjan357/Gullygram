import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Send, Loader } from 'lucide-react';
import { messageService } from '@/services/messageService';
import { peopleService } from '@/services/relationshipService';

export const NewChat: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [messageText, setMessageText] = useState('');

    // Get user info
    const { data: user, isLoading } = useQuery({
        queryKey: ['user-profile', userId],
        queryFn: () => peopleService.getUserProfile(userId!),
        enabled: !!userId
    });

    // Send message mutation
    const sendMutation = useMutation({
        mutationFn: (content: string) =>
            messageService.sendMessage({
                recipientId: userId!,
                content,
            }),
        onSuccess: () => {
            // After sending first message, navigate to conversations
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            navigate('/messages', { replace: true });
        },
    });

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (messageText.trim() && !sendMutation.isPending) {
            sendMutation.mutate(messageText.trim());
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader className="w-8 h-8 animate-spin text-primary-purple" />
            </div>
        );
    }

    if (!user) {
        return <div>User not found</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>

                    {/* Other user info */}
                    <div className="flex items-center gap-3">
                        {user.avatarUrl ? (
                            <img
                                src={user.avatarUrl}
                                alt={user.alias}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold">
                                {user.alias[0]?.toUpperCase()}
                            </div>
                        )}

                        <h1 className="text-lg font-bold text-gray-900">
                            {user.alias}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Empty messages area */}
            <div className="flex-1 overflow-y-auto max-w-2xl mx-auto w-full px-4 py-6">
                <div className="text-center py-12 text-gray-500">
                    Start a conversation with {user.alias}
                </div>
            </div>

            {/* Input */}
            <div className="bg-white border-t border-gray-200 sticky bottom-0">
                <form onSubmit={handleSend} className="max-w-2xl mx-auto px-4 py-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            placeholder="Type your first message..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-purple focus:border-transparent"
                            maxLength={2000}
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={!messageText.trim() || sendMutation.isPending}
                            className="bg-primary-purple text-white rounded-full w-10 h-10 flex items-center justify-center disabled:opacity-50 hover:bg-purple-700 transition-colors"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                    {sendMutation.isError && (
                        <p className="text-red-500 text-sm mt-2">
                            Failed to send message. Are you friends with this user?
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
};
