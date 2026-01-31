import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ArrowLeft, UserPlus, UserMinus, UserCheck, Ban, Shield,
    Lock, MapPin, Clock, MoreVertical, AlertTriangle, MessageCircle
} from 'lucide-react';
import { relationshipService, peopleService } from '@/services/relationshipService';
import { Button } from '@/components/ui/Button';

export const UserProfile: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [showMenu, setShowMenu] = useState(false);
    const [showBlockConfirm, setShowBlockConfirm] = useState(false);
    const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);

    // Get location
    React.useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
                () => setLocation({ lat: 12.9716, lon: 77.5946 })
            );
        }
    }, []);

    // Fetch user profile
    const { data: user, isLoading, error } = useQuery({
        queryKey: ['user-profile', userId],
        queryFn: () => peopleService.getUserProfile(userId!, location?.lat, location?.lon),
        enabled: !!userId
    });

    // Fetch relationship status
    const { data: relationshipStatus } = useQuery({
        queryKey: ['relationship-status', userId],
        queryFn: () => relationshipService.getRelationshipStatus(userId!),
        enabled: !!userId
    });

    // Send friend request mutation
    const sendRequestMutation = useMutation({
        mutationFn: () => relationshipService.sendFriendRequest(userId!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['relationship-status', userId] });
            queryClient.invalidateQueries({ queryKey: ['user-profile', userId] });
        }
    });

    // Remove friend mutation
    const removeFriendMutation = useMutation({
        mutationFn: () => relationshipService.removeFriend(userId!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['relationship-status', userId] });
            queryClient.invalidateQueries({ queryKey: ['user-profile', userId] });
            queryClient.invalidateQueries({ queryKey: ['friends'] });
        }
    });

    // Block user mutation
    const blockMutation = useMutation({
        mutationFn: () => relationshipService.blockUser(userId!),
        onSuccess: () => {
            setShowBlockConfirm(false);
            navigate(-1);
        }
    });

    const status = relationshipStatus?.status || 'NONE';
    const isFriend = status === 'FRIENDS';

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary-purple border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center p-8">
                    <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">User not found</h2>
                    <p className="text-gray-600 mb-4">This user may not exist or has blocked you.</p>
                    <Button onClick={() => navigate(-1)} variant="secondary">Go Back</Button>
                </div>
            </div>
        );
    }

    // Determine what to display
    const displayName = isFriend && user.realName ? user.realName : `@${user.alias}`;
    const avatarUrl = isFriend && user.realAvatarUrl ? user.realAvatarUrl : user.avatarUrl;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-br from-purple-600 to-blue-500 text-white">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <MoreVertical className="w-6 h-6" />
                            </button>

                            {showMenu && (
                                <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg py-2 min-w-40 z-10">
                                    <button
                                        onClick={() => {
                                            setShowMenu(false);
                                            setShowBlockConfirm(true);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left"
                                    >
                                        <Ban className="w-4 h-4" />
                                        <span>Block User</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Profile Card */}
                <div className="max-w-2xl mx-auto px-4 pb-8 text-center">
                    {/* Avatar */}
                    <div className="relative inline-block">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={displayName}
                                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold border-4 border-white shadow-lg">
                                {user.alias[0]?.toUpperCase()}
                            </div>
                        )}

                        {/* Friend Badge */}
                        {isFriend && (
                            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5">
                                <UserCheck className="w-4 h-4 text-white" />
                            </div>
                        )}

                        {/* Lock for non-friends */}
                        {!isFriend && (
                            <div className="absolute -bottom-1 -right-1 bg-gray-500 rounded-full p-1.5">
                                <Lock className="w-4 h-4 text-white" />
                            </div>
                        )}
                    </div>

                    {/* Name */}
                    <h1 className="text-2xl font-bold mt-4">{displayName}</h1>

                    {/* Show alias if showing real name */}
                    {isFriend && user.realName && (
                        <p className="text-white/70">@{user.alias}</p>
                    )}

                    {/* Trust Badge */}
                    {user.trustLevel && user.trustLevel >= 3 && (
                        <div className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-white/20 rounded-full text-sm">
                            <Shield className="w-4 h-4" />
                            <span>Trust Level {user.trustLevel}</span>
                        </div>
                    )}

                    {/* Distance */}
                    {user.distanceKm !== undefined && (
                        <div className="flex items-center justify-center gap-1 mt-2 text-white/70 text-sm">
                            <MapPin className="w-4 h-4" />
                            <span>{user.distanceKm < 1 ? `${Math.round(user.distanceKm * 1000)}m` : `${user.distanceKm.toFixed(1)}km`} away</span>
                        </div>
                    )}

                    {/* Action Button */}
                    <div className="mt-6">
                        {status === 'NONE' && (
                            <button
                                onClick={() => sendRequestMutation.mutate()}
                                disabled={sendRequestMutation.isPending}
                                className="flex items-center gap-2 mx-auto px-6 py-3 bg-white text-primary-purple rounded-full font-semibold hover:bg-gray-100 transition-colors"
                            >
                                <UserPlus className="w-5 h-5" />
                                <span>Send Friend Request</span>
                            </button>
                        )}

                        {status === 'PENDING_SENT' && (
                            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 rounded-full">
                                <Clock className="w-5 h-5" />
                                <span>Request Pending</span>
                            </div>
                        )}

                        {status === 'PENDING_RECEIVED' && (
                            <div className="text-center">
                                <p className="text-white/70 mb-3">Wants to connect with you</p>
                                <div className="flex gap-3 justify-center">
                                    <button
                                        className="px-6 py-3 bg-white text-green-600 rounded-full font-semibold hover:bg-gray-100 transition-colors"
                                    >
                                        Accept
                                    </button>
                                    <button
                                        className="px-6 py-3 bg-white/20 rounded-full font-semibold hover:bg-white/30 transition-colors"
                                    >
                                        Decline
                                    </button>
                                </div>
                            </div>
                        )}

                        {isFriend && (
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => navigate(`/messages?userId=${userId}`)}
                                    className="flex items-center gap-2 px-6 py-3 bg-white text-primary-purple rounded-full font-semibold hover:bg-gray-100 transition-colors"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    <span>Send Message</span>
                                </button>
                                <button
                                    onClick={() => removeFriendMutation.mutate()}
                                    disabled={removeFriendMutation.isPending}
                                    className="flex items-center gap-2 px-6 py-3 bg-white/20 rounded-full font-semibold hover:bg-white/30 transition-colors"
                                >
                                    <UserMinus className="w-5 h-5" />
                                    <span>Remove Friend</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-2xl mx-auto px-4 py-6">
                {/* Bio */}
                {user.bio && (
                    <div className="bg-white rounded-xl shadow-md p-4 mb-4">
                        <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                        <p className="text-gray-600">{user.bio}</p>
                    </div>
                )}

                {/* Privacy Notice for non-friends */}
                {!isFriend && (
                    <div className="bg-gray-100 rounded-xl p-4 text-center">
                        <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 text-sm">
                            Connect with @{user.alias} to see their real name and full profile
                        </p>
                    </div>
                )}
            </div>

            {/* Block Confirmation Modal */}
            {showBlockConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Block User?</h3>
                        <p className="text-gray-600 mb-4">
                            @{user.alias} won't be able to see your posts or contact you. They won't be notified.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowBlockConfirm(false)}
                                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => blockMutation.mutate()}
                                disabled={blockMutation.isPending}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                            >
                                {blockMutation.isPending ? 'Blocking...' : 'Block'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
