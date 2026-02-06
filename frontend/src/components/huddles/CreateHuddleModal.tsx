import React, { useState } from 'react';
import { X, MapPin, Users } from 'lucide-react';
import { useLocationStore } from '@/store/locationStore';
import { huddleService } from '@/services/huddleService';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CreateHuddleModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type TimeOption = 'NOW' | '1H' | 'TONIGHT' | 'TOMORROW';

export const CreateHuddleModal: React.FC<CreateHuddleModalProps> = ({ isOpen, onClose }) => {
    const { coords, addressLabel } = useLocationStore();
    const queryClient = useQueryClient();

    // Form State
    const [title, setTitle] = useState('');
    const [selectedTime, setSelectedTime] = useState<TimeOption>('NOW');
    const [squadSize, setSquadSize] = useState(4);
    const [womenOnly, setWomenOnly] = useState(false);
    const [friendsOfFriends, setFriendsOfFriends] = useState(true);

    // Mutation
    const createMutation = useMutation({
        mutationFn: async () => {
            if (!coords) throw new Error("Location not found");

            // Calculate Start/End Time based on selection
            const now = new Date();
            let startTime = new Date(now);
            let endTime = new Date(now);

            switch (selectedTime) {
                case 'NOW':
                    startTime = now;
                    endTime.setHours(startTime.getHours() + 2); // Default 2h duration
                    break;
                case '1H':
                    startTime.setHours(now.getHours() + 1);
                    endTime.setHours(startTime.getHours() + 2);
                    break;
                case 'TONIGHT':
                    startTime.setHours(20, 0, 0, 0); // 8 PM
                    if (now.getHours() >= 20) startTime.setDate(now.getDate() + 1); // Next day if already late
                    endTime = new Date(startTime);
                    endTime.setHours(startTime.getHours() + 3);
                    break;
                case 'TOMORROW':
                    startTime.setDate(now.getDate() + 1);
                    startTime.setHours(10, 0, 0, 0); // 10 AM default
                    endTime = new Date(startTime);
                    endTime.setHours(startTime.getHours() + 2);
                    break;
            }

            return huddleService.createHuddle({
                title,
                description: `Huddle created via Quick Start`,
                lat: coords.lat,
                lon: coords.lon,
                locationName: addressLabel || 'Current Location',
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                maxParticipants: squadSize,
                genderFilter: womenOnly ? 'WOMEN_ONLY' : 'EVERYONE'
                // Note: friendsOfFriends is UI-only for now until backend support
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['huddles'] });
            onClose();
            // Optional: reset form
            setTitle('');
        },
        onError: (err) => {
            alert('Failed to create Huddle. Please try again.');
            console.error(err);
        }
    });

    const handleSubmit = () => {
        if (!title.trim()) {
            alert('Please tell us what we are doing!');
            return;
        }
        createMutation.mutate();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with blur */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Card - Glassmorphism */}
            <div className="relative w-full max-w-sm bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden border border-white/50 animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-2">
                    <button
                        onClick={onClose}
                        className="p-2 bg-gray-100/80 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-900">Start a Huddle</h2>
                    <div className="w-9" /> {/* Spacer for centering */}
                </div>

                <div className="p-6 space-y-6">

                    {/* Title Input */}
                    <div className="bg-white/60 rounded-3xl p-4 shadow-sm border border-white">
                        <label className="block text-xl font-semibold text-gray-800 mb-1">
                            What are we doing?
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Badminton Match, Late Night Coffee..."
                            className="w-full bg-transparent border-none text-gray-600 placeholder-gray-400 focus:ring-0 p-0 text-base"
                            autoFocus
                        />
                    </div>

                    {/* Time Selector */}
                    <div className="bg-white/60 rounded-[2rem] p-2 shadow-sm border border-white flex justify-between">
                        {(['NOW', '1H', 'TONIGHT', 'TOMORROW'] as TimeOption[]).map((opt) => (
                            <button
                                key={opt}
                                onClick={() => setSelectedTime(opt)}
                                className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${selectedTime === opt
                                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {opt === 'NOW' ? 'Now' : opt === '1H' ? 'in 1h' : opt === 'TONIGHT' ? 'Tonight' : 'Tomorrow'}
                            </button>
                        ))}
                    </div>

                    {/* Location Card */}
                    <div className="relative overflow-hidden rounded-[2rem] bg-white/60 shadow-sm border border-white p-3">
                        {/* Fake Map Background */}
                        <div className="absolute inset-0 opacity-20 pointer-events-none">
                            <div className="w-full h-full bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/77.5946,12.9716,14,0/400x100?access_token=pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGZ5cCJ9')] bg-cover bg-center" />
                        </div>

                        <div className="relative flex items-center justify-between z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-primary-purple shadow-inner">
                                    <MapPin className="w-5 h-5 fill-current" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500 font-medium">Location</span>
                                    <span className="text-sm font-bold text-gray-800 truncate max-w-[120px]">
                                        {addressLabel || 'Indiranagar Club'}
                                    </span>
                                </div>
                            </div>
                            <button className="bg-primary-purple text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-purple-200">
                                Change
                            </button>
                        </div>
                    </div>

                    {/* Squad Size Slider */}
                    <div className="bg-white/60 rounded-[2rem] p-5 shadow-sm border border-white">
                        <div className="flex justify-between items-center mb-4">
                            <span className="font-semibold text-gray-800">Squad Size</span>
                            <span className="text-xl font-bold text-primary-purple">{squadSize}</span>
                        </div>
                        <input
                            type="range"
                            min="2"
                            max="20"
                            step="1"
                            value={squadSize}
                            onChange={(e) => setSquadSize(parseInt(e.target.value))}
                            className="w-full h-2 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-primary-purple"
                        />
                    </div>

                    {/* Trust & Safety Toggles */}
                    <div className="flex gap-4">
                        {/* Women Only */}
                        <div className={`flex-1 rounded-[1.5rem] p-3 border transition-all ${womenOnly
                            ? 'bg-pink-50 border-pink-200 shadow-[0_0_20px_rgba(236,72,153,0.15)]'
                            : 'bg-white/60 border-white'
                            }`}>
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-1 text-pink-500">
                                    <span className="text-lg">♀</span>
                                    <span className="text-xs font-bold leading-tight">Women<br />Only</span>
                                </div>
                                <div
                                    onClick={() => setWomenOnly(!womenOnly)}
                                    className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${womenOnly ? 'bg-pink-500' : 'bg-gray-300'
                                        }`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${womenOnly ? 'translate-x-4' : ''
                                        }`} />
                                </div>
                            </div>
                        </div>

                        {/* Friends of Friends */}
                        <div className={`flex-1 rounded-[1.5rem] p-3 border transition-all ${friendsOfFriends
                            ? 'bg-indigo-50 border-indigo-200 shadow-[0_0_20px_rgba(99,102,241,0.15)]'
                            : 'bg-white/60 border-white'
                            }`}>
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-1 text-indigo-500">
                                    <Users className="w-4 h-4" />
                                    <span className="text-xs font-bold leading-tight">Friends of<br />Friends</span>
                                </div>
                                <div
                                    onClick={() => setFriendsOfFriends(!friendsOfFriends)}
                                    className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${friendsOfFriends ? 'bg-indigo-500' : 'bg-gray-300'
                                        }`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${friendsOfFriends ? 'translate-x-4' : ''
                                        }`} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={createMutation.isPending}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 rounded-[2rem] shadow-xl shadow-purple-200 transform transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {createMutation.isPending ? 'Lighting the Signal...' : 'Light the Signal 🚀'}
                    </button>

                </div>
            </div>
        </div>
    );
};
