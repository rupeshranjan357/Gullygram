import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Plus, MapPin, Zap, RefreshCw, Loader } from 'lucide-react';
import { feedService, FeedResponse } from '@/services/feedService';
import { PostCard } from '@/components/PostCard';
import { Button } from '@/components/ui/Button';
import { BottomNav } from '@/components/BottomNav';
import { useAuthStore } from '@/store/authStore';

export const Feed: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
    const [radius, setRadius] = useState<number>(10);
    const [interestBoost, setInterestBoost] = useState<boolean>(true);
    const [locationError, setLocationError] = useState<string>('');

    // Get user location on mount
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

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
                    setLocationError('Unable to get your location. Using default location.');
                    // Fallback to MG Road, Bangalore
                    setLocation({ lat: 12.9716, lon: 77.5946 });
                }
            );
        } else {
            setLocationError('Geolocation not supported. Using default location.');
            setLocation({ lat: 12.9716, lon: 77.5946 });
        }
    }, [isAuthenticated, navigate]);

    const {
        data: feedData,
        isLoading,
        isError,
        refetch,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteQuery<FeedResponse>({
        queryKey: ['feed', location, radius, interestBoost],
        queryFn: ({ pageParam = 0 }) => feedService.getFeed({
            lat: location!.lat,
            lon: location!.lon,
            radiusKm: radius,
            interestBoost,
            page: pageParam as number,
            size: 20
        }),
        getNextPageParam: (lastPage) => {
            return lastPage.hasNext ? lastPage.currentPage + 1 : undefined;
        },
        initialPageParam: 0,
        enabled: !!location,
        refetchOnWindowFocus: false
    });

    const handleRefresh = () => {
        refetch();
    };

    if (!location && !locationError) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-12 h-12 animate-spin text-primary-purple mx-auto mb-4" />
                    <p className="text-gray-600">Getting your location...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold text-gray-900">Feed</h1>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleRefresh}
                                disabled={isLoading}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                                onClick={() => navigate('/create-post')}
                                className="flex items-center gap-2 bg-primary-purple text-white px-4 py-2 rounded-full hover:bg-purple-700 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                <span className="font-semibold">Post</span>
                            </button>
                        </div>
                    </div>

                    {/* Location Alert */}
                    {locationError && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                            <p className="text-sm text-yellow-800">{locationError}</p>
                        </div>
                    )}

                    {/* Filters */}
                    <div className="flex items-center gap-3 overflow-x-auto pb-2">
                        {/* Radius Selector */}
                        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2">
                            <MapPin className="w-4 h-4 text-gray-600" />
                            <select
                                value={radius}
                                onChange={(e) => setRadius(Number(e.target.value))}
                                className="bg-transparent text-sm font-semibold text-gray-700 focus:outline-none"
                            >
                                <option value={5}>5 km</option>
                                <option value={10}>10 km</option>
                                <option value={20}>20 km</option>
                                <option value={30}>30 km</option>
                                <option value={50}>50 km</option>
                            </select>
                        </div>

                        {/* Interest Boost Toggle */}
                        <button
                            onClick={() => setInterestBoost(!interestBoost)}
                            className={`flex items-center gap-2 rounded-full px-3 py-2 transition-colors ${interestBoost
                                ? 'bg-primary-purple text-white'
                                : 'bg-gray-100 text-gray-700'
                                }`}
                        >
                            <Zap className="w-4 h-4" />
                            <span className="text-sm font-semibold">Interest Boost</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Feed Content */}
            <div className="max-w-2xl mx-auto px-4 py-6">
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-xl shadow-md p-4 animate-pulse">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : isError ? (
                    <div className="bg-white rounded-xl shadow-md p-8 text-center">
                        <p className="text-red-600 mb-4">Failed to load feed</p>
                        <Button onClick={handleRefresh} variant="primary">
                            Try Again
                        </Button>
                    </div>
                ) : feedData?.pages[0]?.posts.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-8 text-center">
                        <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No posts nearby</h3>
                        <p className="text-gray-600 mb-4">
                            Be the first to post in your area!
                        </p>
                        <Button onClick={() => navigate('/create-post')} variant="primary">
                            Create Post
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {feedData?.pages.map((page, i) => (
                            <React.Fragment key={i}>
                                {page.posts.map((post) => (
                                    <PostCard key={post.id} post={post} />
                                ))}
                            </React.Fragment>
                        ))}

                        {/* Load More */}
                        {hasNextPage && (
                            <div className="text-center pt-4">
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    onClick={() => fetchNextPage()}
                                    disabled={isFetchingNextPage}
                                >
                                    {isFetchingNextPage ? 'Loading...' : 'Load More'}
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Navigation */}
            <BottomNav />
        </div>
    );
};
