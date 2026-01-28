package com.gullygram.backend.util;

public class GeoUtil {

    private static final double EARTH_RADIUS_KM = 6371.0;

    /**
     * Calculate distance between two points using Haversine formula
     * @return distance in kilometers
     */
    public static double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_KM * c;
    }

    /**
     * Calculate bounding box for a given point and radius
     * @return array [minLat, maxLat, minLon, maxLon]
     */
    public static double[] getBoundingBox(double lat, double lon, double radiusKm) {
        // Approximate degrees per km (varies by latitude)
        double latDegreePerKm = 1.0 / 111.0;
        double lonDegreePerKm = 1.0 / (111.0 * Math.cos(Math.toRadians(lat)));

        double minLat = lat - (radiusKm * latDegreePerKm);
        double maxLat = lat + (radiusKm * latDegreePerKm);
        double minLon = lon - (radiusKm * lonDegreePerKm);
        double maxLon = lon + (radiusKm * lonDegreePerKm);

        // Clamp to valid ranges
        minLat = Math.max(minLat, -90.0);
        maxLat = Math.min(maxLat, 90.0);
        minLon = Math.max(minLon, -180.0);
        maxLon = Math.min(maxLon, 180.0);

        return new double[]{minLat, maxLat, minLon, maxLon};
    }

    /**
     * Simple geohash generation (prefix-based, suitable for pilot)
     * @return geohash string (precision 6)
     */
    public static String generateGeohash(double lat, double lon) {
        return generateGeohash(lat, lon, 6);
    }

    public static String generateGeohash(double lat, double lon, int precision) {
        // Simple geohash implementation
        // For production, use a library like ch.hsr:geohash
        double[] latInterval = {-90.0, 90.0};
        double[] lonInterval = {-180.0, 180.0};
        
        StringBuilder geohash = new StringBuilder();
        boolean isEven = true;
        int bit = 0;
        int ch = 0;
        
        String base32 = "0123456789bcdefghjkmnpqrstuvwxyz";
        
        while (geohash.length() < precision) {
            if (isEven) {
                double mid = (lonInterval[0] + lonInterval[1]) / 2;
                if (lon > mid) {
                    ch |= (1 << (4 - bit));
                    lonInterval[0] = mid;
                } else {
                    lonInterval[1] = mid;
                }
            } else {
                double mid = (latInterval[0] + latInterval[1]) / 2;
                if (lat > mid) {
                    ch |= (1 << (4 - bit));
                    latInterval[0] = mid;
                } else {
                    latInterval[1] = mid;
                }
            }
            
            isEven = !isEven;
            
            if (bit < 4) {
                bit++;
            } else {
                geohash.append(base32.charAt(ch));
                bit = 0;
                ch = 0;
            }
        }
        
        return geohash.toString();
    }

    /**
     * Validate latitude
     */
    public static boolean isValidLatitude(double lat) {
        return lat >= -90.0 && lat <= 90.0;
    }

    /**
     * Validate longitude
     */
    public static boolean isValidLongitude(double lon) {
        return lon >= -180.0 && lon <= 180.0;
    }
}
