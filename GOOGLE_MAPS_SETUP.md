# Google Maps 3D Integration Guide

## Setup Instructions

1. **Get Google Maps API Key:**

   - Go to [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
   - Create a new project or select existing one
   - Enable the following APIs:
     - Maps JavaScript API
     - Maps 3D API (beta)
   - Create credentials (API Key)
   - Restrict the API key to your domain for security

2. **Environment Variables:**
   Create a `.env.local` file in your project root with:

   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

3. **Usage:**
   The GoogleMaps3D component is now available and can be imported:

   ```tsx
   import GoogleMaps3D from "@/components/ui/google-maps-3d";

   <GoogleMaps3D
     center={{ lat: -53.1638, lng: -70.9171 }} // Cabo Negro, Chile
     range={3000}
     tilt={75}
     heading={330}
     mode="hybrid"
   />;
   ```

## Component Features

- **Automatic script loading:** Loads Google Maps API only when needed
- **Error handling:** Graceful fallback with retry option
- **Loading states:** Shows loading spinner while initializing
- **Customizable:** Supports all Google Maps 3D parameters
- **TypeScript support:** Full type definitions included

## Default Coordinates

The component defaults to Cabo Negro, Chile coordinates (-53.1638, -70.9171) but can be customized for any location.
