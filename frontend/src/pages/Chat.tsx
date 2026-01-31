import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Send, Loader } from 'lucide-react';
import { messageService, MessageResponse } from '@/services/messageService';
import { formatDistanceToNow } from 'date-fns';

export const Chat: React.FC = () => {
    const { conversationId } = useParams<{ conversationId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [messageText, setMessageText] = useState('');

    // Get conversation details
    const { data: conversation, isLoading } = useQuery({
        queryKey: ['conversation', conversationId],
        queryFn: () => messageService.getConversation(conversationId!),
        enabled: !!conversationId,
        refetchInterval: 5000, // Poll every 5 seconds
    });

    // Send message mutation
    const sendMutation = useMutation({
        mutationFn: (content: string) =>
            messageService.sendMessage({
                recipientId: conversation!.otherUser.userId,
                content,
            }),
        onSuccess: () => {
            setMessageText('');
            queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
    });

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation?.messages]);

    // Mark as read when opening conversation
    useEffect(() => {
        if (conversationId && conversation) {
            messageService.markAsRead(conversationId);
        }
    }, [conversationId, conversation]);

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

    if (!conversation) {
        return <div>Conversation not found</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
                    <button
                        onClick={() => navigate('/messages')}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>

                    {/* Other user info */}
                    <div className="flex items-center gap-3">
                        {conversation.otherUser.avatarUrl ? (
                            <img
                                src={conversation.otherUser.avatarUrl}
                                alt={conversation.otherUser.alias}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold">
                                {conversation.otherUser.alias[0]?.toUpperCase()}
                            </div>
                        )}

                        <h1 className="text-lg font-bold text-gray-900">
                            {conversation.otherUser.alias}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto max-w-2xl mx-auto w-full px-4 py-6">
                {conversation.messages.length > 0 ? (
                    <div className="space-y-4">
                        {conversation.messages.slice().reverse().map((message) => (
                            <MessageBubble key={message.id} message={message} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        No messages yet. Start the conversation!
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white border-t border-gray-200 sticky bottom-0">
                <form onSubmit={handleSend} className="max-w-2xl mx-auto px-4 py-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-purple focus:border-transparent"
                            maxLength={2000}
                        />
                        <button
                            type="submit"
                            disabled={!messageText.trim() || sendMutation.isPending}
                            className="bg-primary-purple text-white rounded-full w-10 h-10 flex items-center justify-center disabled:opacity-50 hover:bg-purple-700 transition-colors"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface MessageBubbleProps {
    message: MessageResponse;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const timeAgo = formatDistanceToNow(new Date(message.createdAt), { addSuffix: true });

    return (
        <div className={`flex ${message.isMine ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${message.isMine
                        ? 'bg-primary-purple text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
            >
                <p className="break-words">{message.content}</p>
                <div className={`flex items-center gap-1 text-xs mt-1 ${message.isMine ? 'text-purple-200' : 'text-gray-500'
                    }`}>
                    <span>{timeAgo}</span>
                    {message.isMine && (
                        <span>{message.isRead ? '✓✓' : '✓'}</span>
                    )}
                </div>
            </div>
        </div>
    );
};
