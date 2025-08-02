# FootStats - Live Football Score Application

## ⚽ Overview

FootStats is a dynamic, real-time web application designed to provide live updates for football matches. It features a clean, responsive user interface for fans to follow live scores and a comprehensive admin panel for managing all aspects of the matches, from creation to live event tracking.

The application is built with a Node.js backend that uses Server-Sent Events (SSE) to push live data to a React-based frontend, ensuring instant updates without the need for constant polling.

## ✨ Features

- **Live Match List:** View all scheduled, live, and finished matches in a clean, full-screen interface.
- **Real-Time Updates:** Scores, match time, and statuses update automatically in real-time.
- **Match Filtering:** Filter the match list to show "All", "Live", or "Fulltime" games.
- **Detailed Match View:** Click on any match to see a detailed view with a timeline of events and in-depth statistics.
- **Responsive Design:** The UI is designed to work seamlessly on desktop, tablet, and mobile devices.
- **Light & Dark Mode:** Toggle between light and dark themes for comfortable viewing.
- **Comprehensive Admin Panel:**
    - **Secure Login:** Access the admin panel via a dedicated login page (`admin`/`password`).
    - **Team Presets:** Create matches quickly by selecting from a list of preset teams.
    - **Add & Save New Teams:** Manually add new teams with their logos. The list is saved persistently, even after a server restart.
    - **Match Creation:** Schedule new matches with specific dates, times, and team logos.
    - **Full Match Control:** Start matches, set them to halftime, resume, and end them.
    - **Live Stat Editing:** Adjust all match stats (possession, shots, corners, etc.) in real-time.
    - **Event Management:** Add key match events like goals, cards, and missed penalties with player names.
    - **Overtime Management:** Set and display halftime and fulltime overtime minutes.
    - **Delete Matches:** Remove matches from the system.

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Frontend:** React (via CDN), JavaScript (ES6+), Tailwind CSS
- **Real-Time Communication:** Server-Sent Events (SSE)
- **Data Persistence:**
    - Match data is stored in-memory on the server.
    - Team presets are saved to a persistent `teams.json` file.

## 🚀 Getting Started

To get the application running on your local machine, follow these steps.

### Prerequisites

- [Node.js](https://nodejs.org/) installed on your machine.

### 1. Backend Setup

1.  **Navigate to the Backend Directory:**
    Open your terminal and change into the directory where `server.js` is located.

2.  **Install Dependencies:**
    Run the following command to install the necessary Node.js packages:
    ```bash
    npm install express cors body-parser
    ```

3.  **Run the Server:**
    Start the backend server with this command:
    ```bash
    node server.js
    ```
    The server will start on `http://localhost:5000`. You should see a confirmation message in your terminal.

### 2. Frontend Setup

1.  **Place Files:**
    Ensure your `index.html` file and `js/App.js` file are in a `public` directory or a similar structure.

2.  **Open in Browser:**
    Simply open the `index.html` file directly in your web browser. The application will connect to the running backend server and display the live match data.

## 🔐 Admin Access

- **URL:** Click the user icon in the top-left corner of the main page.
- **Username:** `admin`
- **Password:** `password`

Enjoy managing your live football scores with FootStats!
