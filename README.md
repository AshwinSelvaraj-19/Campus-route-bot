Campus Route Bot – Project Documentation

1. Project Title

Campus Route Bot

2. Project Overview

Campus Route Bot is a web-based navigation system designed to help users find the shortest path between different locations inside a campus. The application supports both manual selection of locations and chat-based natural language input. It calculates the optimal walking route and displays the path details along with estimated distance and time.

The project is fully frontend-based and runs in the browser using HTML, CSS, and JavaScript.


---

3. Objectives

Provide an easy way to navigate inside the campus.

Implement shortest path calculation using Dijkstra’s Algorithm.

Support both dropdown-based and chat-based navigation.

Visualize routes on an interactive map.

Enable voice input for hands-free interaction.



---

4. Features

4.1 Manual Route Selection

Users select start and destination from dropdown menus.

Validates that both locations are different.

Displays total distance and estimated walking time.


4.2 Chat-Based Navigation

Users can type queries like: "Take me from Main Gate to Library".

Extracts start and destination from text input.

Provides route results similar to manual selection.


4.3 Voice Input

Uses browser Speech Recognition API.

Converts speech into text.

Automatically processes navigation request.


4.4 Map Visualization

Displays route on an interactive map using Leaflet.js.

Marks starting point, intermediate nodes, and destination.

Automatically adjusts zoom to fit the route.


4.5 Shortest Path Algorithm

Uses Dijkstra’s Algorithm.

Computes minimum distance between selected nodes.

Reconstructs the path from start to destination.



---

5. Technology Stack

Frontend:

HTML – Structure

CSS – Styling

JavaScript – Application Logic

Leaflet.js – Map Rendering


Optional Backend:

Node.js (server.js) – To serve static files locally



---

6. System Architecture

Client Side:

index.html – UI layout

styles.css – Styling

script.js – Routing logic, algorithm, chat processing, map integration


Server Side (Optional):

server.js – Runs local server at port 3000


The application primarily runs on the client side. All routing logic and data are stored in JavaScript.


---

7. Data Structure

7.1 Campus Locations

Each location contains:

id

name

coordinates (latitude, longitude)


Example Structure: { id: "gate1", name: "Main Gate 1", coordinates: [latitude, longitude] }

7.2 Path Connections

Each path contains:

from (location id)

to (location id)

distance (in meters)


These connections form a graph used for shortest path calculation.


---

8. Algorithm Used – Dijkstra’s Algorithm

Steps:

1. Initialize all nodes with infinite distance.


2. Set starting node distance to 0.


3. Visit the nearest unvisited node.


4. Update distances of its neighbors.


5. Repeat until destination is reached.


6. Reconstruct the shortest path.



Time Complexity: O(V²) for basic implementation.


---

9. Distance and Time Calculation

Total Distance = Sum of edge distances in the shortest path.

Estimated Walking Time: Calculated based on average walking speed (approx. 5 km/h).

Formula: Time (minutes) = (Distance in km × 12)


---

10. Installation and Setup

Run Locally


1. Clone the repository.

git clone https://github.com/AshwinSelvaraj-19/Campus-route-bot.git
cd Campus-route-bot


2. Navigate to project folder.

3.Open through live server.


---


Deployment

Can be deployed using:

GitHub Pages

Netlify

Vercel



---

11. Advantages

Simple and lightweight.

Works fully in browser.

No database required.

Easy to modify or extend.



---

12. Limitations

Location data is hardcoded.

No real-time GPS tracking.

Basic natural language processing.

Depends on browser support for voice recognition.



---

13. Future Enhancements

Add real-time GPS navigation.

Connect to database for dynamic campus data.

Improve chat processing using NLP models.

Add mobile app version.

Include indoor navigation support.



---

