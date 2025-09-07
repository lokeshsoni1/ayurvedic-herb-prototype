/**
 * GPS Map Component for Location Tracking
 * Prototype developed by Team Hackon
 * 
 * Displays interactive map with GPS coordinates for herb collection locations.
 * In production, this would integrate with IoT devices and GPS sensors
 * for real-time location validation and geo-fencing.
 */

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Locate, 
  CheckCircle, 
  AlertCircle, 
  Navigation 
} from 'lucide-react';
import { GPSCoordinates } from '../types/blockchain';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface GPSMapProps {
  coordinates?: GPSCoordinates;
  species?: string;
  title?: string;
  showGeofence?: boolean;
  onLocationSelect?: (coords: GPSCoordinates) => void;
  className?: string;
}

export const GPSMap: React.FC<GPSMapProps> = ({
  coordinates,
  species = 'Unknown',
  title = "Collection Location",
  showGeofence = true,
  onLocationSelect,
  className = ""
}) => {
  const [currentLocation, setCurrentLocation] = useState<GPSCoordinates | null>(coordinates || null);
  const [isValidLocation, setIsValidLocation] = useState<boolean>(true);
  const [locationAccuracy, setLocationAccuracy] = useState<number>(10);

  // Default center (Rajasthan, India - known for Ashwagandha cultivation)
  const defaultCenter: GPSCoordinates = { lat: 26.9124, lng: 75.7873 };
  const mapCenter = currentLocation || defaultCenter;

  useEffect(() => {
    if (coordinates) {
      setCurrentLocation(coordinates);
      validateGeoLocation(coordinates);
    }
  }, [coordinates, species]);

  /**
   * Validate if the GPS location is within acceptable geo-fence
   * In production, this would call smart contract validation
   */
  const validateGeoLocation = (coords: GPSCoordinates) => {
    // Simulated geo-fencing for Ashwagandha (Rajasthan region)
    if (species.toLowerCase().includes('ashwagandha')) {
      const inValidRegion = coords.lat >= 24.0 && coords.lat <= 30.0 && 
                           coords.lng >= 69.0 && coords.lng <= 78.0;
      setIsValidLocation(inValidRegion);
      
      console.log(`🗺️  [GEO-FENCE] Location validation for ${species}:`, 
                 inValidRegion ? 'VALID' : 'INVALID');
    } else {
      setIsValidLocation(true);
    }
  };

  /**
   * Get current location using browser GPS
   */
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.error('❌ [GPS] Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          altitude: position.coords.altitude || undefined
        };
        
        setCurrentLocation(coords);
        setLocationAccuracy(position.coords.accuracy);
        validateGeoLocation(coords);
        onLocationSelect?.(coords);
        
        console.log(`📍 [GPS] Location acquired:`, coords);
        console.log(`📡 [GPS] Accuracy: ${position.coords.accuracy}m`);
      },
      (error) => {
        console.error('❌ [GPS] Location error:', error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  /**
   * Calculate geo-fence boundaries for species
   */
  const getGeofenceBounds = () => {
    if (species.toLowerCase().includes('ashwagandha')) {
      return {
        center: { lat: 27.0, lng: 74.0 },
        radius: 300000 // 300km radius
      };
    }
    return null;
  };

  const geofence = getGeofenceBounds();

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant={isValidLocation ? "default" : "destructive"}
              className="text-xs"
            >
              {isValidLocation ? (
                <><CheckCircle className="h-3 w-3 mr-1" /> Valid Region</>
              ) : (
                <><AlertCircle className="h-3 w-3 mr-1" /> Invalid Region</>
              )}
            </Badge>
            
            {currentLocation && (
              <Badge variant="outline" className="text-xs">
                ±{locationAccuracy}m
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Map Container */}
        <div className="relative">
          <MapContainer
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={currentLocation ? 13 : 7}
            style={{ height: '300px', width: '100%' }}
            className="rounded-b-lg"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Current location marker */}
            {currentLocation && (
              <Marker position={[currentLocation.lat, currentLocation.lng]}>
                <Popup>
                  <div className="text-sm">
                    <strong>Collection Site</strong><br />
                    Species: {species}<br />
                    Lat: {currentLocation.lat.toFixed(6)}<br />
                    Lng: {currentLocation.lng.toFixed(6)}<br />
                    {currentLocation.altitude && (
                      <>Alt: {currentLocation.altitude.toFixed(1)}m<br /></>
                    )}
                    Status: {isValidLocation ? '✅ Valid' : '❌ Invalid'}
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* Geo-fence visualization */}
            {showGeofence && geofence && (
              <Circle
                center={[geofence.center.lat, geofence.center.lng]}
                radius={geofence.radius}
                fillColor="green"
                fillOpacity={0.1}
                color="green"
                weight={2}
                dashArray="5, 5"
              />
            )}
            
            {/* Accuracy circle around current location */}
            {currentLocation && locationAccuracy && (
              <Circle
                center={[currentLocation.lat, currentLocation.lng]}
                radius={locationAccuracy}
                fillColor="blue"
                fillOpacity={0.1}
                color="blue"
                weight={1}
              />
            )}
          </MapContainer>

          {/* Get Location Button */}
          <div className="absolute top-4 right-4 z-1000">
            <Button
              onClick={getCurrentLocation}
              size="sm"
              className="shadow-medium bg-card border"
            >
              <Locate className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Location Details */}
        {currentLocation && (
          <div className="p-4 bg-muted/30">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-foreground">Coordinates</div>
                <div className="text-muted-foreground">
                  {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                </div>
              </div>
              
              <div>
                <div className="font-medium text-foreground">Accuracy</div>
                <div className="text-muted-foreground">
                  ±{locationAccuracy}m GPS
                </div>
              </div>
              
              {species && (
                <div>
                  <div className="font-medium text-foreground">Species</div>
                  <div className="text-muted-foreground">{species}</div>
                </div>
              )}
              
              <div>
                <div className="font-medium text-foreground">Validation</div>
                <div className={`font-medium ${isValidLocation ? 'text-success' : 'text-destructive'}`}>
                  {isValidLocation ? 'Valid Region' : 'Invalid Region'}
                </div>
              </div>
            </div>
            
            {/* Geo-fence Information */}
            {geofence && (
              <div className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <div className="flex items-center gap-2 text-xs text-primary">
                  <Navigation className="h-3 w-3" />
                  <span className="font-medium">Geo-fence Active</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Collection allowed within {(geofence.radius / 1000).toFixed(0)}km of 
                  approved {species} cultivation regions
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};