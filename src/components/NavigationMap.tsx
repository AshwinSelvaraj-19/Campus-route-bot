import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Icon, LatLngBounds } from 'leaflet';
import { NavigationResult } from '../types/navigation';
import { ArrowLeft } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const startIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const endIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const waypointIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [20, 33],
  iconAnchor: [10, 33],
  popupAnchor: [1, -28],
  shadowSize: [33, 33]
});

interface NavigationMapProps {
  navigationResult: NavigationResult;
  onBack: () => void;
}

export function NavigationMap({ navigationResult, onBack }: NavigationMapProps) {
  const mapRef = useRef<L.Map | null>(null);

  const routeCoordinates = navigationResult.route.map(step => step.location.coordinates);
  const bounds = new LatLngBounds(routeCoordinates);

  useEffect(() => {
    if (mapRef.current && routeCoordinates.length > 0) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [navigationResult, bounds]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-[1000] bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="flex items-center px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 
                       text-slate-700 font-medium transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <h1 className="text-lg font-bold text-slate-800">Campus Navigation</h1>
          <div className="w-16"></div>
        </div>
      </div>

      {/* Map */}
      <div className="pt-20 h-full">
        <MapContainer
          center={routeCoordinates[0] || [13.2221283, 77.7552384]}
          zoom={16}
          className="h-full w-full"
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Route polyline */}
          <Polyline 
            positions={routeCoordinates}
            color="#3B82F6"
            weight={4}
            opacity={0.8}
            dashArray="10, 5"
          />
          
          {/* Markers */}
          {navigationResult.route.map((step, index) => {
            const isStart = index === 0;
            const isEnd = index === navigationResult.route.length - 1;
            const icon = isStart ? startIcon : isEnd ? endIcon : waypointIcon;
            
            return (
              <Marker 
                key={step.location.id} 
                position={step.location.coordinates}
                icon={icon}
              >
                <Popup>
                  <div className="text-center">
                    <h3 className="font-semibold text-slate-800">{step.location.name}</h3>
                    {isStart && <p className="text-green-600 text-sm font-medium">Start</p>}
                    {isEnd && <p className="text-red-600 text-sm font-medium">End</p>}
                    {!isStart && !isEnd && (
                      <p className="text-blue-600 text-sm font-medium">Waypoint</p>
                    )}
                    {step.distanceFromPrevious && (
                      <p className="text-slate-600 text-xs mt-1">
                        {step.distanceFromPrevious}m from previous
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Route Information Panel */}
      <div className="absolute bottom-6 left-6 right-6 md:right-auto md:max-w-sm z-[1000]">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
          <h3 className="font-bold text-slate-800 mb-4 text-lg">Route Information</h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Total Distance:</span>
              <span className="font-bold text-slate-800">
                {(navigationResult.totalDistance / 1000).toFixed(2)} km
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Estimated Time:</span>
              <span className="font-bold text-slate-800">
                {navigationResult.estimatedTime} minutes
              </span>
            </div>
            
            <div className="pt-3 border-t border-slate-200">
              <span className="text-slate-600 font-medium">Route Steps:</span>
              <div className="mt-2 space-y-2">
                {navigationResult.route.map((step, index) => (
                  <div key={step.location.id} className="flex items-center text-xs">
                    <div className={`w-3 h-3 rounded-full mr-3 flex-shrink-0 ${
                      index === 0 ? 'bg-green-500' : 
                      index === navigationResult.route.length - 1 ? 'bg-red-500' : 'bg-blue-500'
                    }`}></div>
                    <span className="text-slate-700">{step.location.name}</span>
                    {step.distanceFromPrevious && (
                      <span className="text-slate-500 ml-auto">{step.distanceFromPrevious}m</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}