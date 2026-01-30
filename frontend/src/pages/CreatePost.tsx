import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Tag, Loader } from 'lucide-react';
import { postService } from '@/services/postService';
import { interestService } from '@/services/interestService';
import { Button } from '@/components/ui/Button';

const POST_TYPES = [
    { value: 'GENERAL', label: 'General', icon: '💬' },
    { value: 'EVENT_PROMO', label: 'Event', icon: '🎉' },
    { value: 'MARKETPLACE', label: 'Marketplace', icon: '🛒' },
    { value: 'LOCAL_NEWS', label: 'News', icon: '📰' },
    { value: 'MARKETING', label: 'Marketing', icon: '📢' },
] as const;

export const CreatePost: React.FC = () => {
    const navigate = useNavigate();
    const [text, setText] = useState('');
    const [type, setType] = useState<'GENERAL' | 'LOCAL_NEWS' | 'MARKETING' | 'EVENT_PROMO' | 'MARKETPLACE'>('GENERAL');
    const [radius, setRadius] = useState<number>(10);
    const [selectedInterests, setSelectedInterests] = useState<number[]>([]);
    const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
    const [locationError, setLocationError] = useState('');

    // Get user location
    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                },
                (error) => {
                    console.error('Location error:', error);
                    setLocationError('Unable to get location');
                    // Fallback location
                    setLocation({ lat: 12.9716, lon: 77.5946 });
                }
            );
        }
    }, []);

    // Get user's interests
    const { data: interests } = useQuery({
        queryKey: ['myInterests'],
        queryFn: interestService.getMyInterests,
    });

    const createPostMutation = useMutation({
        mutationFn: postService.createPost,
        onSuccess: () => {
            console.log('Post created successfully');
            navigate('/feed');
        },
        onError: (error: any) => {
            console.error('Failed to create post:', error);
            // Fallback alert if UI doesn't show it clearly
            alert(`Failed to create post: ${error.message || 'Unknown error'}`);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submitting post...', { text, type, location, radius, selectedInterests });

        if (!text.trim() || !location) {
            console.warn('Validation failed: text or location missing');
            return;
        }

        createPostMutation.mutate({
            text: text.trim(),
            type,
            latitude: location.lat,
            longitude: location.lon,
            visibilityRadiusKm: radius,
            interestIds: selectedInterests.length > 0 ? selectedInterests : undefined,
        });
    };

    const toggleInterest = (interestId: number) => {
        setSelectedInterests(prev =>
            prev.includes(interestId)
                ? prev.filter(id => id !== interestId)
                : [...prev, interestId]
        );
    };

    if (!location) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-12 h-12 animate-spin text-primary-purple mx-auto mb-4" />
                    <p className="text-gray-600">Getting your location...</p>
                    {locationError && (
                        <p className="text-sm text-yellow-600 mt-2">{locationError}</p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/feed')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-semibold">Back</span>
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">Create Post</h1>
                    <div className="w-20"></div> {/* Spacer for centering */}
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-6">
                <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
                    {/* Text Input */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            What's happening?
                        </label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Share something with your local community..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent resize-none"
                            rows={6}
                            maxLength={1000}
                            required
                        />
                        <div className="flex justify-between mt-2">
                            <span className="text-sm text-gray-500">
                                {text.length}/1000 characters
                            </span>
                        </div>
                    </div>

                    {/* Post Type */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Post Type
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                            {POST_TYPES.map((postType) => (
                                <button
                                    key={postType.value}
                                    type="button"
                                    onClick={() => setType(postType.value)}
                                    className={`p-3 rounded-lg border-2 transition-all ${type === postType.value
                                            ? 'border-primary-purple bg-purple-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="text-2xl mb-1">{postType.icon}</div>
                                    <div className="text-xs font-semibold text-gray-700">
                                        {postType.label}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Visibility Radius */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            <MapPin className="w-4 h-4 inline mr-1" />
                            Visibility Radius: {radius}km
                        </label>
                        <input
                            type="range"
                            min="5"
                            max="50"
                            step="5"
                            value={radius}
                            onChange={(e) => setRadius(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-purple"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>5km</span>
                            <span>50km</span>
                        </div>
                    </div>

                    {/* Interest Tags */}
                    {interests && interests.length > 0 && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                <Tag className="w-4 h-4 inline mr-1" />
                                Tag Interests (Optional)
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {interests.map((interest) => (
                                    <button
                                        key={interest.id}
                                        type="button"
                                        onClick={() => toggleInterest(interest.id)}
                                        className={`px-3 py-2 rounded-full text-sm font-semibold transition-all ${selectedInterests.includes(interest.id)
                                                ? 'bg-primary-purple text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        #{interest.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Location Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                            <MapPin className="w-4 h-4 inline mr-1" />
                            Your post will be visible to people within {radius}km of your current location
                        </p>
                    </div>

                    {/* Error Display */}
                    {createPostMutation.isError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-800">
                                Failed to create post. Please try again.
                            </p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            size="lg"
                            className="flex-1"
                            onClick={() => navigate('/feed')}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="flex-1"
                            disabled={!text.trim() || createPostMutation.isPending}
                            loading={createPostMutation.isPending}
                        >
                            Post
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};
