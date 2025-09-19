import React from 'react';
import { Location } from '../types/navigation';
import { MapPin } from 'lucide-react';

interface LocationSelectorProps {
  locations: Location[];
  selectedValue: string;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
}

export function LocationSelector({ 
  locations, 
  selectedValue, 
  onChange, 
  label, 
  disabled = false 
}: LocationSelectorProps) {
  return (
    <div className="relative">
      <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
        <MapPin className="w-4 h-4 mr-2 text-blue-500" />
        {label}
      </label>
      <select
        value={selectedValue}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/80 
                   backdrop-blur-sm text-slate-700 text-sm font-medium
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-200 hover:border-blue-300"
      >
        <option value="">Select {label.toLowerCase()}</option>
        {locations.map((location) => (
          <option key={location.id} value={location.id}>
            {location.name}
          </option>
        ))}
      </select>
    </div>
  );
}