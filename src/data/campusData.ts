import { Location, PathConnection } from '../types/navigation';

export const locations: Location[] = [
  { id: 'gate1', name: 'Main Gate 1', coordinates: [13.2201951, 77.7541421] },
  { id: 'gate2', name: 'Main Gate 2', coordinates: [13.2213743, 77.7551241] },
  { id: 'flagpost', name: 'Flag Post', coordinates: [13.2216727, 77.7549353] },
  { id: 'admin1', name: 'Admin Block 1', coordinates: [13.2221283, 77.7552384] },
  { id: 'admin2', name: 'Admin Block 2', coordinates: [13.2233225, 77.7559227] },
  { id: 'parents_stay', name: 'Parents Stay Area', coordinates: [13.2233212, 77.7541116] },
  { id: 'staff_quarters', name: 'Staff Quarters', coordinates: [13.2237132, 77.7572504] },
  { id: 'food_court', name: 'Food Court', coordinates: [13.2247972, 77.7571941] },
  { id: 'hostel1', name: 'Hostel 1', coordinates: [13.2245171, 77.7588691] },
  { id: 'sports_area', name: 'Sports Area', coordinates: [13.228393, 77.757574] },
];

export const pathConnections: PathConnection[] = [
  { from: 'gate1', to: 'gate2', distance: 180 },
  { from: 'gate2', to: 'admin1', distance: 75 },
  { from: 'gate2', to: 'parents_stay', distance: 283 },
  { from: 'admin1', to: 'admin2', distance: 125 },
  { from: 'admin1', to: 'parents_stay', distance: 250 },
  { from: 'admin2', to: 'food_court', distance: 215 },
  { from: 'admin2', to: 'staff_quarters', distance: 470 },
  { from: 'food_court', to: 'parents_stay', distance: 215 },
  { from: 'admin2', to: 'parents_stay', distance: 305 },
  { from: 'food_court', to: 'hostel1', distance: 271 },
  { from: 'hostel1', to: 'sports_area', distance: 565 },
  { from: 'parents_stay', to: 'food_court', distance: 415 },
  { from: 'parents_stay', to: 'hostel1', distance: 645 },
  // Additional connections for better pathfinding
  { from: 'flagpost', to: 'admin1', distance: 45 },
  { from: 'gate2', to: 'flagpost', distance: 35 },
];

// Create bidirectional connections
export const allConnections: PathConnection[] = [
  ...pathConnections,
  ...pathConnections.map(conn => ({
    from: conn.to,
    to: conn.from,
    distance: conn.distance
  }))
];