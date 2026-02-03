import React, { useState } from 'react';
import { MapPin, Navigation, Search } from 'lucide-react';
import { useLocationStore } from '@/store/locationStore';
import { geocodingService } from '@/services/geocodingService';
import { Button } from './ui/Button';

export const LocationSettings: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const {
        coords,
        radius,
        mode,
        setLocation,
        setRadius
    } = useLocationStore((state: any) => state); // Using any temporarily for quick proto

    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const handleGPSClick = () => {
        // Mocking GPS refresh for now since it's a store action validation
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            const label = await geocodingService.reverseGeocode(lat, lon);

            setLocation({ lat, lon }, label, 'GPS');
            onClose();
        });
    };

    const handleManualSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        const result = await geocodingService.searchAddress(searchQuery);
        setIsSearching(false);

        if (result) {
            setLocation(
                { lat: result.lat, lon: result.lon },
                result.display_name.split(',')[0], // Short name
                'MANUAL'
            );
            onClose();
        } else {
            alert('Location not found');
        }
    };

    const [magicClicks, setMagicClicks] = useState(0);
    const [isSeeding, setIsSeeding] = useState(false);

    const handleMagicClick = () => {
        const newCount = magicClicks + 1;
        setMagicClicks(newCount);
        if (newCount === 3) {
            // Reveal button
        }
    };

    const handleMagicSeed = async () => {
        if (isSeeding || !coords) return;
        setIsSeeding(true);
        try {
            // Call Backend Magic Seed
            // We use fetch directly or a service. Let's use fetch for speed.
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:8080/api/admin/seed/magic?lat=${coords.lat}&lon=${coords.lon}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert('✨ Area Populated with Real-Time Data!');
            onClose(); // Close to see feed
            window.location.reload(); // Hard refresh to force feed update
        } catch (e) {
            alert('Magic failed :(');
        } finally {
            setIsSeeding(false);
            setMagicClicks(0);
        }
    };

    return (
        <div className="bg-white p-6 rounded-t-xl sm:rounded-xl">
            <div className="flex justify-between items-center mb-4">
                <h3
                    className="text-lg font-bold select-none cursor-pointer active:scale-95 transition-transform"
                    onClick={handleMagicClick}
                >
                    Discovery Settings {magicClicks >= 3 && '✨'}
                </h3>
                {magicClicks >= 3 && (
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleMagicSeed}
                        disabled={isSeeding}
                        className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0"
                    >
                        {isSeeding ? '✨ Casting...' : '✨ Magic Populate'}
                    </Button>
                )}
            </div>

            {/* Mode Selection */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={handleGPSClick}
                    className={`flex-1 p-3 rounded-lg border flex items-center justify-center gap-2 ${mode === 'GPS' ? 'bg-purple-50 border-primary-purple text-primary-purple' : 'border-gray-200'
                        }`}
                >
                    <Navigation className="w-5 h-5" />
                    <span className="font-medium">Use GPS</span>
                </button>
                <div className={`flex-1 p-3 rounded-lg border flex items-center justify-center gap-2 ${mode === 'MANUAL' ? 'bg-purple-50 border-primary-purple text-primary-purple' : 'border-gray-200'
                    }`}>
                    <MapPin className="w-5 h-5" />
                    <span className="font-medium">Manual</span>
                </div>
            </div>

            {/* Manual Search Input */}
            <div className="relative mb-6">
                <input
                    type="text"
                    placeholder="Enter locality (e.g. Whitefield)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-purple transition-colors"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                <Button
                    size="sm"
                    className="absolute right-1.5 top-1.5"
                    onClick={handleManualSearch}
                    disabled={isSearching}
                >
                    {isSearching ? '...' : 'Set'}
                </Button>
            </div>

            {/* Radius Slider */}
            <div className="mb-8">
                <div className="flex justify-between mb-2">
                    <span className="text-gray-700 font-medium">Radius</span>
                    <span className="text-primary-purple font-bold">{radius} km</span>
                </div>
                <input
                    type="range"
                    min="1"
                    max="50"
                    value={radius}
                    onChange={(e) => setRadius(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-purple"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Street (1km)</span>
                    <span>Region (50km)</span>
                </div>
            </div>

            <Button onClick={onClose} variant="primary" className="w-full">
                Done
            </Button>
        </div>
    );
};
