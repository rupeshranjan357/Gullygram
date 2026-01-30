import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    Users, UserPlus, Check, X, MapPin, Sparkles,
    RefreshCw, Bell, ChevronRight, Clock, Shield
} from 'lucide-react';
import { relationshipService, peopleService, PeopleSuggestion, RelationshipResponse } from '@/services/relationshipService';
import { BottomNav } from '@/components/BottomNav';

type Tab = 'suggestions' | 'requests' | 'friends';

export const Discover: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<Tab>('suggestions');
    const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);

    // Modal state for friend request message
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [selectedUserAlias, setSelectedUserAlias] = useState<string>('');
    const [requestMessage, setRequestMessage] = useState('');

    // Get location on mount
    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                },
                () => {
                    // Default to Bangalore
                    setLocation({ lat: 12.9716, lon: 77.5946 });
                }
            );
        } else {
            setLocation({ lat: 12.9716, lon: 77.5946 });
        }
    }, []);

    // Fetch suggestions
    const { data: suggestions, isLoading: suggestionsLoading, refetch: refetchSuggestions } = useQuery({
        queryKey: ['people-suggestions', location],
        queryFn: () => peopleService.getSuggestions({
            lat: location?.lat,
            lon: location?.lon,
            radiusKm: 20,
            limit: 20
        }),
        enabled: !!location
    });

    // Fetch pending requests
    const { data: pendingRequests, isLoading: requestsLoading, refetch: refetchRequests } = useQuery({
        queryKey: ['pending-requests'],
        queryFn: () => relationshipService.getPendingRequests()
    });

    // Fetch friends
    const { data: friends, isLoading: friendsLoading, refetch: refetchFriends } = useQuery({
        queryKey: ['friends'],
        queryFn: () => relationshipService.getFriends()
    });

    // Fetch counts
    const { data: counts } = useQuery({
        queryKey: ['relationship-counts'],
        queryFn: () => relationshipService.getCounts()
    });

    // Send friend request mutation
    const sendRequestMutation = useMutation({
        mutationFn: ({ userId, message }: { userId: string; message?: string }) =>
            relationshipService.sendFriendRequest(userId, message),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['people-suggestions'] });
            queryClient.invalidateQueries({ queryKey: ['relationship-counts'] });
            setShowMessageModal(false);
            setRequestMessage('');
            setSelectedUserId(null);
        }
    });

    // Handle opening the connect modal
    const handleConnectClick = (userId: string, alias: string) => {
        setSelectedUserId(userId);
        setSelectedUserAlias(alias);
        setRequestMessage('');
        setShowMessageModal(true);
    };

    // Handle sending the request
    const handleSendRequest = () => {
        if (selectedUserId) {
            sendRequestMutation.mutate({
                userId: selectedUserId,
                message: requestMessage.trim() || undefined
            });
        }
    };

    // Accept request mutation
    const acceptMutation = useMutation({
        mutationFn: (requestId: string) => relationshipService.acceptFriendRequest(requestId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
            queryClient.invalidateQueries({ queryKey: ['friends'] });
            queryClient.invalidateQueries({ queryKey: ['relationship-counts'] });
        }
    });

    // Reject request mutation
    const rejectMutation = useMutation({
        mutationFn: (requestId: string) => relationshipService.rejectFriendRequest(requestId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
            queryClient.invalidateQueries({ queryKey: ['relationship-counts'] });
        }
    });

    const handleRefresh = () => {
        if (activeTab === 'suggestions') refetchSuggestions();
        else if (activeTab === 'requests') refetchRequests();
        else refetchFriends();
    };

    const isLoading = activeTab === 'suggestions' ? suggestionsLoading
        : activeTab === 'requests' ? requestsLoading
            : friendsLoading;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold text-gray-900">Discover</h1>
                        <button
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2">
                        <TabButton
                            active={activeTab === 'suggestions'}
                            onClick={() => setActiveTab('suggestions')}
                            icon={<Sparkles className="w-4 h-4" />}
                            label="For You"
                        />
                        <TabButton
                            active={activeTab === 'requests'}
                            onClick={() => setActiveTab('requests')}
                            icon={<Bell className="w-4 h-4" />}
                            label="Requests"
                            badge={counts?.pendingRequests}
                        />
                        <TabButton
                            active={activeTab === 'friends'}
                            onClick={() => setActiveTab('friends')}
                            icon={<Users className="w-4 h-4" />}
                            label="Friends"
                            badge={counts?.friends}
                        />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-2xl mx-auto px-4 py-6">
                {activeTab === 'suggestions' && (
                    <SuggestionsTab
                        suggestions={suggestions || []}
                        isLoading={suggestionsLoading}
                        onSendRequest={handleConnectClick}
                        isSending={sendRequestMutation.isPending}
                    />
                )}

                {activeTab === 'requests' && (
                    <RequestsTab
                        requests={pendingRequests || []}
                        isLoading={requestsLoading}
                        onAccept={(id) => acceptMutation.mutate(id)}
                        onReject={(id) => rejectMutation.mutate(id)}
                        isAccepting={acceptMutation.isPending}
                        isRejecting={rejectMutation.isPending}
                    />
                )}

                {activeTab === 'friends' && (
                    <FriendsTab
                        friends={friends || []}
                        isLoading={friendsLoading}
                        onViewProfile={(userId) => navigate(`/user/${userId}`)}
                    />
                )}
            </div>

            {/* Friend Request Message Modal */}
            {showMessageModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full animate-slide-up">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Connect with @{selectedUserAlias}</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Add a personal message to your friend request (optional)
                        </p>

                        <textarea
                            value={requestMessage}
                            onChange={(e) => setRequestMessage(e.target.value)}
                            placeholder="Hey! I noticed we share some interests..."
                            maxLength={200}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent resize-none"
                        />
                        <div className="text-xs text-gray-400 text-right mt-1">
                            {requestMessage.length}/200
                        </div>

                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => {
                                    setShowMessageModal(false);
                                    setRequestMessage('');
                                    setSelectedUserId(null);
                                }}
                                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendRequest}
                                disabled={sendRequestMutation.isPending}
                                className="flex-1 px-4 py-2 bg-primary-purple text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
                            >
                                {sendRequestMutation.isPending ? 'Sending...' : 'Send Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <BottomNav />
        </div>
    );
};

// Tab Button Component
const TabButton: React.FC<{
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    badge?: number;
}> = ({ active, onClick, icon, label, badge }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${active
            ? 'bg-primary-purple text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
    >
        {icon}
        <span>{label}</span>
        {badge !== undefined && badge > 0 && (
            <span className={`px-1.5 py-0.5 rounded-full text-xs ${active ? 'bg-white/20 text-white' : 'bg-primary-purple text-white'
                }`}>
                {badge}
            </span>
        )}
    </button>
);

// Suggestions Tab
const SuggestionsTab: React.FC<{
    suggestions: PeopleSuggestion[];
    isLoading: boolean;
    onSendRequest: (userId: string, alias: string) => void;
    isSending: boolean;
}> = ({ suggestions, isLoading, onSendRequest, isSending }) => {
    if (isLoading) {
        return <LoadingSkeletons />;
    }

    if (suggestions.length === 0) {
        return (
            <EmptyState
                icon={<Sparkles className="w-16 h-16" />}
                title="No suggestions yet"
                description="We'll find people with similar interests near you soon!"
            />
        );
    }

    return (
        <div className="space-y-4">
            {suggestions.map((person) => (
                <SuggestionCard
                    key={person.userId}
                    person={person}
                    onConnect={() => onSendRequest(person.userId, person.alias)}
                    isConnecting={isSending}
                />
            ))}
        </div>
    );
};

// Suggestion Card
const SuggestionCard: React.FC<{
    person: PeopleSuggestion;
    onConnect: () => void;
    isConnecting: boolean;
}> = ({ person, onConnect, isConnecting }) => {
    return (
        <div className="bg-white rounded-xl shadow-md p-4 animate-slide-up">
            <div className="flex items-start gap-4">
                {/* Avatar */}
                {person.avatarUrl ? (
                    <img
                        src={person.avatarUrl}
                        alt={person.alias}
                        className="w-14 h-14 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold text-xl">
                        {person.alias[0]?.toUpperCase()}
                    </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 truncate">@{person.alias}</h3>
                        {person.trustLevel && person.trustLevel >= 3 && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs bg-purple-100 text-purple-600">
                                <Shield className="w-3 h-3" />
                                {person.trustLevel}
                            </span>
                        )}
                        {person.recentlyActive && (
                            <span className="flex items-center gap-1 text-xs text-green-600">
                                <Clock className="w-3 h-3" />
                                Active
                            </span>
                        )}
                    </div>

                    {/* Why Suggested */}
                    <p className="text-sm text-gray-600 mt-1">{person.whySuggested}</p>

                    {/* Shared interests */}
                    {person.sharedInterests.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {person.sharedInterests.slice(0, 3).map((interest, idx) => (
                                <span
                                    key={idx}
                                    className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-full"
                                >
                                    {interest}
                                </span>
                            ))}
                            {person.sharedInterests.length > 3 && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                                    +{person.sharedInterests.length - 3}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Distance */}
                    {person.distanceKm !== undefined && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                            <MapPin className="w-3 h-3" />
                            <span>{person.distanceKm < 1 ? `${Math.round(person.distanceKm * 1000)}m` : `${person.distanceKm.toFixed(1)}km`} away</span>
                        </div>
                    )}
                </div>

                {/* Connect Button */}
                <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold transition-all bg-primary-purple text-white hover:bg-purple-700 disabled:opacity-50"
                >
                    <UserPlus className="w-4 h-4" />
                    <span>Connect</span>
                </button>
            </div>

            {/* Bio */}
            {person.bio && (
                <p className="text-sm text-gray-600 mt-3 pt-3 border-t border-gray-100">
                    {person.bio}
                </p>
            )}
        </div>
    );
};

// Requests Tab
const RequestsTab: React.FC<{
    requests: RelationshipResponse[];
    isLoading: boolean;
    onAccept: (id: string) => void;
    onReject: (id: string) => void;
    isAccepting: boolean;
    isRejecting: boolean;
}> = ({ requests, isLoading, onAccept, onReject, isAccepting, isRejecting }) => {
    if (isLoading) {
        return <LoadingSkeletons />;
    }

    if (requests.length === 0) {
        return (
            <EmptyState
                icon={<Bell className="w-16 h-16" />}
                title="No pending requests"
                description="When someone wants to connect with you, you'll see it here."
            />
        );
    }

    return (
        <div className="space-y-4">
            {requests.map((request) => (
                <RequestCard
                    key={request.id}
                    request={request}
                    onAccept={() => onAccept(request.id)}
                    onReject={() => onReject(request.id)}
                    isAccepting={isAccepting}
                    isRejecting={isRejecting}
                />
            ))}
        </div>
    );
};

// Request Card
const RequestCard: React.FC<{
    request: RelationshipResponse;
    onAccept: () => void;
    onReject: () => void;
    isAccepting: boolean;
    isRejecting: boolean;
}> = ({ request, onAccept, onReject, isAccepting, isRejecting }) => {
    const [handled, setHandled] = useState(false);

    const handleAccept = () => {
        onAccept();
        setHandled(true);
    };

    const handleReject = () => {
        onReject();
        setHandled(true);
    };

    if (handled) {
        return null;
    }

    return (
        <div className="bg-white rounded-xl shadow-md p-4 animate-slide-up">
            <div className="flex items-center gap-4">
                {/* Avatar */}
                {request.user?.avatarUrl ? (
                    <img
                        src={request.user.avatarUrl}
                        alt={request.user.alias}
                        className="w-14 h-14 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold text-xl">
                        {request.user?.alias?.[0]?.toUpperCase() || '?'}
                    </div>
                )}

                {/* Info */}
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">@{request.user?.alias || 'Unknown'}</h3>
                    {request.message && (
                        <p className="text-sm text-gray-600 mt-1">"{request.message}"</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                        {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={handleReject}
                        disabled={isRejecting}
                        className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleAccept}
                        disabled={isAccepting}
                        className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                    >
                        <Check className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Friends Tab
const FriendsTab: React.FC<{
    friends: RelationshipResponse[];
    isLoading: boolean;
    onViewProfile: (userId: string) => void;
}> = ({ friends, isLoading, onViewProfile }) => {
    if (isLoading) {
        return <LoadingSkeletons />;
    }

    if (friends.length === 0) {
        return (
            <EmptyState
                icon={<Users className="w-16 h-16" />}
                title="No friends yet"
                description="Start connecting with people to build your network!"
            />
        );
    }

    return (
        <div className="space-y-3">
            {friends.map((friend) => (
                <div
                    key={friend.id}
                    onClick={() => onViewProfile(friend.user?.userId || '')}
                    className="bg-white rounded-xl shadow-md p-4 flex items-center gap-4 cursor-pointer hover:shadow-lg transition-shadow animate-slide-up"
                >
                    {/* Avatar */}
                    {friend.user?.realAvatarUrl || friend.user?.avatarUrl ? (
                        <img
                            src={friend.user.realAvatarUrl || friend.user.avatarUrl}
                            alt={friend.user.realName || friend.user.alias}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold">
                            {friend.user?.alias?.[0]?.toUpperCase() || '?'}
                        </div>
                    )}

                    {/* Info */}
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                            {friend.user?.realName || `@${friend.user?.alias || 'Unknown'}`}
                        </h3>
                        {friend.user?.realName && (
                            <p className="text-sm text-gray-500">@{friend.user.alias}</p>
                        )}
                    </div>

                    <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
            ))}
        </div>
    );
};

// Loading Skeletons
const LoadingSkeletons: React.FC = () => (
    <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-md p-4 animate-pulse">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gray-200" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                        <div className="h-3 bg-gray-200 rounded w-2/3" />
                    </div>
                    <div className="w-24 h-10 bg-gray-200 rounded-full" />
                </div>
            </div>
        ))}
    </div>
);

// Empty State
const EmptyState: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
}> = ({ icon, title, description }) => (
    <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <div className="text-gray-300 mx-auto mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
    </div>
);
