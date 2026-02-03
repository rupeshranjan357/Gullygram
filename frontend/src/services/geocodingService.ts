interface GeocodeResult {
    lat: number;
    lon: number;
    display_name: string;
}

export const geocodingService = {
    // 1. Search text -> Coords
    searchAddress: async (query: string): Promise<GeocodeResult | null> => {
        try {
            // Using OpenStreetMap Nominatim (Free, requires user-agent)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
                {
                    headers: {
                        'User-Agent': 'GullyGram-App/1.0'
                    }
                }
            );
            const data = await response.json();

            if (data && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lon: parseFloat(data[0].lon),
                    display_name: data[0].display_name
                };
            }
            return null;
        } catch (error) {
            console.error("Geocoding error:", error);
            return null;
        }
    },

    // 2. Coords -> Text Address
    reverseGeocode: async (lat: number, lon: number): Promise<string> => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
                {
                    headers: {
                        'User-Agent': 'GullyGram-App/1.0'
                    }
                }
            );
            const data = await response.json();

            // Format nice short address
            if (data && data.address) {
                const add = data.address;
                const suburb = add.suburb || add.neighbourhood || add.district;
                const city = add.city || add.town || add.village;
                return `${suburb}, ${city}`;
            }
            return "Unknown Location";
        } catch (error) {
            console.error("Reverse geocoding error:", error);
            return "Unknown Location";
        }
    }
};
