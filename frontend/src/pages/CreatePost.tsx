import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Tag, Loader, X } from 'lucide-react';
import { postService } from '@/services/postService';
import { interestService } from '@/services/interestService';
import { geocodingService } from '@/services/geocodingService';
import { Button } from '@/components/ui/Button';
import { ImageUpload } from '@/components/ImageUpload';

// Quick hack for debounce timer
declare global {
    interface Window { debounceTimer: any; }
}

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
    const [friendsOnly, setFriendsOnly] = useState(false);
    const [mediaUrls, setMediaUrls] = useState<string[]>([]);

    // Event State
    const [eventDate, setEventDate] = useState('');
    const [eventCity, setEventCity] = useState('');
    const [eventLocationName, setEventLocationName] = useState('');
    const [themeSuggestions, setThemeSuggestions] = useState<any[]>([]);

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
            alert(`Failed to create post: ${error.message || 'Unknown error'}`);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!text.trim() || !location) {
            return;
        }

        createPostMutation.mutate({
            text: text.trim(),
            type,
            latitude: location.lat,
            longitude: location.lon,
            visibilityRadiusKm: radius,
            interestIds: selectedInterests.length > 0 ? selectedInterests : undefined,
            friendsOnly: friendsOnly,
            mediaUrls: mediaUrls.filter(Boolean),
            eventDate: type === 'EVENT_PROMO' ? eventDate : undefined,
            eventCity: type === 'EVENT_PROMO' ? eventCity : undefined,
            eventLocationName: type === 'EVENT_PROMO' ? eventLocationName : undefined,
        });
    };

    const toggleInterest = (interestId: number) => {
        setSelectedInterests(prev =>
            prev.includes(interestId)
                ? prev.filter(id => id !== interestId)
                : [...prev, interestId]
        );
    };

    const handleImageUploaded = (url: string) => {
        if (url) {
            setMediaUrls(prev => [...prev, url]);
        }
    };

    const removeImage = (indexToRemove: number) => {
        setMediaUrls(prev => prev.filter((_, index) => index !== indexToRemove));
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
                    {/* Text Input & Post Type */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                What's happening?
                            </label>
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Share something with your local community..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent resize-none"
                                rows={4}
                                maxLength={1000}
                                required
                            />
                            <div className="flex justify-between mt-2">
                                <span className="text-sm text-gray-500">
                                    {text.length}/1000 characters
                                </span>
                            </div>
                        </div>

                        {/* Inline Image Preview */}
                        {mediaUrls.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {mediaUrls.map((url, index) => (
                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                                        <img src={url} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add Photo Button - Show only if less than 4 images */}
                        {mediaUrls.length < 4 && (
                            <div className="pb-4 border-b border-gray-100 mb-6 relative" style={{ minHeight: '220px' }}>
                                <div className="inline-block relative">
                                    <ImageUpload
                                        currentImageUrl=""
                                        onImageUploaded={handleImageUploaded}
                                        folder="posts"
                                        label={mediaUrls.length === 0 ? "Add Photos" : "Add Another"}
                                        className="w-full md:w-48 h-48"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Max 4 photos</p>
                            </div>
                        )}
                        {/* Event Details (Only for EVENT_PROMO) */}
                        {type === 'EVENT_PROMO' && (
                            <div className="mt-8 space-y-6 bg-purple-50 p-6 rounded-lg border border-purple-100 relative z-0">
                                <h3 className="font-bold text-lg text-purple-900 border-b border-purple-200 pb-3 mb-2">Event Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-purple-900 mb-2">Event Date</label>
                                        <input
                                            type="datetime-local"
                                            className="w-full p-2.5 bg-white border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow"
                                            value={eventDate}
                                            onChange={(e) => setEventDate(e.target.value)}
                                            required={type === 'EVENT_PROMO'}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-purple-900 mb-2">City</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Bangalore"
                                            className="w-full p-2.5 bg-white border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow"
                                            value={eventCity}
                                            onChange={(e) => setEventCity(e.target.value)}
                                            required={type === 'EVENT_PROMO'}
                                        />
                                    </div>
                                    <div className="md:col-span-2 relative">
                                        <label className="block text-sm font-medium text-purple-900 mb-2">Venue / Location Name (Autofill)</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Start typing to search (e.g. Chinnaswamy Stadium)"
                                                className="w-full p-2.5 bg-white border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow pr-10"
                                                value={eventLocationName}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setEventLocationName(val);

                                                    // Simple debounce
                                                    if (window.debounceTimer) clearTimeout(window.debounceTimer);
                                                    window.debounceTimer = setTimeout(async () => {
                                                        if (val.length > 2) {
                                                            try {
                                                                console.log("Searching for:", val);
                                                                const res = await geocodingService.searchAddresses(val);
                                                                console.log("Search results:", res);
                                                                setThemeSuggestions(res || []);
                                                            } catch (err) {
                                                                console.error("Autocomplete error:", err);
                                                            }
                                                        } else {
                                                            setThemeSuggestions([]);
                                                        }
                                                    }, 300);
                                                }}
                                                required={type === 'EVENT_PROMO'}
                                            />
                                            {themeSuggestions.length > 0 && (
                                                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                                    {themeSuggestions.map((place, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            className="w-full text-left px-4 py-3 hover:bg-purple-50 border-b border-gray-100 last:border-0 text-sm transition-colors block"
                                                            onMouseDown={(e) => {
                                                                // Use onMouseDown to prevent blur before click registers
                                                                e.preventDefault();
                                                                console.log("Selected:", place);
                                                                setEventLocationName(place.display_name.split(',')[0]);

                                                                // Extract City from address object if available
                                                                if (place.address) {
                                                                    const city = place.address.city || place.address.town || place.address.village || place.address.state_district;
                                                                    if (city) setEventCity(city);
                                                                } else {
                                                                    // Fallback parsing
                                                                    const parts = place.display_name.split(',');
                                                                    if (parts.length > 2) {
                                                                        setEventCity(parts[parts.length - 3].trim());
                                                                    }
                                                                }
                                                                setThemeSuggestions([]);
                                                            }}
                                                        >
                                                            <div className="font-semibold text-gray-900">{place.display_name.split(',')[0]}</div>
                                                            <div className="text-xs text-gray-500 truncate">{place.display_name}</div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <hr className="border-gray-100" />

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

                    {/* Friends Only Toggle */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <label className="flex items-center justify-between cursor-pointer">
                            <div>
                                <div className="text-sm font-semibold text-gray-900 mb-1">
                                    🔒 Friends Only
                                </div>
                                <p className="text-xs text-gray-600">
                                    Only your friends can see this post
                                </p>
                            </div>
                            <div className="relative inline-block w-12 h-6">
                                <input
                                    type="checkbox"
                                    checked={friendsOnly}
                                    onChange={(e) => setFriendsOnly(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-primary-purple transition-colors"></div>
                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                            </div>
                        </label>
                    </div>

                    {/* Location Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                            <MapPin className="w-4 h-4 inline mr-1" />
                            Your post will be visible to people within {radius}km of your current location
                        </p>
                    </div>

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
