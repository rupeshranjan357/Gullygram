import React, { useEffect, useState } from 'react';
import { HuddleDetailsModal } from './HuddleDetailsModal';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Huddle } from '@/services/huddleService';
import { Button } from '@/components/ui/Button';

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Huddle Icon
const createHuddleIcon = (huddle: Huddle) => {
    const customIcon = L.divIcon({
        className: `custom-huddle-marker huddle-marker-${huddle.id}`,
        html: `<div data-huddle-id="${huddle.id}" data-huddle-title="${huddle.title}" class="w-8 h-8 flex items-center justify-center bg-primary-purple rounded-full border-2 border-white shadow-lg overflow-hidden">
                     <img src="${huddle.creator.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'}" 
                          class="w-full h-full object-cover" 
                          alt="${huddle.creator.alias}" />
                   </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
    return customIcon;
};

const UserLocationIcon = L.divIcon({
    className: 'user-location-marker',
    html: `<div style="
        background-color: #3B82F6; 
        width: 16px; 
        height: 16px; 
        border-radius: 50%; 
        border: 3px solid white; 
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
});

// Component to handle map centering updates
const RecenterMap = ({ lat, lon }: { lat: number; lon: number }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lon], map.getZoom());
    }, [lat, lon, map]);
    return null;
};

interface HuddleMapProps {
    huddles: Huddle[];
    userLat: number;
    userLon: number;
    radiusKm: number;
    onJoin: (huddleId: string) => void;
}

export const HuddleMap: React.FC<HuddleMapProps> = ({ huddles, userLat, userLon, onJoin }) => {
    const [selectedHuddle, setSelectedHuddle] = useState<Huddle | null>(null);

    // Get current user ID from gullygram-auth (zustand persist)
    const authDataRaw = localStorage.getItem('gullygram-auth');
    const currentUserId = authDataRaw ? JSON.parse(authDataRaw).state?.userId : null;

    return (
        <div className="h-[60vh] w-full rounded-xl overflow-hidden shadow-md relative z-0">
            <MapContainer
                center={[userLat, userLon]}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <RecenterMap lat={userLat} lon={userLon} />

                {/* User Location Marker */}
                <Marker position={[userLat, userLon]} icon={UserLocationIcon}>
                    <Popup>You are here</Popup>
                </Marker>

                {/* Huddle Markers */}
                {huddles.map((huddle) => (
                    <Marker
                        key={`${huddle.id}-${huddle.isJoined}`}
                        position={[huddle.lat, huddle.lon]}
                        icon={createHuddleIcon(huddle)}
                        eventHandlers={{
                            click: () => {
                                // Optional: You could set selected huddle here directly if you want
                                // but usually popup opens first.
                            }
                        }}
                    >
                        <Popup>
                            <div className="min-w-[200px]">
                                <h3 className="font-bold text-lg mb-1">{huddle.title}</h3>
                                <p className="text-sm text-gray-600 mb-2 truncate">{huddle.description || 'No description'}</p>

                                <div className="text-xs text-gray-500 mb-3 space-y-1">
                                    <div className="flex items-center gap-1">
                                        ⏱️ {new Date(huddle.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        👥 {huddle.currentParticipants} / {huddle.maxParticipants} joined
                                    </div>
                                    <div className="flex items-center gap-1">
                                        📍 {huddle.locationName || 'Unknown Location'}
                                    </div>
                                </div>

                                <div className="flex gap-2 flex-col">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full text-primary-purple border-primary-purple hover:bg-purple-50"
                                        onClick={() => setSelectedHuddle(huddle)}
                                    >
                                        View Details / Complete
                                    </Button>

                                    {huddle.isJoined ? (
                                        <Button size="sm" variant="outline" className="w-full" disabled>Joined ✅</Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            className="w-full bg-primary-purple hover:bg-purple-700 text-white"
                                            onClick={() => onJoin(huddle.id)}
                                            disabled={huddle.currentParticipants >= huddle.maxParticipants}
                                        >
                                            {huddle.currentParticipants >= huddle.maxParticipants ? 'Full' : 'Join'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Huddle Details Modal */}
            {selectedHuddle && (
                <HuddleDetailsModal
                    huddle={selectedHuddle}
                    isOpen={!!selectedHuddle}
                    onClose={() => setSelectedHuddle(null)}
                    onJoin={onJoin}
                    currentUserId={currentUserId}
                    onComplete={() => {
                        // Ideally we should reload huddles here. 
                        // For now we can just close the modal.
                        // In a real app we'd trigger a refetch from parent.
                        setSelectedHuddle(null);
                        window.location.reload(); // Simple reload to refresh data and show karma
                    }}
                />
            )}
        </div>
    );
};
