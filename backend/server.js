// backend/server.js

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs'); // File System module for reading/writing files
const path = require('path');

const app = express();
const PORT = 5000;

// --- Middleware ---
app.use(cors());
app.use(bodyParser.json());

// --- Persistent Data Setup ---
const TEAMS_FILE_PATH = path.join(__dirname, 'teams.json');
let teamPresets = [];

// Initial default teams if the file doesn't exist
const defaultTeams = [
    { name: 'Real Madrid', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png' },
    { name: 'Barcelona', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/1200px-FC_Barcelona_%28crest%29.svg.png' },
    { name: 'Man Utd', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Manchester_United_FC_crest.svg/1200px-Manchester_United_FC_crest.svg.png' },
    { name: 'Liverpool', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/1200px-Liverpool_FC.svg.png' },
    { name: 'Bayern Munich', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/1200px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png' },
    { name: 'Dortmund', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Borussia_Dortmund_logo.svg/1200px-Borussia_Dortmund_logo.svg.png' },
];

// Function to load teams from file, or create the file if it doesn't exist
const loadTeams = () => {
    try {
        if (fs.existsSync(TEAMS_FILE_PATH)) {
            const data = fs.readFileSync(TEAMS_FILE_PATH, 'utf8');
            teamPresets = JSON.parse(data);
        } else {
            teamPresets = defaultTeams;
            fs.writeFileSync(TEAMS_FILE_PATH, JSON.stringify(teamPresets, null, 2));
        }
    } catch (error) {
        console.error("Error loading or creating teams file:", error);
        teamPresets = defaultTeams; // Fallback to defaults
    }
};

// Function to save teams to the file
const saveTeams = () => {
    try {
        fs.writeFileSync(TEAMS_FILE_PATH, JSON.stringify(teamPresets, null, 2));
    } catch (error) {
        console.error("Error saving teams file:", error);
    }
};

let liveMatches = [];

// --- Simulation Logic ---
function updateLiveMatches() {
    liveMatches.forEach(match => {
        if (match.status === 'Live') {
            let [minutes, seconds] = match.time.split(':').map(Number);
            seconds += 1;
            if (seconds >= 60) {
                minutes++;
                seconds = 0;
            }
            match.time = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            
            if (minutes >= 90 + (match.fullTimeOvertime || 0)) {
                match.status = 'Finished';
                match.time = 'FT';
            }
        }
    });
}

// --- API Endpoints ---
app.get('/live-scores', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });
    const sendLiveScores = () => res.write(`data: ${JSON.stringify(liveMatches)}\n\n`);
    sendLiveScores();
    const intervalId = setInterval(sendLiveScores, 1000);
    req.on('close', () => clearInterval(intervalId));
});

app.get('/api/teams', (req, res) => {
    res.status(200).json(teamPresets);
});

app.post('/api/teams', (req, res) => {
    const { name, logo } = req.body;
    if (!name || !logo) {
        return res.status(400).json({ message: 'Team name and logo are required.' });
    }
    const newTeam = { name, logo };
    teamPresets.push(newTeam);
    saveTeams(); // Save the updated list to the file
    res.status(201).json(newTeam);
});

// --- Admin Endpoints ---
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'password') {
        res.status(200).json({ message: 'Login successful' });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

app.post('/admin/matches', (req, res) => {
    const { homeTeam, awayTeam, homeTeamLogo, awayTeamLogo, matchDate, matchTime } = req.body;
    if (!homeTeam || !awayTeam) {
        return res.status(400).json({ message: 'Home and away teams are required.' });
    }
    const newMatch = {
        id: liveMatches.length > 0 ? Math.max(...liveMatches.map(m => m.id)) + 1 : 1,
        homeTeam,
        awayTeam,
        homeScore: 0,
        awayScore: 0,
        time: matchTime || '00:00',
        matchDate: matchDate || null,
        status: 'Scheduled',
        homeTeamLogo: homeTeamLogo || 'https://placehold.co/64x64/CCCCCC/000000?text=Logo',
        awayTeamLogo: awayTeamLogo || 'https://placehold.co/64x64/CCCCCC/000000?text=Logo',
        matchEvents: [],
        stats: {
            possession: { home: 50, away: 50 },
            shots: { home: 0, away: 0 },
            shotsOnTarget: { home: 0, away: 0 },
            corners: { home: 0, away: 0 },
            fouls: { home: 0, away: 0 },
        },
        halfTimeOvertime: 0,
        fullTimeOvertime: 0,
    };
    liveMatches.push(newMatch);
    res.status(201).json(newMatch);
});

app.put('/admin/matches/:id', (req, res) => {
    const matchId = parseInt(req.params.id, 10);
    const updates = req.body;
    const matchIndex = liveMatches.findIndex(m => m.id === matchId);
    if (matchIndex === -1) return res.status(404).json({ message: 'Match not found' });

    const currentMatch = liveMatches[matchIndex];

    if (updates.status === 'Live' && currentMatch.status === 'Scheduled') {
        updates.time = '00:00';
    }
    if (updates.status === 'Live' && currentMatch.status === 'Halftime') {
        updates.time = '45:00';
    }
    if (updates.status === 'Halftime') {
        updates.time = 'HT';
    }

    liveMatches[matchIndex] = { ...liveMatches[matchIndex], ...updates };
    if (updates.stats) {
         liveMatches[matchIndex].stats = { ...liveMatches[matchIndex].stats, ...updates.stats };
    }
    res.status(200).json(liveMatches[matchIndex]);
});

app.post('/admin/matches/:id/events', (req, res) => {
    const matchId = parseInt(req.params.id, 10);
    const { type, team, player } = req.body;
    const matchIndex = liveMatches.findIndex(m => m.id === matchId);
    if (matchIndex === -1) return res.status(404).json({ message: 'Match not found' });
    const match = liveMatches[matchIndex];
    const newEvent = {
        type,
        team,
        player: player || 'Unknown Player',
        minute: match.time.split(':')[0]
    };
    match.matchEvents.push(newEvent);
    if (type === 'goal') {
        if (team === 'home') match.homeScore++;
        else match.awayScore++;
    }
    res.status(201).json(newEvent);
});

app.delete('/admin/matches/:id', (req, res) => {
    const matchId = parseInt(req.params.id, 10);
    const initialLength = liveMatches.length;
    liveMatches = liveMatches.filter(m => m.id !== matchId);
    if (liveMatches.length < initialLength) {
        res.status(200).json({ message: 'Match deleted successfully' });
    } else {
        res.status(404).json({ message: 'Match not found' });
    }
});

// --- Server Initialization ---
app.listen(PORT, () => {
    loadTeams(); // Load teams on server start
    console.log(`Backend server running on http://localhost:${PORT}`);
    setInterval(updateLiveMatches, 1000);
});
