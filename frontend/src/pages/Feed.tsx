import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Plus, RefreshCw, Loader, Sliders } from 'lucide-react';
import { feedService, FeedResponse } from '@/services/feedService';
import { PostCard } from '@/components/PostCard';
import { Button } from '@/components/ui/Button';
import { BottomNav } from '@/components/BottomNav';
import { useAuthStore } from '@/store/authStore';
import { useLocationStore } from '@/store/locationStore';
import { ComingSoonView } from '@/components/ComingSoonView';
import { LocationSettings } from '@/components/LocationSettings';

export const Feed: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();

    // Global Location State
    const {
        coords,
        radius,
        addressLabel,
        isSupportedZone,
        setLocation
    } = useLocationStore();

    const [interestBoost, setInterestBoost] = useState<boolean>(true);
    const [showSettings, setShowSettings] = useState(false);

    // Initial Location Check
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        // If no location set yet, try GPS once
        if (!coords) {
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setLocation(
                            { lat: position.coords.latitude, lon: position.coords.longitude },
                            'Current Location',
                            'GPS'
                        );
                    },
                    (error) => {
                        console.error('Location error:', error);
                        // Default fallback if GPS fails
                        setLocation({ lat: 12.9716, lon: 77.5946 }, 'Bangalore Default', 'MANUAL');
                    }
                );
            }
        }
    }, [isAuthenticated, navigate, coords, setLocation]);

    const {
        data: feedData,
        isLoading,
        isError,
        refetch,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteQuery<FeedResponse>({
        queryKey: ['feed', coords, radius, interestBoost],
        queryFn: ({ pageParam = 0 }) => feedService.getFeed({
            lat: coords!.lat,
            lon: coords!.lon,
            radiusKm: radius,
            interestBoost,
            page: pageParam as number,
            size: 20
        }),
        getNextPageParam: (lastPage) => {
            return lastPage.hasNext ? lastPage.currentPage + 1 : undefined;
        },
        initialPageParam: 0,
        enabled: !!coords && isSupportedZone, // Only fetch if allowed
        refetchOnWindowFocus: false
    });

    const handleRefresh = () => {
        refetch();
    };

    if (!coords) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-12 h-12 animate-spin text-primary-purple mx-auto mb-4" />
                    <p className="text-gray-600">Locating you...</p>
                </div>
            </div>
        );
    }

    // BETA ZONE BLOCKER
    if (!isSupportedZone) {
        return (
            <div className="min-h-screen bg-gray-50 pb-20">
                {/* Header (Simplified) */}
                <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-4 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-900">GullyGram Beta</h1>
                    <button onClick={() => setShowSettings(true)} className="text-primary-purple text-sm font-semibold">
                        {addressLabel}
                    </button>
                </div>

                <ComingSoonView onChangeLocation={() => setShowSettings(true)} />

                {showSettings && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
                        <div className="w-full max-w-md">
                            <LocationSettings onClose={() => setShowSettings(false)} />
                        </div>
                    </div>
                )}
                <BottomNav />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-bold text-gray-900">Feed</h1>
                            <button
                                onClick={() => setShowSettings(true)}
                                className="text-xs font-semibold text-primary-purple flex items-center gap-1"
                            >
                                📍 {addressLabel} ({radius}km)
                            </button>
                        </div>

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

                    {/* Filters Row */}
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        <button
                            onClick={() => setShowSettings(true)}
                            className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 whitespace-nowrap"
                        >
                            <Sliders className="w-3 h-3" />
                            Radius: {radius}km
                        </button>
                        {/* Interest Boost Toggle */}
                        <button
                            onClick={() => setInterestBoost(!interestBoost)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${interestBoost
                                    ? 'bg-purple-50 border-purple-200 text-primary-purple'
                                    : 'bg-white border-gray-200 text-gray-600'
                                }`}
                        >
                            ⚡ Interest Boost: {interestBoost ? 'ON' : 'OFF'}
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
                                <div className="h-40 bg-gray-200 rounded mb-4"></div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : isError ? (
                    <div className="text-center py-10">
                        <p className="text-red-500 mb-2">Something went wrong</p>
                        <Button variant="secondary" onClick={handleRefresh}>Retry</Button>
                    </div>
                ) : feedData?.pages[0]?.posts.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-8 text-center">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Target Zero!</h3>
                        <p className="text-gray-600 mb-4">
                            You are the first explorer in {addressLabel}.
                        </p>
                        <Button onClick={() => navigate('/create-post')} variant="primary">
                            Plant the First Flag 🚩
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
                        {hasNextPage && (
                            <div className="text-center pt-4">
                                <Button
                                    variant="secondary"
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

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
                    <div className="w-full max-w-md">
                        <LocationSettings onClose={() => setShowSettings(false)} />
                    </div>
                </div>
            )}

            <BottomNav />
        </div>
    );
};

