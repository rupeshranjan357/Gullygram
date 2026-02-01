import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Calendar, Search, Loader } from 'lucide-react';
import { eventService } from '@/services/eventService';
import { PostCard } from '@/components/PostCard';
import { FeedPost } from '@/services/feedService';

export const Events: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'CITY' | 'NEARBY'>('CITY');
    const [city, setCity] = useState('Bangalore');
    const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
    const [radius, setRadius] = useState(5);

    // Get Location for Nearby Search
    useEffect(() => {
        if (activeTab === 'NEARBY' && !location) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
                (err) => console.error(err)
            );
        }
    }, [activeTab]);

    const { data: cityEvents, isLoading: loadingCity } = useQuery({
        queryKey: ['events', 'city', city],
        queryFn: () => eventService.getEventsByCity(city),
        enabled: activeTab === 'CITY',
    });

    const { data: nearbyEvents, isLoading: loadingNearby } = useQuery({
        queryKey: ['events', 'nearby', location?.lat, location?.lon, radius],
        queryFn: () => location ? eventService.getEventsNearby(location.lat, location.lon, radius) : Promise.resolve([]),
        enabled: activeTab === 'NEARBY' && !!location,
    });

    const events = activeTab === 'CITY' ? cityEvents : nearbyEvents;
    const isLoading = activeTab === 'CITY' ? loadingCity : loadingNearby;

    return (
        <div className="pb-20 min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white sticky top-0 z-10 shadow-sm">
                <div className="px-4 py-3">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Discover Events 🎉
                    </h1>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                    <button
                        onClick={() => setActiveTab('CITY')}
                        className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${activeTab === 'CITY' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'
                            }`}
                    >
                        In My City
                    </button>
                    <button
                        onClick={() => setActiveTab('NEARBY')}
                        className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${activeTab === 'NEARBY' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'
                            }`}
                    >
                        Near Me
                    </button>
                </div>

                {/* Filters */}
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                    {activeTab === 'CITY' ? (
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="Enter city name..."
                                className="w-full pl-9 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-purple-500 text-sm"
                            />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-purple-600" />
                                    <span>Within <strong>{radius} km</strong></span>
                                </div>
                                <span className="text-xs text-gray-400">Max 50km</span>
                            </div>
                            <input
                                type="range"
                                min="5"
                                max="50"
                                value={radius}
                                onChange={(e) => setRadius(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Event List */}
            <div className="max-w-xl mx-auto p-4 space-y-4">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader className="w-8 h-8 animate-spin text-purple-600" />
                    </div>
                ) : events && events.length > 0 ? (
                    events.map((post: FeedPost) => (
                        <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <PostCard post={post} />
                            {/* Overlay Event Details if needed specifically, but PostCard handles display */}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No upcoming events found in {activeTab === 'CITY' ? city : 'your area'}.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
