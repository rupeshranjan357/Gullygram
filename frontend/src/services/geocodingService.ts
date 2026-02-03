interface GeocodeResult {
    lat: number;
    lon: number;
    display_name: string;
    address?: any;
}

export const geocodingService = {
    // 1. Search text -> Coords (Single - Legacy)
    searchAddress: async (query: string): Promise<GeocodeResult | null> => {
        const results = await geocodingService.searchAddresses(query);
        return results.length > 0 ? results[0] : null;
    },

    // 1b. Search text -> List of Coords (Autocomplete)
    searchAddresses: async (query: string): Promise<GeocodeResult[]> => {
        try {
            // Using OpenStreetMap Nominatim
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'GullyGram-App/1.0'
                    }
                }
            );
            const data = await response.json();

            if (data && Array.isArray(data)) {
                return data.map((item: any) => ({
                    lat: parseFloat(item.lat),
                    lon: parseFloat(item.lon),
                    display_name: item.display_name,
                    address: item.address // Keep address details for city extraction
                }));
            }
            return [];
        } catch (error) {
            console.error("Geocoding error:", error);
            return [];
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
