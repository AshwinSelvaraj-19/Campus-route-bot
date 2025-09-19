export interface Location {
  id: string;
  name: string;
  coordinates: [number, number];
}

export interface PathConnection {
  from: string;
  to: string;
  distance: number; // in meters
}

export interface RouteStep {
  location: Location;
  distanceFromPrevious?: number;
  totalDistance: number;
}

export interface NavigationResult {
  route: RouteStep[];
  totalDistance: number;
  estimatedTime: number; // in minutes
  success: boolean;
}