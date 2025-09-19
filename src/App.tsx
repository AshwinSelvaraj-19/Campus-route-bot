import React, { useState } from 'react';
import { NavigationForm } from './components/NavigationForm';
import { ChatbotInput } from './components/ChatbotInput';
import { NavigationMap } from './components/NavigationMap';
import { locations } from './data/campusData';
import { findRoute } from './utils/pathfinding';
import { NavigationResult } from './types/navigation';
import { MapPin, Navigation, Compass } from 'lucide-react';

function App() {
  const [navigationResult, setNavigationResult] = useState<NavigationResult | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigate = async (startId: string, endId: string) => {
    setIsLoading(true);
    
    // Simulate loading for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const result = findRoute(startId, endId);
    setNavigationResult(result);
    setIsLoading(false);
    
    if (result.success) {
      setShowMap(true);
    }
  };

  const handleBackToForm = () => {
    setShowMap(false);
  };

  if (showMap && navigationResult?.success) {
    return <NavigationMap navigationResult={navigationResult} onBack={handleBackToForm} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(59,130,246,0.1)_0%,transparent_25%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(147,51,234,0.1)_0%,transparent_25%)]"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Side - Branding */}
          <div className="text-center lg:text-left space-y-8 lg:col-span-1">
            <div className="space-y-6">
              <div className="flex items-center justify-center lg:justify-start space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Compass className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  BotGuide
                </h1>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-800">
                  Smart Campus Navigation
                </h2>
                <p className="text-slate-600 text-lg leading-relaxed max-w-lg">
                  Find the most efficient routes between campus locations with our intelligent 
                  pathfinding system. Get accurate distances and estimated walking times.
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Accurate Routes</h3>
                  <p className="text-slate-600 text-sm">Real campus distances</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Navigation className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Smart Pathfinding</h3>
                  <p className="text-slate-600 text-sm">Optimal route calculation</p>
                </div>
              </div>
            </div>
          </div>

          {/* Middle - Navigation Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0 lg:col-span-1">
            <NavigationForm
              locations={locations}
              onNavigate={handleNavigate}
              navigationResult={navigationResult}
              isLoading={isLoading}
            />
          </div>

          {/* Right Side - Chatbot Input */}
          <div className="w-full max-w-md mx-auto lg:mx-0 lg:col-span-1">
            <ChatbotInput
              locations={locations}
              onRouteRequest={handleNavigate}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <p className="text-slate-500 text-sm text-center">
          Built with React & Leaflet • Campus Navigation System
        </p>
      </div>
    </div>
  );
}

export default App;