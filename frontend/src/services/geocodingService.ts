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

            if (data && data.address) {
                const add = data.address;

                // Smart Selection Logic
                let primary = add.neighbourhood || add.residential || add.suburb || add.district;

                const suburb = add.suburb;
                const neighbourhood = add.neighbourhood || add.residential;

                // Specific Overrides for Bangalore Context
                if (suburb && (suburb.includes('Whitefield') || suburb.includes('Marathahalli'))) {
                    primary = suburb;
                } else if (suburb && suburb.toLowerCase().includes('ward')) {
                    // If suburb is a Ward, try neighbourhood
                    if (neighbourhood) primary = neighbourhood;
                    else primary = suburb; // Stuck with Ward if no neighbourhood
                } else if (neighbourhood) {
                    primary = neighbourhood;
                }

                const city = add.city || add.town || add.village || add.state_district;
                return `${primary}, ${city}`;
            }
            return "Unknown Location";
        } catch (error) {
            console.error("Reverse geocoding error:", error);
            return "Unknown Location";
        }
    }
};
