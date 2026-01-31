import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tantml:function_calls';
import { MessageCircle, Loader } from 'lucide-react';
import { messageService, ConversationResponse } from '@/services/messageService';
import { formatDistanceToNow } from 'date-fns';

export const Messages: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const userId = searchParams.get('userId');

    const { data: conversations, isLoading } = useQuery({
        queryKey: ['conversations'],
        queryFn: messageService.getConversations,
        refetchInterval: 5000, // Poll every 5 seconds
    });

    // Handle starting new conversation from user profile
    useEffect(() => {
        if (userId && conversations) {
            // Check if conversation with this user exists
            const existingConv = conversations.find(
                (conv) => conv.otherUser.userId === userId
            );

            if (existingConv) {
                // Navigate to existing conversation
                navigate(`/messages/${existingConv.id}`, { replace: true });
            } else {
                // For new conversation, we'll navigate to a special route
                // The first message will create the conversation
                navigate(`/messages/new/${userId}`, { replace: true });
            }
        }
    }, [userId, conversations, navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader className="w-8 h-8 animate-spin text-primary-purple" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                </div>
            </div>

            {/* Conversation List */}
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
                {conversations && conversations.length > 0 ? (
                    conversations.map((conv) => (
                        <ConversationCard
                            key={conv.id}
                            conversation={conv}
                            onClick={() => navigate(`/messages/${conv.id}`)}
                        />
                    ))
                ) : (
                    <div className="text-center py-12">
                        <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No messages yet</p>
                        <p className="text-sm text-gray-500 mt-2">
                            Send a message to a friend to start chatting!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

interface ConversationCardProps {
    conversation: ConversationResponse;
    onClick: () => void;
}

const ConversationCard: React.FC<ConversationCardProps> = ({ conversation, onClick }) => {
    const timeAgo = conversation.lastMessageAt
        ? formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })
        : '';

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer p-4"
        >
            <div className="flex items-center gap-3">
                {/* Avatar */}
                {conversation.otherUser.avatarUrl ? (
                    <img
                        src={conversation.otherUser.avatarUrl}
                        alt={conversation.otherUser.alias}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold text-lg">
                        {conversation.otherUser.alias[0]?.toUpperCase()}
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between mb-1">
                        <h3 className="font-semibold text-gray-900">
                            {conversation.otherUser.alias}
                        </h3>
                        {conversation.unreadCount > 0 && (
                            <span className="ml-2 bg-primary-purple text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {conversation.unreadCount}
                            </span>
                        )}
                    </div>

                    <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessagePreview || 'No messages yet'}
                    </p>

                    {timeAgo && (
                        <p className="text-xs text-gray-400 mt-1">{timeAgo}</p>
                    )}
                </div>
            </div>
        </div>
    );
};
