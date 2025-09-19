import { locations, allConnections } from '../data/campusData';
import { Location, NavigationResult, RouteStep } from '../types/navigation';

interface GraphNode {
  location: Location;
  distance: number;
  previous: GraphNode | null;
}

export function findRoute(startId: string, endId: string): NavigationResult {
  if (startId === endId) {
    return {
      route: [],
      totalDistance: 0,
      estimatedTime: 0,
      success: false
    };
  }

  // Dijkstra's algorithm implementation
  const nodes = new Map<string, GraphNode>();
  const unvisited = new Set<string>();
  
  // Initialize all nodes
  locations.forEach(location => {
    nodes.set(location.id, {
      location,
      distance: location.id === startId ? 0 : Infinity,
      previous: null
    });
    unvisited.add(location.id);
  });

  while (unvisited.size > 0) {
    // Find unvisited node with minimum distance
    let currentId: string | null = null;
    let minDistance = Infinity;
    
    for (const nodeId of unvisited) {
      const node = nodes.get(nodeId)!;
      if (node.distance < minDistance) {
        minDistance = node.distance;
        currentId = nodeId;
      }
    }

    if (!currentId || minDistance === Infinity) break;

    const currentNode = nodes.get(currentId)!;
    unvisited.delete(currentId);

    // If we reached the destination
    if (currentId === endId) break;

    // Update distances to neighbors
    const connections = allConnections.filter(conn => conn.from === currentId);
    
    for (const connection of connections) {
      const neighborNode = nodes.get(connection.to);
      if (neighborNode && unvisited.has(connection.to)) {
        const newDistance = currentNode.distance + connection.distance;
        if (newDistance < neighborNode.distance) {
          neighborNode.distance = newDistance;
          neighborNode.previous = currentNode;
        }
      }
    }
  }

  // Reconstruct path
  const route: RouteStep[] = [];
  let currentNode = nodes.get(endId);
  
  if (!currentNode || currentNode.distance === Infinity) {
    return {
      route: [],
      totalDistance: 0,
      estimatedTime: 0,
      success: false
    };
  }

  // Build route from end to start
  const pathNodes: GraphNode[] = [];
  while (currentNode) {
    pathNodes.unshift(currentNode);
    currentNode = currentNode.previous;
  }

  // Convert to route steps
  let totalDistance = 0;
  for (let i = 0; i < pathNodes.length; i++) {
    const node = pathNodes[i];
    const distanceFromPrevious = i > 0 ? 
      allConnections.find(conn => 
        conn.from === pathNodes[i-1].location.id && 
        conn.to === node.location.id
      )?.distance || 0 : 0;
    
    totalDistance += distanceFromPrevious;
    
    route.push({
      location: node.location,
      distanceFromPrevious,
      totalDistance
    });
  }

  // Estimate walking time (assuming 5 km/h walking speed)
  const estimatedTime = Math.ceil((totalDistance / 1000) * 12); // minutes

  return {
    route,
    totalDistance,
    estimatedTime,
    success: true
  };
}