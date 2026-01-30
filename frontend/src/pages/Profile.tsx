import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Lock, Edit2, Camera, Calendar, Bookmark, ArrowLeft, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { InterestPill } from '@/components/ui/InterestPill';
import { BottomNav } from '@/components/BottomNav';
import { profileService } from '@/services/profileService';
import { interestService } from '@/services/interestService';
import { useAuthStore } from '@/store/authStore';

export const Profile: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { isAuthenticated, alias } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'posts' | 'events' | 'saved'>('posts');
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        alias: '',
        realName: '',
        bio: ''
    });

    const { data: profileData, isLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: profileService.getProfile,
        enabled: isAuthenticated,
    });

    const { data: interests } = useQuery({
        queryKey: ['myInterests'],
        queryFn: interestService.getMyInterests,
    });

    // Initialize radius from profile data
    const [radius, setRadius] = useState(10);
    const [originalRadius, setOriginalRadius] = useState(10);

    useEffect(() => {
        if (profileData) {
            setRadius(profileData.defaultRadiusKm || 10);
            setOriginalRadius(profileData.defaultRadiusKm || 10);
            setEditForm({
                alias: profileData.alias || '',
                realName: profileData.realName || '',
                bio: profileData.bio || ''
            });
        }
    }, [profileData]);

    const updateProfileMutation = useMutation({
        mutationFn: profileService.updateProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            setIsEditing(false);
            setOriginalRadius(radius);
        },
        onError: (error: any) => {
            alert(`Failed to update profile: ${error.message}`);
        }
    });

    const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRadius(parseInt(e.target.value));
    };

    const handleSaveRadius = () => {
        updateProfileMutation.mutate({ defaultRadiusKm: radius });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateProfileMutation.mutate({
            alias: editForm.alias,
            realName: editForm.realName,
            bio: editForm.bio
        });
    };

    if (isLoading) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 relative">
            {/* Edit Profile Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={24} />
                        </button>
                        <h2 className="text-xl font-bold mb-6">Edit Profile</h2>

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <Input
                                label="Alias (Username)"
                                value={editForm.alias}
                                onChange={(e) => setEditForm(prev => ({ ...prev, alias: e.target.value }))}
                            />
                            <Input
                                label="Real Name"
                                value={editForm.realName}
                                onChange={(e) => setEditForm(prev => ({ ...prev, realName: e.target.value }))}
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                <textarea
                                    value={editForm.bio}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent resize-none"
                                    rows={3}
                                    maxLength={160}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                loading={updateProfileMutation.isPending}
                            >
                                Save Changes
                            </Button>
                        </form>
                    </div>
                </div>
            )}

            {/* Navigation Icons */}
            <div className="absolute top-4 left-4 z-10">
                <button
                    onClick={() => navigate('/feed')}
                    className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
            </div>
            <div className="absolute top-4 right-4 z-10">
                <button
                    onClick={() => navigate('/settings')}
                    className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                >
                    <Settings size={24} />
                </button>
            </div>

            {/* Profile Header with Gradient */}
            <div className="gradient-purple-blue pt-12 pb-24 px-6">
                <div className="max-w-md mx-auto">
                    <div className="text-center text-white mb-4">
                        <h1 className="text-2xl font-bold">GullyGram</h1>
                    </div>
                </div>
            </div>

            {/* Profile Content */}
            <div className="max-w-md mx-auto px-6 -mt-16">
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6 animate-slide-up">
                    {/* Avatar */}
                    <div className="flex justify-center -mt-20 mb-4">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full gradient-primary p-1">
                                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-200 to-blue-200 flex items-center justify-center text-4xl font-bold text-primary-purple">
                                        {profileData?.alias?.[0]?.toUpperCase() || alias?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="absolute bottom-0 right-0 bg-primary-purple text-white p-2 rounded-full shadow-lg hover:bg-purple-700 transition-transform hover:scale-110"
                            >
                                <Edit2 size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Username and Real Name */}
                    <div className="text-center mb-2">
                        <h2 className="text-2xl font-bold text-gray-900">
                            @{profileData?.alias || alias || 'username'}
                        </h2>
                        <div className="flex items-center justify-center gap-1 text-gray-600 mt-1">
                            <span className="text-sm">{profileData?.realName || 'Real Name'}</span>
                            <Lock size={14} />
                        </div>
                    </div>

                    {/* Bio */}
                    <p className="text-center text-gray-600 text-sm mb-4 break-words">
                        {profileData?.bio || 'No bio yet.'}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">42</div>
                            <div className="text-xs text-primary-purple font-semibold">Posts</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">18</div>
                            <div className="text-xs text-primary-purple font-semibold">Friends</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">256</div>
                            <div className="text-xs text-primary-purple font-semibold">Nearby</div>
                        </div>
                    </div>
                </div>

                {/* Radius Slider Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-gray-900">Your Radius: {radius}km</h3>
                        {radius !== originalRadius && (
                            <button
                                onClick={handleSaveRadius}
                                disabled={updateProfileMutation.isPending}
                                className="text-primary-purple text-sm font-semibold flex items-center gap-1 hover:text-purple-700"
                            >
                                <Save size={16} />
                                Save
                            </button>
                        )}
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="50"
                        step="1"
                        value={radius}
                        onChange={handleRadiusChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-purple"
                    />
                    <div className="flex justify-between text-xs text-gray-600 mt-2">
                        <span>1km</span>
                        <span>50km</span>
                    </div>
                </div>

                {/* Interest Tags Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-gray-900">Interest tags</h3>
                        <button
                            onClick={() => navigate('/onboarding/interests')}
                            className="text-primary-purple text-sm font-semibold hover:underline"
                        >
                            Edit
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {interests && interests.length > 0 ? (
                            interests.map((interest) => (
                                <InterestPill key={interest.id} name={interest.name} />
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 italic">No interests selected</p>
                        )}
                    </div>
                </div>

                {/* Edit Profile Button */}
                <Button
                    variant="secondary"
                    size="lg"
                    className="w-full mb-6"
                    onClick={() => setIsEditing(true)}
                >
                    Edit Profile
                </Button>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-lg mb-6">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('posts')}
                            className={`flex-1 py-4 text-center font-semibold transition-colors ${activeTab === 'posts'
                                ? 'text-primary-purple border-b-2 border-primary-purple'
                                : 'text-gray-600'
                                }`}
                        >
                            <Camera className="w-5 h-5 mx-auto mb-1" />
                            Posts
                        </button>
                        <button
                            onClick={() => setActiveTab('events')}
                            className={`flex-1 py-4 text-center font-semibold transition-colors ${activeTab === 'events'
                                ? 'text-primary-purple border-b-2 border-primary-purple'
                                : 'text-gray-600'
                                }`}
                        >
                            <Calendar className="w-5 h-5 mx-auto mb-1" />
                            Events
                        </button>
                        <button
                            onClick={() => setActiveTab('saved')}
                            className={`flex-1 py-4 text-center font-semibold transition-colors ${activeTab === 'saved'
                                ? 'text-primary-purple border-b-2 border-primary-purple'
                                : 'text-gray-600'
                                }`}
                        >
                            <Bookmark className="w-5 h-5 mx-auto mb-1" />
                            Saved
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6 text-center text-gray-500">
                        {activeTab === 'posts' && 'No posts yet'}
                        {activeTab === 'events' && 'No events yet'}
                        {activeTab === 'saved' && 'No saved content yet'}
                    </div>
                </div>
            </div>

            {/* Bottom Navigation */}
            <BottomNav />
        </div>
    );
};
