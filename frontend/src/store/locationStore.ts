import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Coordinates {
    lat: number;
    lon: number;
}

interface BetaZone {
    name: string;
    lat: number;
    lon: number;
    radius: number; // meters
}

// DEFINING BETA ZONES
const BETA_ZONES: BetaZone[] = [
    {
        name: 'Whitefield',
        lat: 12.9698,
        lon: 77.7499,
        radius: 6000 // 6km
    },
    {
        name: 'Marathahalli',
        lat: 12.9591,
        lon: 77.6974,
        radius: 4000 // 4km
    },
    {
        name: 'Indiranagar',
        lat: 12.9716,
        lon: 77.6412,
        radius: 5000 // 5km
    },
    {
        name: 'Koramangala',
        lat: 12.9352,
        lon: 77.6245,
        radius: 5000 // 5km
    }
];

interface LocationState {
    coords: Coordinates | null;
    radius: number; // in km
    addressLabel: string;
    mode: 'GPS' | 'MANUAL';
    isSupportedZone: boolean;

    // Actions
    setLocation: (coords: Coordinates, label: string, mode: 'GPS' | 'MANUAL') => void;
    setRadius: (km: number) => void;
    checkZone: (coords: Coordinates) => boolean;
}

// Haversine Formula for distance
const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
};

const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
};

export const useLocationStore = create<LocationState>()(
    persist(
        (set, get) => ({
            coords: null,
            radius: 5, // Default 5km
            addressLabel: 'Locating...',
            mode: 'GPS',
            isSupportedZone: true, // Optimistic default

            setLocation: (coords, label, mode) => {
                const isSupported = get().checkZone(coords);
                set({
                    coords,
                    addressLabel: label,
                    mode,
                    isSupportedZone: isSupported
                });
            },

            setRadius: (radius) => set({ radius }),

            checkZone: (coords) => {
                // Check if user is within any beta zone
                return BETA_ZONES.some(zone => {
                    const distKm = getDistanceFromLatLonInKm(coords.lat, coords.lon, zone.lat, zone.lon);
                    return distKm <= (zone.radius / 1000);
                });
            }
        }),
        {
            name: 'gullygram-location', // unique name
            partialize: (state) => ({
                coords: state.coords,
                radius: state.radius,
                addressLabel: state.addressLabel,
                mode: state.mode
            }),
        }
    )
);
