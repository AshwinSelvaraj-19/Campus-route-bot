// Campus Data
const locations = [
    { id: 'gate1', name: 'Main Gate 1', coordinates: [13.2201951, 77.7541421] },
    { id: 'gate2', name: 'Main Gate 2', coordinates: [13.2213743, 77.7551241] },
    { id: 'flagpost', name: 'Flag Post', coordinates: [13.2216727, 77.7549353] },
    { id: 'admin1', name: 'Admin Block 1', coordinates: [13.2221283, 77.7552384] },
    { id: 'admin2', name: 'Admin Block 2', coordinates: [13.2233225, 77.7559227] },
    { id: 'parents_stay', name: 'Parents Stay Area', coordinates: [13.2233212, 77.7541116] },
    { id: 'staff_quarters', name: 'Staff Quarters', coordinates: [13.2237132, 77.7572504] },
    { id: 'food_court', name: 'Food Court', coordinates: [13.2247972, 77.7571941] },
    { id: 'hostel1', name: 'Hostel 1', coordinates: [13.2245171, 77.7588691] },
    { id: 'sports_area', name: 'Sports Area', coordinates: [13.228393, 77.757574] }
];

const pathConnections = [
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
    { from: 'flagpost', to: 'admin1', distance: 45 },
    { from: 'gate2', to: 'flagpost', distance: 35 }
];

// Create bidirectional connections
const allConnections = [
    ...pathConnections,
    ...pathConnections.map(conn => ({
        from: conn.to,
        to: conn.from,
        distance: conn.distance
    }))
];

// Global variables
let currentRoute = null;
let map = null;
let routeLayer = null;
let markersLayer = null;
let recognition = null;
let isListening = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    populateLocationSelectors();
    setupEventListeners();
    setupSpeechRecognition();
}

function populateLocationSelectors() {
    const startSelect = document.getElementById('start-location');
    const endSelect = document.getElementById('end-location');
    
    locations.forEach(location => {
        const option1 = document.createElement('option');
        option1.value = location.id;
        option1.textContent = location.name;
        startSelect.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = location.id;
        option2.textContent = location.name;
        endSelect.appendChild(option2);
    });
}

function setupEventListeners() {
    // Route form submission
    document.getElementById('route-form').addEventListener('submit', handleRouteSubmission);
    
    // Chat form submission
    document.getElementById('chat-form').addEventListener('submit', handleChatSubmission);
    
    // Voice button
    document.getElementById('voice-btn').addEventListener('click', toggleVoiceRecognition);
    
    // Show map button
    document.getElementById('show-map-btn').addEventListener('click', showMap);
    
    // Back button
    document.getElementById('back-btn').addEventListener('click', hideMap);
}

function setupSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            document.getElementById('chat-input').value = transcript;
            stopListening();
        };

        recognition.onerror = function() {
            stopListening();
        };

        recognition.onend = function() {
            stopListening();
        };
    } else {
        document.getElementById('voice-btn').style.display = 'none';
    }
}

function handleRouteSubmission(e) {
    e.preventDefault();
    
    const startId = document.getElementById('start-location').value;
    const endId = document.getElementById('end-location').value;
    const errorDiv = document.getElementById('error-message');
    
    // Clear previous errors
    errorDiv.style.display = 'none';
    
    // Validation
    if (!startId || !endId) {
        showError('Please select both start and end locations');
        return;
    }
    
    if (startId === endId) {
        showError('Start and end locations cannot be the same');
        return;
    }
    
    // Show loading state
    setLoadingState(true);
    
    // Simulate loading delay for better UX
    setTimeout(() => {
        const result = findRoute(startId, endId);
        displayRouteResult(result);
        setLoadingState(false);
    }, 800);
}

function handleChatSubmission(e) {
    e.preventDefault();
    
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addChatMessage(message, true);
    input.value = '';
    
    // Process the message
    processChatMessage(message);
}

function processChatMessage(message) {
    const { start, end } = parseNavigationRequest(message);
    
    if (start && end) {
        if (start.id === end.id) {
            addChatMessage('Start and end locations cannot be the same. Please choose different locations.', false);
            return;
        }
        
        addChatMessage(`Great! I'll show you the route from ${start.name} to ${end.name}.`, false);
        
        setTimeout(() => {
            const result = findRoute(start.id, end.id);
            if (result.success) {
                displayRouteResult(result);
                // Auto-populate the form
                document.getElementById('start-location').value = start.id;
                document.getElementById('end-location').value = end.id;
            }
        }, 500);
    } else {
        // Try to identify mentioned locations
        const mentionedLocations = locations.filter(loc => 
            message.toLowerCase().includes(loc.name.toLowerCase())
        );
        
        if (mentionedLocations.length === 0) {
            addChatMessage("I couldn't identify any campus locations in your message. Try saying something like 'Take me from Main Gate 1 to Food Court' or mention specific location names.", false);
        } else if (mentionedLocations.length === 1) {
            addChatMessage(`I found ${mentionedLocations[0].name}. Please specify both start and end locations for navigation. For example: 'from ${mentionedLocations[0].name} to Food Court'`, false);
        } else {
            addChatMessage(`I found these locations: ${mentionedLocations.map(l => l.name).join(', ')}. Please specify which one is your start and which is your destination.`, false);
        }
    }
}

function parseNavigationRequest(text) {
    const normalizedText = text.toLowerCase();
    
    const patterns = [
        /(?:take me |go |navigate |route )?from (.+?) to (.+?)(?:\.|$)/i,
        /(?:take me |go |navigate |route )?(.+?) to (.+?)(?:\.|$)/i,
        /(?:how to get |directions )?from (.+?) to (.+?)(?:\.|$)/i,
        /(?:show me the way |find route )?from (.+?) to (.+?)(?:\.|$)/i
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1] && match[2]) {
            const startLocation = findLocationByName(match[1].trim());
            const endLocation = findLocationByName(match[2].trim());
            
            if (startLocation && endLocation) {
                return { start: startLocation, end: endLocation };
            }
        }
    }

    return { start: null, end: null };
}

function findLocationByName(text) {
    const normalizedText = text.toLowerCase().trim();
    
    // Direct matches
    const directMatch = locations.find(loc => 
        loc.name.toLowerCase() === normalizedText ||
        loc.name.toLowerCase().includes(normalizedText) ||
        normalizedText.includes(loc.name.toLowerCase())
    );
    
    if (directMatch) return directMatch;

    // Fuzzy matching for common variations
    const variations = {
        'gate 1': 'gate1',
        'gate 2': 'gate2',
        'main gate 1': 'gate1',
        'main gate 2': 'gate2',
        'admin 1': 'admin1',
        'admin 2': 'admin2',
        'admin block 1': 'admin1',
        'admin block 2': 'admin2',
        'flag post': 'flagpost',
        'flagpost': 'flagpost',
        'parents stay': 'parents_stay',
        'parents area': 'parents_stay',
        'staff quarters': 'staff_quarters',
        'food court': 'food_court',
        'hostel 1': 'hostel1',
        'hostel one': 'hostel1',
        'sports area': 'sports_area',
        'sports ground': 'sports_area',
        'ground': 'sports_area'
    };

    for (const [variation, locationId] of Object.entries(variations)) {
        if (normalizedText.includes(variation)) {
            return locations.find(loc => loc.id === locationId) || null;
        }
    }

    return null;
}

function toggleVoiceRecognition() {
    if (isListening) {
        stopListening();
    } else {
        startListening();
    }
}

function startListening() {
    if (recognition && !isListening) {
        isListening = true;
        recognition.start();
        document.getElementById('voice-btn').classList.add('listening');
        document.getElementById('voice-btn').textContent = '🔴';
        document.getElementById('listening-indicator').style.display = 'flex';
    }
}

function stopListening() {
    if (recognition && isListening) {
        isListening = false;
        recognition.stop();
        document.getElementById('voice-btn').classList.remove('listening');
        document.getElementById('voice-btn').textContent = '🎤';
        document.getElementById('listening-indicator').style.display = 'none';
    }
}

function addChatMessage(text, isUser) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    messageDiv.textContent = text;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function setLoadingState(loading) {
    const btn = document.getElementById('find-route-btn');
    const btnText = document.getElementById('btn-text');
    const spinner = document.getElementById('loading-spinner');
    
    if (loading) {
        btn.disabled = true;
        btnText.textContent = 'Finding Route...';
        spinner.style.display = 'block';
    } else {
        btn.disabled = false;
        btnText.textContent = 'Find Route';
        spinner.style.display = 'none';
    }
}

function displayRouteResult(result) {
    const resultDiv = document.getElementById('route-result');
    
    if (result.success) {
        currentRoute = result;
        
        document.getElementById('total-distance').textContent = `${(result.totalDistance / 1000).toFixed(2)} km`;
        document.getElementById('estimated-time').textContent = `${result.estimatedTime} minutes`;
        
        const routePath = result.route.map(step => step.location.name).join(' → ');
        document.getElementById('route-path').textContent = routePath;
        
        resultDiv.style.display = 'block';
    } else {
        resultDiv.style.display = 'none';
        showError('No route found between selected locations');
    }
}

function showMap() {
    if (!currentRoute) return;
    
    document.getElementById('main-interface').style.display = 'none';
    document.getElementById('map-interface').style.display = 'block';
    
    setTimeout(() => {
        initializeMap();
    }, 100);
}

function hideMap() {
    document.getElementById('map-interface').style.display = 'none';
    document.getElementById('main-interface').style.display = 'block';
}

function initializeMap() {
    if (!currentRoute) return;
    
    const mapContainer = document.getElementById('map');
    
    // Clear existing map
    if (map) {
        map.remove();
    }
    
    // Create new map
    map = L.map(mapContainer).setView(currentRoute.route[0].location.coordinates, 16);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Add route polyline
    const routeCoordinates = currentRoute.route.map(step => step.location.coordinates);
    routeLayer = L.polyline(routeCoordinates, {
        color: '#3B82F6',
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 5'
    }).addTo(map);
    
    // Add markers
    markersLayer = L.layerGroup().addTo(map);
    
    currentRoute.route.forEach((step, index) => {
        const isStart = index === 0;
        const isEnd = index === currentRoute.route.length - 1;
        
        let iconUrl;
        if (isStart) {
            iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png';
        } else if (isEnd) {
            iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png';
        } else {
            iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png';
        }
        
        const icon = L.icon({
            iconUrl: iconUrl,
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            iconSize: isStart || isEnd ? [25, 41] : [20, 33],
            iconAnchor: isStart || isEnd ? [12, 41] : [10, 33],
            popupAnchor: [1, isStart || isEnd ? -34 : -28],
            shadowSize: [41, 41]
        });
        
        const marker = L.marker(step.location.coordinates, { icon }).addTo(markersLayer);
        
        let popupContent = `<div style="text-align: center;">
            <h3 style="margin: 0 0 5px 0; font-weight: 600;">${step.location.name}</h3>`;
        
        if (isStart) {
            popupContent += '<p style="margin: 0; color: #10b981; font-weight: 500; font-size: 0.875rem;">Start</p>';
        } else if (isEnd) {
            popupContent += '<p style="margin: 0; color: #ef4444; font-weight: 500; font-size: 0.875rem;">End</p>';
        } else {
            popupContent += '<p style="margin: 0; color: #3b82f6; font-weight: 500; font-size: 0.875rem;">Waypoint</p>';
        }
        
        if (step.distanceFromPrevious) {
            popupContent += `<p style="margin: 5px 0 0 0; color: #64748b; font-size: 0.75rem;">${step.distanceFromPrevious}m from previous</p>`;
        }
        
        popupContent += '</div>';
        marker.bindPopup(popupContent);
    });
    
    // Fit map to route bounds
    map.fitBounds(routeLayer.getBounds(), { padding: [50, 50] });
    
    // Update route info panel
    updateMapRouteInfo();
}

function updateMapRouteInfo() {
    if (!currentRoute) return;
    
    document.getElementById('map-total-distance').textContent = `${(currentRoute.totalDistance / 1000).toFixed(2)} km`;
    document.getElementById('map-estimated-time').textContent = `${currentRoute.estimatedTime} minutes`;
    
    const stepsContainer = document.getElementById('map-route-steps');
    stepsContainer.innerHTML = '';
    
    currentRoute.route.forEach((step, index) => {
        const isStart = index === 0;
        const isEnd = index === currentRoute.route.length - 1;
        
        const stepDiv = document.createElement('div');
        stepDiv.className = 'step-item';
        
        const dot = document.createElement('div');
        dot.className = `step-dot ${isStart ? 'start' : isEnd ? 'end' : 'waypoint'}`;
        
        const name = document.createElement('span');
        name.className = 'step-name';
        name.textContent = step.location.name;
        
        stepDiv.appendChild(dot);
        stepDiv.appendChild(name);
        
        if (step.distanceFromPrevious) {
            const distance = document.createElement('span');
            distance.className = 'step-distance';
            distance.textContent = `${step.distanceFromPrevious}m`;
            stepDiv.appendChild(distance);
        }
        
        stepsContainer.appendChild(stepDiv);
    });
}

// Pathfinding Algorithm (Dijkstra's)
function findRoute(startId, endId) {
    if (startId === endId) {
        return {
            route: [],
            totalDistance: 0,
            estimatedTime: 0,
            success: false
        };
    }

    const nodes = new Map();
    const unvisited = new Set();
    
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
        let currentId = null;
        let minDistance = Infinity;
        
        for (const nodeId of unvisited) {
            const node = nodes.get(nodeId);
            if (node.distance < minDistance) {
                minDistance = node.distance;
                currentId = nodeId;
            }
        }

        if (!currentId || minDistance === Infinity) break;

        const currentNode = nodes.get(currentId);
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
    const route = [];
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
    const pathNodes = [];
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