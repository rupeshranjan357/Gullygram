#!/bin/bash


echo "🌱 GullyGram Seed Content Tool"
echo "------------------------------"
echo "Select Target Environment:"
echo "1. Localhost (Testing)"
echo "2. Production (Render)"
read -p "Enter choice [1-2]: " env_choice

if [ "$env_choice" == "1" ]; then
    API_URL="http://localhost:8080/api/admin/seed"
elif [ "$env_choice" == "2" ]; then
    read -p "Enter Render Backend URL (e.g. https://gullygram-api.onrender.com): " render_url
    # Remove trailing slash if present
    render_url=${render_url%/}
    API_URL="$render_url/api/admin/seed"
else
    echo "Invalid choice. Exiting."
    exit 1
fi

echo "Targeting: $API_URL"
echo "------------------------------"
echo "Select an option:"
echo "1. Seed Koramangala (Fixed)"
echo "2. Seed Indiranagar (Fixed)"
echo "3. Seed My Location (Custom)"
echo "4. Exit"

read -p "Enter choice [1-4]: " choice

case $choice in
    1)
        echo "Seeding Koramangala..."
        curl -X POST "$API_URL/koramangala"
        ;;
    2)
        echo "Seeding Indiranagar..."
        curl -X POST "$API_URL/indiranagar"
        ;;
    3)
        read -p "Enter Latitude (e.g., 12.97): " lat
        read -p "Enter Longitude (e.g., 77.60): " lon
        echo "Seeding Custom Location ($lat, $lon)..."
        curl -X POST "$API_URL/custom?lat=$lat&lon=$lon"
        ;;
    4)
        echo "Exiting."
        exit 0
        ;;
    *)
        echo "Invalid option."
        ;;
esac

echo ""
echo "✅ Done! Refresh your feed to see the posts."
