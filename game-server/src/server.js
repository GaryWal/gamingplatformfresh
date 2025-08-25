const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

class CentralGamingHub {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = socketIo(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    
    this.games = new Map();
    this.venues = new Map();
    this.competitions = new Map();
    
    this.initializeGameLibrary();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupSocketHandlers();
  }

  initializeGameLibrary() {
    // Sample games for testing
    this.games.set('racing-1', {
      id: 'racing-1',
      name: 'Speed Racer',
      type: 'racing',
      description: 'Multi-lane racing game with tilt controls',
      version: '1.0.0',
      size: 1024 * 1024 * 5, // 5MB
      thumbnail: '/assets/racing-thumbnail.jpg',
      status: 'active'
    });

    this.games.set('quiz-1', {
      id: 'quiz-1',
      name: 'Trivia Master',
      type: 'quiz',
      description: 'Multiplayer trivia competition',
      version: '1.0.0',
      size: 1024 * 1024 * 2, // 2MB
      thumbnail: '/assets/quiz-thumbnail.jpg',
      status: 'active'
    });

    this.games.set('arcade-1', {
      id: 'arcade-1',
      name: 'Classic Arcade',
      type: 'arcade',
      description: 'Collection of classic arcade games',
      version: '1.0.0',
      size: 1024 * 1024 * 10, // 10MB
      thumbnail: '/assets/arcade-thumbnail.jpg',
      status: 'active'
    });
  }

  setupMiddleware() {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(compression());
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    
    // Static files
    this.app.use('/public', express.static(path.join(__dirname, '../public')));
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        activeVenues: this.venues.size,
        activeCompetitions: this.competitions.size,
        gamesAvailable: this.games.size
      });
    });

    // Games API
    this.app.get('/api/games', (req, res) => {
      const games = Array.from(this.games.values());
      res.json(games);
    });

    this.app.get('/api/games/:gameId', (req, res) => {
      const game = this.games.get(req.params.gameId);
      if (game) {
        res.json(game);
      } else {
        res.status(404).json({ error: 'Game not found' });
      }
    });

    // Venues API
    this.app.get('/api/venues', (req, res) => {
      const venues = Array.from(this.venues.values());
      res.json(venues);
    });

    this.app.post('/api/venues/register', (req, res) => {
      try {
        const { venueName, venueType, contactInfo } = req.body;
        const venue = {
          id: `venue-${Date.now()}`,
          name: venueName,
          type: venueType,
          contactInfo,
          status: 'active',
          createdAt: new Date(),
          lastSeen: new Date()
        };

        this.venues.set(venue.id, venue);
        res.json({ venue, message: 'Venue registered successfully' });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    // Competitions API
    this.app.get('/api/competitions', (req, res) => {
      const competitions = Array.from(this.competitions.values());
      res.json(competitions);
    });

    this.app.post('/api/competitions', (req, res) => {
      try {
        const { name, gameId, type, startDate, endDate } = req.body;
        const competition = {
          id: `comp-${Date.now()}`,
          name,
          gameId,
          type: type || 'tournament',
          status: 'active',
          startDate,
          endDate,
          createdAt: new Date(),
          venues: [],
          scores: []
        };

        this.competitions.set(competition.id, competition);
        res.json({ competition, message: 'Competition created successfully' });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    // Root route
    this.app.get('/', (req, res) => {
      res.json({
        message: '🎮 Central Gaming Hub - Game Distribution Platform',
        version: '1.0.0',
        endpoints: {
          health: '/health',
          games: '/api/games',
          venues: '/api/venues',
          competitions: '/api/competitions'
        }
      });
      });
    }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);
      
      // Venue connection
      socket.on('venue:connect', (data) => {
        this.handleVenueConnection(socket, data);
      });
      
      // Game request
      socket.on('game:request', (data) => {
        this.handleGameRequest(socket, data);
      });
      
      // Score submission
      socket.on('score:submit', (data) => {
        this.handleScoreSubmission(socket, data);
      });
      
      // Disconnect
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }

  handleVenueConnection(socket, data) {
    const { venueId, venueInfo } = data;
    
    console.log(`Venue ${venueId} connected`);
    
    // Join venue room
    socket.join(`venue:${venueId}`);
    socket.venueId = venueId;
    
    // Send available games
    const availableGames = Array.from(this.games.values());
    socket.emit('games:available', availableGames);
    
    // Send active competitions
    const activeCompetitions = Array.from(this.competitions.values()).filter(c => c.status === 'active');
    socket.emit('competitions:active', activeCompetitions);
  }

  handleGameRequest(socket, data) {
    const { gameId, venueId } = data;
    
    console.log(`Game ${gameId} requested by venue ${venueId}`);
    
    const game = this.games.get(gameId);
    if (game) {
      socket.emit('game:download', {
        id: game.id,
        name: game.name,
        downloadUrl: `/api/games/${game.id}/download`,
        size: game.size,
        version: game.version
      });
    } else {
      socket.emit('error', { message: 'Game not found' });
    }
  }

  handleScoreSubmission(socket, data) {
    const { venueId, gameId, playerScores, gameData } = data;
    
    console.log(`Scores submitted for game ${gameId} by venue ${venueId}`);
    
    // Process scores for competitions
    this.competitions.forEach(competition => {
      if (competition.gameId === gameId && competition.venues.includes(venueId)) {
        // Update competition scores
        if (!competition.scores) competition.scores = [];
        competition.scores.push({
          venueId,
          gameId,
          playerScores,
          gameData,
          timestamp: new Date()
        });
      }
    });
    
    // Broadcast updated leaderboards
    this.io.emit('leaderboards:updated', {
      gameId,
      message: 'Scores updated successfully'
    });
  }

  start(port = process.env.PORT || 10000) {
    this.server.listen(port, () => {
      console.log(`🎮 Central Gaming Hub running on port ${port}`);
      console.log(`🏟️  Ready to distribute games to venues!`);
      console.log(`📊 Health check: http://localhost:${port}/health`);
      console.log(`🎯 API endpoints: http://localhost:${port}/api`);
    });
  }
}

// Start the server
const hub = new CentralGamingHub();
hub.start();

module.exports = CentralGamingHub;
