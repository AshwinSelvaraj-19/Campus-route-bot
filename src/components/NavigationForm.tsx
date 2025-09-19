import React, { useState } from 'react';
import { Location, NavigationResult } from '../types/navigation';
import { LocationSelector } from './LocationSelector';
import { Navigation, AlertCircle, Clock, MapPin } from 'lucide-react';

interface NavigationFormProps {
  locations: Location[];
  onNavigate: (startId: string, endId: string) => void;
  navigationResult: NavigationResult | null;
  isLoading: boolean;
}

export function NavigationForm({ 
  locations, 
  onNavigate, 
  navigationResult, 
  isLoading 
}: NavigationFormProps) {
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!startLocation || !endLocation) {
      setError('Please select both start and end locations');
      return;
    }

    if (startLocation === endLocation) {
      setError('Start and end locations cannot be the same');
      return;
    }

    onNavigate(startLocation, endLocation);
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8">
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-3">
            <Navigation className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Campus Navigation</h2>
        </div>
        <p className="text-slate-600 text-sm">Find the best route between campus locations</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <LocationSelector
          locations={locations}
          selectedValue={startLocation}
          onChange={setStartLocation}
          label="Start Location"
          disabled={isLoading}
        />

        <LocationSelector
          locations={locations}
          selectedValue={endLocation}
          onChange={setEndLocation}
          label="End Location"
          disabled={isLoading}
        />

        {error && (
          <div className="flex items-center p-3 rounded-lg bg-red-50 border border-red-200">
            <AlertCircle className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !startLocation || !endLocation}
          className="w-full py-3 px-6 rounded-xl font-semibold text-white
                     bg-gradient-to-r from-blue-500 to-blue-600 
                     hover:from-blue-600 hover:to-blue-700
                     disabled:from-slate-300 disabled:to-slate-400
                     disabled:cursor-not-allowed
                     transform transition-all duration-200 
                     hover:scale-[1.02] hover:shadow-lg
                     disabled:hover:scale-100 disabled:hover:shadow-none"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
              Finding Route...
            </div>
          ) : (
            'Find Route'
          )}
        </button>
      </form>

      {navigationResult && navigationResult.success && (
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
          <h3 className="font-semibold text-slate-800 mb-3 flex items-center">
            <MapPin className="w-4 h-4 text-green-600 mr-2" />
            Route Found
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Total Distance:</span>
              <span className="font-semibold text-slate-800">
                {(navigationResult.totalDistance / 1000).toFixed(2)} km
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                Estimated Time:
              </span>
              <span className="font-semibold text-slate-800">
                {navigationResult.estimatedTime} min
              </span>
            </div>
            <div className="pt-2 border-t border-green-200">
              <span className="text-slate-600 text-xs">Route:</span>
              <div className="mt-1">
                {navigationResult.route.map((step, index) => (
                  <span key={step.location.id} className="text-xs text-slate-700">
                    {step.location.name}
                    {index < navigationResult.route.length - 1 && (
                      <span className="text-blue-500 mx-1">→</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {navigationResult && !navigationResult.success && (
        <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
            <span className="text-red-700 text-sm">No route found between selected locations</span>
          </div>
        </div>
      )}
    </div>
  );
}