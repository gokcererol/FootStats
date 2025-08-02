// frontend/public/js/App.js

const { useState, useEffect, useMemo, useCallback } = React;

// --- Helper Components ---
const Icon = ({ path, className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
);
const ArrowLeftIcon = () => <Icon path="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />;
const ChevronDownIcon = () => <Icon path="M19.5 8.25l-7.5 7.5-7.5-7.5" />;
const ChevronUpIcon = () => <Icon path="M4.5 15.75l7.5-7.5 7.5 7.5" />;
const UserCircleIcon = () => <Icon path="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />;

// --- Main Components ---

function MatchList({ matches, onSelectMatch, theme }) {
    const cardBgColor = theme === 'light' ? 'bg-white' : 'bg-gray-800';
    const cardBorderColor = theme === 'light' ? 'border-gray-200' : 'border-gray-700';
    const teamNameColor = theme === 'light' ? 'text-gray-900' : 'text-gray-100';
    const timeColor = theme === 'light' ? 'text-gray-500' : 'text-gray-400';
    const scoreColor = theme === 'light' ? 'text-gray-700' : 'text-gray-200';

    const getStatusDisplay = (status) => {
        if (status === 'Finished') return 'FT';
        if (status === 'Halftime') return 'HT';
        return status;
    };

    const formatTime = (match) => {
        if (match.status === 'Scheduled' && match.matchDate) {
            return `${new Date(match.matchDate).toLocaleDateString([], {day: '2-digit', month: 'short'})} ${match.time}`;
        }
        if (match.status === 'Finished' || match.status === 'Halftime') {
            return match.time;
        }
        const [minutes] = match.time.split(':').map(Number);
        if (minutes >= 90 && match.fullTimeOvertime > 0) {
            const overtimeMinutes = minutes - 90;
            if (overtimeMinutes <= match.fullTimeOvertime) {
                return `90 +${overtimeMinutes}'`;
            }
        }
        if (minutes >= 45 && minutes < 90 && match.halfTimeOvertime > 0) {
            const overtimeMinutes = minutes - 45;
             if (overtimeMinutes <= match.halfTimeOvertime) {
                return `45 +${overtimeMinutes}'`;
            }
        }
        return `${minutes}'`;
    };

    return (
        <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto w-full">
            {matches.map(match => (
                <div key={match.id} className={`rounded-xl shadow-md p-6 border ${cardBorderColor} ${cardBgColor} transition-all duration-300 cursor-pointer hover:border-blue-500`} onClick={() => onSelectMatch(match.id)}>
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex flex-col items-center space-y-1 w-1/3 text-center">
                            <img src={match.homeTeamLogo} alt={`${match.homeTeam} Logo`} className="w-12 h-12 object-contain" onError={(e) => e.target.src='https://placehold.co/64x64/CCCCCC/000000?text=Logo'}/>
                            <h2 className={`text-xl font-semibold ${teamNameColor}`}>{match.homeTeam}</h2>
                        </div>
                        <div className="flex flex-col items-center justify-center mx-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium mb-2 ${match.status === 'Live' ? 'bg-green-200 text-green-800' : (match.status === 'Halftime' ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-300 text-gray-800')}`}>{getStatusDisplay(match.status)}</span>
                            <div className={`flex items-center text-3xl font-bold mb-2 ${scoreColor}`}>
                                <span>{match.homeScore}</span><span className="mx-3">-</span><span>{match.awayScore}</span>
                            </div>
                            <div className={`text-center text-sm ${timeColor}`}><span className="font-medium">
                                {formatTime(match)}
                            </span></div>
                        </div>
                        <div className="flex flex-col items-center space-y-1 w-1/3 text-center">
                            <img src={match.awayTeamLogo} alt={`${match.awayTeam} Logo`} className="w-12 h-12 object-contain" onError={(e) => e.target.src='https://placehold.co/64x64/CCCCCC/000000?text=Logo'}/>
                            <h2 className={`text-xl font-semibold ${teamNameColor}`}>{match.awayTeam}</h2>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function MatchDetail({ match, onBack, theme, toggleTheme }) {
    const stats = match.stats;
    const teamNameColor = theme === 'light' ? 'text-gray-900' : 'text-gray-100';
    const timeColor = theme === 'light' ? 'text-gray-500' : 'text-gray-400';
    const scoreColor = theme === 'light' ? 'text-gray-700' : 'text-gray-200';
    const statLabelColor = theme === 'light' ? 'text-gray-600' : 'text-gray-400';
    const eventTextColor = theme === 'light' ? 'text-gray-800' : 'text-gray-100';
    const borderColor = theme === 'light' ? 'border-gray-200' : 'border-gray-700';
    const getEventIcon = (type) => {
        switch (type) {
            case 'goal': return '⚽';
            case 'yellow_card': return '🟨';
            case 'red_card': return '🟥';
            case 'missed_penalty': return '🚫';
            default: return '•';
        }
    };

    return (
        <div className={`p-4 sm:p-6 w-full max-w-2xl mx-auto`}>
            <div className={`flex items-center justify-between mb-4 pb-4 border-b ${borderColor}`}>
                <div className="w-16 flex justify-start"><button onClick={onBack} className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700`}><ArrowLeftIcon /></button></div>
                <h2 className="text-xl font-bold text-center">Match Details</h2>
                <div className="w-16 flex justify-end"><button onClick={toggleTheme} className={`relative w-16 h-8 rounded-full flex items-center transition-colors focus:outline-none ${theme === 'light' ? 'bg-gray-300' : 'bg-gray-700'}`}><span className={`absolute w-7 h-7 rounded-full shadow-md transform transition-transform ${theme === 'light' ? 'translate-x-0 bg-white' : 'translate-x-full bg-gray-200'}`}></span></button></div>
            </div>
            <div className="flex justify-between items-center mb-6">
                <div className="flex flex-col items-center space-y-2 w-1/3 text-center">
                    <img src={match.homeTeamLogo} alt={`${match.homeTeam} Logo`} className="w-16 h-16 object-contain" onError={(e) => e.target.src='https://placehold.co/64x64/CCCCCC/000000?text=Logo'} />
                    <h3 className={`text-xl md:text-2xl font-bold ${teamNameColor}`}>{match.homeTeam}</h3>
                </div>
                <div className="flex flex-col items-center justify-center mx-2 text-center">
                    <div className={`flex items-center text-4xl md:text-5xl font-bold ${scoreColor}`}>
                        <span>{match.homeScore}</span><span className="mx-3">-</span><span>{match.awayScore}</span>
                    </div>
                    <div className={`text-lg mt-2 ${timeColor}`}>
                        {match.status === 'Scheduled' && match.matchDate ? `${new Date(match.matchDate).toLocaleDateString([], {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})} at ${match.time}` : match.time}
                    </div>
                </div>
                <div className="flex flex-col items-center space-y-2 w-1/3 text-center">
                    <img src={match.awayTeamLogo} alt={`${match.awayTeam} Logo`} className="w-16 h-16 object-contain" onError={(e) => e.target.src='https://placehold.co/64x64/CCCCCC/000000?text=Logo'} />
                    <h3 className={`text-xl md:text-2xl font-bold ${teamNameColor}`}>{match.awayTeam}</h3>
                </div>
            </div>
            {stats && (
                <div className={`mt-6 pt-4 border-t ${borderColor}`}>
                    <h4 className="text-lg font-semibold text-center mb-4">Statistics</h4>
                    <div className="space-y-3">
                        <div className="text-center">
                            <div className="flex justify-between text-lg font-bold mb-1">
                                <span>{stats.possession.home}%</span><span className={`${statLabelColor}`}>Possession</span><span>{stats.possession.away}%</span>
                            </div>
                            <div className="flex w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className="bg-blue-500" style={{ width: `${stats.possession.home}%` }}></div><div className="bg-red-500" style={{ width: `${stats.possession.away}%` }}></div>
                            </div>
                        </div>
                        {Object.keys(stats).filter(k => k !== 'possession').map(key => (
                             <div key={key} className="text-center">
                                <div className="flex justify-between items-center text-lg font-bold">
                                    <span>{stats[key].home}</span><span className={`text-sm font-normal capitalize ${statLabelColor}`}>{key.replace(/([A-Z])/g, ' $1')}</span><span>{stats[key].away}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {match.matchEvents && match.matchEvents.length > 0 && (
                <div className={`mt-6 pt-4 border-t ${borderColor}`}>
                    <h4 className="text-lg font-semibold text-center mb-4">Timeline</h4>
                    <div className="relative">
                        <div className="absolute left-1/2 h-full w-0.5 bg-gray-200 dark:bg-gray-700 transform -translate-x-1/2"></div>
                        {match.matchEvents.sort((a,b) => parseInt(a.minute) - parseInt(b.minute)).map((event, index) => (
                            <div key={index} className={`flex items-center my-4 ${event.team === 'home' ? 'justify-start' : 'justify-end'}`}>
                                {event.team === 'home' && (<div className="flex items-center w-1/2 pr-6 text-right justify-end"><span className={`text-sm ${eventTextColor}`}>{event.player}</span><span className="text-xl ml-2">{getEventIcon(event.type)}</span></div>)}
                                <div className="absolute left-1/2 transform -translate-x-1/2 bg-gray-300 text-gray-900 dark:bg-gray-600 dark:text-gray-50 rounded-full w-8 h-8 flex items-center justify-center font-mono text-xs z-10">{event.minute}'</div>
                                {event.team === 'away' && (<div className="flex items-center w-1/2 pl-6 text-left justify-start"><span className="text-xl mr-2">{getEventIcon(event.type)}</span><span className={`text-sm ${eventTextColor}`}>{event.player}</span></div>)}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function LoginPage({ onLoginSuccess, onBack, theme }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            if (response.ok) {
                onLoginSuccess();
            } else {
                const data = await response.json();
                setError(data.message || 'Login failed.');
            }
        } catch (err) {
            setError('Could not connect to the server.');
        } finally {
            setLoading(false);
        }
    };
    
    const bgColor = theme === 'light' ? 'bg-white' : 'bg-gray-800';
    const textColor = theme === 'light' ? 'text-gray-800' : 'text-white';
    const inputBg = theme === 'light' ? 'bg-gray-100' : 'bg-gray-700';

    return (
        <div className="w-full h-full flex items-center justify-center p-4">
            <div className={`w-full max-w-md mx-auto p-8 rounded-xl shadow-lg ${bgColor} ${textColor}`}>
                <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-2">Username</label>
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className={`w-full p-2 rounded ${inputBg}`} placeholder="admin"/>
                    </div>
                    <div className="mb-6">
                        <label className="block mb-2">Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full p-2 rounded ${inputBg}`} placeholder="password"/>
                    </div>
                    {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                    <button type="submit" disabled={loading} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:bg-blue-300">
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                    <button type="button" onClick={onBack} className="w-full mt-2 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">Back to Matches</button>
                </form>
            </div>
        </div>
    );
}

function ManageMatch({ match, theme, onDelete }) {
    const [stats, setStats] = useState(match.stats);
    const [event, setEvent] = useState({ type: 'goal', team: 'home', player: '' });
    const [overtime, setOvertime] = useState({ 
        halfTime: match.halfTimeOvertime || 0, 
        fullTime: match.fullTimeOvertime || 0 
    });

    useEffect(() => {
    }, [match.id]);

    const handleStatChange = (stat, team, value) => {
        const newStats = { ...stats, [stat]: { ...stats[stat], [team]: parseInt(value, 10) || 0 } };
        setStats(newStats);
    };

    const handleOvertimeChange = (type, value) => {
        setOvertime(prev => ({ ...prev, [type]: parseInt(value, 10) || 0 }));
    };

    const handleEventChange = (field, value) => {
        setEvent(prev => ({ ...prev, [field]: value }));
    };

    const saveMatchDetails = async () => {
        await fetch(`http://localhost:5000/admin/matches/${match.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                stats, 
                halfTimeOvertime: overtime.halfTime,
                fullTimeOvertime: overtime.fullTime 
            }),
        });
    };

    const addEvent = async () => {
        if (!event.player) {
            alert('Please enter a player name for the event.');
            return;
        }
        await fetch(`http://localhost:5000/admin/matches/${match.id}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event),
        });
        setEvent({ type: 'goal', team: 'home', player: '' });
    };
    
    const updateMatchStatus = async (status) => {
        const updates = { status };
        if (status === 'Finished') updates.time = 'FT';
        await fetch(`http://localhost:5000/admin/matches/${match.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
    };

    const cardBg = theme === 'light' ? 'bg-white' : 'bg-gray-800';
    const inputBg = theme === 'light' ? 'bg-gray-100' : 'bg-gray-700';

    return (
        <div className={`p-4 rounded-lg shadow-md ${cardBg}`}>
            <div className="flex justify-between items-start">
                <h4 className="font-bold text-lg mb-4">{match.homeTeam} vs {match.awayTeam} ({match.status})</h4>
                <button onClick={() => onDelete(match.id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">Delete</button>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
                <button onClick={() => updateMatchStatus('Live')} className="bg-green-500 text-white p-2 rounded disabled:bg-gray-400" disabled={match.status === 'Live' || match.status === 'Finished'}>
                    {match.status === 'Halftime' ? 'Resume' : 'Start'}
                </button>
                <button onClick={() => updateMatchStatus('Halftime')} className="bg-orange-500 text-white p-2 rounded disabled:bg-gray-400" disabled={match.status !== 'Live'}>Halftime</button>
                <button onClick={() => updateMatchStatus('Finished')} className="bg-yellow-500 text-white p-2 rounded disabled:bg-gray-400" disabled={match.status === 'Finished'}>End Match</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-4">
                <div>
                    <h5 className="font-semibold mb-2 text-center">{match.homeTeam} Stats</h5>
                    {Object.keys(stats).map(statKey => (
                        <div key={statKey} className="flex items-center justify-between mb-2">
                            <label className="capitalize text-sm">{statKey.replace(/([A-Z])/g, ' $1')}</label>
                            <input type="number" value={stats[statKey].home} onChange={(e) => handleStatChange(statKey, 'home', e.target.value)} className={`w-20 p-1 rounded text-center ${inputBg}`} />
                        </div>
                    ))}
                </div>
                <div>
                    <h5 className="font-semibold mb-2 text-center">{match.awayTeam} Stats</h5>
                    {Object.keys(stats).map(statKey => (
                        <div key={statKey} className="flex items-center justify-between mb-2">
                            <label className="capitalize text-sm">{statKey.replace(/([A-Z])/g, ' $1')}</label>
                            <input type="number" value={stats[statKey].away} onChange={(e) => handleStatChange(statKey, 'away', e.target.value)} className={`w-20 p-1 rounded text-center ${inputBg}`} />
                        </div>
                    ))}
                </div>
            </div>

            <div className="mb-4">
                <h5 className="font-semibold mb-2 text-center">Overtime (minutes)</h5>
                <div className="flex justify-around">
                    <div className="flex items-center">
                        <label className="mr-2">Halftime:</label>
                        <input type="number" value={overtime.halfTime} onChange={e => handleOvertimeChange('halfTime', e.target.value)} className={`w-20 p-1 rounded text-center ${inputBg}`} />
                    </div>
                    <div className="flex items-center">
                        <label className="mr-2">Fulltime:</label>
                        <input type="number" value={overtime.fullTime} onChange={e => handleOvertimeChange('fullTime', e.target.value)} className={`w-20 p-1 rounded text-center ${inputBg}`} />
                    </div>
                </div>
            </div>
            
            <button onClick={saveMatchDetails} className="w-full mb-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">Save Stats & Overtime</button>

            <div>
                <h5 className="font-semibold mb-2 text-center">Add Match Event</h5>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <select value={event.type} onChange={e => handleEventChange('type', e.target.value)} className={`p-2 rounded ${inputBg}`}>
                        <option value="goal">Goal</option>
                        <option value="yellow_card">Yellow Card</option>
                        <option value="red_card">Red Card</option>
                        <option value="missed_penalty">Missed Penalty</option>
                    </select>
                    <select value={event.team} onChange={e => handleEventChange('team', e.target.value)} className={`p-2 rounded ${inputBg}`}>
                        <option value="home">{match.homeTeam}</option>
                        <option value="away">{match.awayTeam}</option>
                    </select>
                    <input type="text" placeholder="Player Name" value={event.player} onChange={e => handleEventChange('player', e.target.value)} className={`p-2 rounded sm:col-span-2 ${inputBg}`} />
                </div>
                <button onClick={addEvent} className="w-full mt-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded">Add Event</button>
            </div>
        </div>
    );
}

function AdminPanel({ matches, onLogout, theme }) {
    const [teamPresets, setTeamPresets] = useState([]);
    const [homeTeam, setHomeTeam] = useState('');
    const [awayTeam, setAwayTeam] = useState('');
    const [homeLogo, setHomeLogo] = useState('');
    const [awayLogo, setAwayLogo] = useState('');
    const [matchDate, setMatchDate] = useState('');
    const [matchTime, setMatchTime] = useState('');
    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamLogo, setNewTeamLogo] = useState('');

    const fetchTeams = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:5000/api/teams');
            if (response.ok) {
                const data = await response.json();
                setTeamPresets(data);
                localStorage.setItem('teamPresets', JSON.stringify(data));
            } else {
                throw new Error('Server error');
            }
        } catch (error) {
            console.error("Failed to fetch team presets, loading from local storage.", error);
            const savedTeams = localStorage.getItem('teamPresets');
            if (savedTeams) {
                setTeamPresets(JSON.parse(savedTeams));
            }
        }
    }, []);

    useEffect(() => {
        fetchTeams();
    }, [fetchTeams]);

    const handleTeamSelect = (teamName, teamSide) => {
        const selectedTeam = teamPresets.find(t => t.name === teamName);
        if (selectedTeam) {
            if (teamSide === 'home') {
                setHomeTeam(selectedTeam.name);
                setHomeLogo(selectedTeam.logo);
            } else {
                setAwayTeam(selectedTeam.name);
                setAwayLogo(selectedTeam.logo);
            }
        } else {
            if (teamSide === 'home') {
                setHomeTeam('');
                setHomeLogo('');
            } else {
                setAwayTeam('');
                setAwayLogo('');
            }
        }
    };

    const createMatch = async () => {
        if (!homeTeam || !awayTeam) {
            alert('Please select both teams.');
            return;
        }
        await fetch('http://localhost:5000/admin/matches', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                homeTeam, 
                awayTeam, 
                homeTeamLogo: homeLogo, 
                awayTeamLogo: awayLogo, 
                matchDate, 
                matchTime 
            }),
        });
        setHomeTeam('');
        setAwayTeam('');
        setHomeLogo('');
        setAwayLogo('');
        setMatchDate('');
        setMatchTime('');
    };
    
    const deleteMatch = async (id) => {
        if (window.confirm('Are you sure you want to delete this match? This action cannot be undone.')) {
            await fetch(`http://localhost:5000/admin/matches/${id}`, {
                method: 'DELETE',
            });
        }
    };

    const saveNewTeam = async () => {
        if (!newTeamName || !newTeamLogo) {
            alert('Please provide a name and logo for the new team.');
            return;
        }
        try {
            const response = await fetch('http://localhost:5000/api/teams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newTeamName, logo: newTeamLogo }),
            });
            if (response.ok) {
                const newTeam = await response.json();
                const updatedPresets = [...teamPresets, newTeam];
                setTeamPresets(updatedPresets);
                localStorage.setItem('teamPresets', JSON.stringify(updatedPresets));
                setNewTeamName('');
                setNewTeamLogo('');
            } else {
                alert('Failed to save team.');
            }
        } catch (error) {
            alert('Server is down. Could not save new team.');
        }
    };
    
    const cardBg = theme === 'light' ? 'bg-white' : 'bg-gray-800';
    const inputBg = theme === 'light' ? 'bg-gray-100' : 'bg-gray-700';

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Admin Panel</h2>
                <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">Logout</button>
            </div>

            <div className={`p-6 rounded-lg shadow-md mb-8 ${cardBg}`}>
                <h3 className="text-xl font-semibold mb-4">Add New Team Preset</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <input type="text" placeholder="New Team Name" value={newTeamName} onChange={e => setNewTeamName(e.target.value)} className={`p-2 rounded ${inputBg}`} />
                    <input type="text" placeholder="New Team Logo URL" value={newTeamLogo} onChange={e => setNewTeamLogo(e.target.value)} className={`p-2 rounded ${inputBg}`} />
                    {newTeamLogo && <div className="md:col-span-2 flex justify-center"><img src={newTeamLogo} alt="Preview" className="h-16 object-contain border rounded p-1"/></div>}
                    <button onClick={saveNewTeam} className="md:col-span-2 bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded">Save New Team</button>
                </div>
            </div>

            <div className={`p-6 rounded-lg shadow-md mb-8 ${cardBg}`}>
                <h3 className="text-xl font-semibold mb-4">Create New Match</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select value={homeTeam} onChange={e => handleTeamSelect(e.target.value, 'home')} className={`p-2 rounded ${inputBg}`}>
                        <option value="">Select Home Team</option>
                        {teamPresets.map(team => <option key={team.name} value={team.name}>{team.name}</option>)}
                    </select>
                    <select value={awayTeam} onChange={e => handleTeamSelect(e.target.value, 'away')} className={`p-2 rounded ${inputBg}`}>
                        <option value="">Select Away Team</option>
                        {teamPresets.map(team => <option key={team.name} value={team.name}>{team.name}</option>)}
                    </select>
                    <input type="date" value={matchDate} onChange={e => setMatchDate(e.target.value)} className={`p-2 rounded ${inputBg}`} />
                    <input type="time" value={matchTime} onChange={e => setMatchTime(e.target.value)} className={`p-2 rounded ${inputBg}`} />
                    <button onClick={createMatch} className="md:col-span-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">Create Match</button>
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-xl font-semibold mb-4">Manage Matches</h3>
                {matches.map(match => (
                    <ManageMatch key={match.id} match={match} theme={theme} onDelete={deleteMatch} />
                ))}
            </div>
        </div>
    );
}

function App() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [theme, setTheme] = useState('light');
    const [view, setView] = useState('main'); // main, detail, login, admin
    const [selectedMatchId, setSelectedMatchId] = useState(null);
    const [filter, setFilter] = useState('All');
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const toggleTheme = () => setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));

    useEffect(() => {
        const eventSource = new EventSource('http://localhost:5000/live-scores');
        eventSource.onmessage = (event) => {
            setMatches(JSON.parse(event.data));
            setLoading(false);
        };
        eventSource.onerror = () => {
            setError("Could not connect to live data server.");
            setLoading(false);
            eventSource.close();
        };
        return () => eventSource.close();
    }, []);

    const handleSelectMatch = (id) => { setSelectedMatchId(id); setView('detail'); };
    const handleBack = () => setView('main');
    const handleLoginSuccess = () => { setIsLoggedIn(true); setView('admin'); };
    const handleLogout = () => { setIsLoggedIn(false); setView('main'); };

    const themeBgColor = theme === 'light' ? 'bg-gray-100' : 'bg-gray-900';
    const themeTextColor = theme === 'light' ? 'text-gray-800' : 'text-gray-100';
    const headingBg = theme === 'light' ? 'bg-blue-100' : 'bg-blue-900';
    const headingTextColor = theme === 'light' ? 'text-gray-800' : 'text-gray-100';

    const selectedMatch = view === 'detail' ? matches.find(m => m.id === selectedMatchId) : null;
    const filteredMatches = useMemo(() => {
        if (filter === 'Live') return matches.filter(m => m.status === 'Live');
        if (filter === 'Fulltime') return matches.filter(m => m.status === 'Finished');
        return matches;
    }, [matches, filter]);
    
    const getFilterButtonClasses = (buttonFilter) => {
        const baseClasses = 'px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200';
        if (filter === buttonFilter) {
            return `${baseClasses} bg-blue-500 text-white shadow`;
        }
        if (theme === 'light') {
            return `${baseClasses} bg-white text-gray-700 hover:bg-gray-200`;
        }
        return `${baseClasses} bg-gray-700 text-gray-200 hover:bg-gray-600`;
    };

    const renderView = () => {
        switch (view) {
            case 'login':
                return <LoginPage onLoginSuccess={handleLoginSuccess} onBack={handleBack} theme={theme} />;
            case 'admin':
                return (
                    <div className="flex-grow overflow-y-auto">
                        <AdminPanel matches={matches} onLogout={handleLogout} theme={theme} />
                    </div>
                );
            case 'detail':
                return (
                    <div className="flex-grow overflow-y-auto">
                        {selectedMatch ? <MatchDetail match={selectedMatch} onBack={handleBack} theme={theme} toggleTheme={toggleTheme} /> : <p>Match not found.</p>}
                    </div>
                );
            default:
                return (
                    <>
                        <header className={`px-6 pt-6 pb-4 sticky top-0 z-10 ${themeBgColor}`}>
                            <div className="max-w-2xl mx-auto">
                                <div className="flex justify-between items-center">
                                    <button onClick={() => setView(isLoggedIn ? 'admin' : 'login')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                        <UserCircleIcon />
                                    </button>
                                    <h1 className={`text-3xl font-bold text-center rounded-lg p-3 shadow-md ${headingBg} ${headingTextColor}`}>FootStats</h1>
                                    <button onClick={toggleTheme} className={`relative w-16 h-8 rounded-full flex items-center`}>
                                        <span className={`absolute w-7 h-7 rounded-full shadow-md transform transition-transform ${theme === 'light' ? 'translate-x-0 bg-white' : 'translate-x-full bg-gray-200'}`}></span>
                                    </button>
                                </div>
                                <div className="mt-4 flex justify-center space-x-2">
                                    {['All', 'Live', 'Fulltime'].map(f => (
                                        <button key={f} onClick={() => setFilter(f)} className={getFilterButtonClasses(f)}>
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </header>
                        <main className="flex-grow overflow-y-auto px-6 pb-6">
                            <MatchList matches={filteredMatches} onSelectMatch={handleSelectMatch} theme={theme} />
                        </main>
                        <footer className="text-center text-xs p-4">
                            <p>All rights reserved.</p>
                        </footer>
                    </>
                );
        }
    };

    if (loading) {
        return <div className={`w-screen h-screen flex items-center justify-center ${themeBgColor} ${themeTextColor}`}><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div></div>;
    }

    if (error) {
        return <div className={`w-screen h-screen flex items-center justify-center p-4 text-center text-red-600 ${themeBgColor}`}><p className="text-lg font-semibold">Error: {error}</p></div>;
    }

    return <div className={`w-screen h-screen flex flex-col ${themeBgColor} ${themeTextColor}`}>{renderView()}</div>;
}
