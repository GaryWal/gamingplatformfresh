# 🎮 Central Gaming Hub

A centralized gaming platform where venues connect to download games and compete in real-time competitions.

## 🚀 **Quick Start**

### **Deploy on Render (Recommended)**

1. **Click "New +" → "Blueprint"** in Render
2. **Connect GitHub** repository: `central-gaming-hub`
3. **Render will automatically**:
   - Set up your gaming server
   - Create PostgreSQL database
   - Create Redis cache
   - Deploy everything

### **Local Development**

```bash
cd game-server
npm install
npm start
```

Your platform will be running at: `http://localhost:10000`

## 🎯 **Features**

✅ **Game Distribution** - Venues download games from central hub  
✅ **Real-time Communication** - Socket.io for live updates  
✅ **Competition System** - Venues compete across locations  
✅ **Venue Management** - Register and manage venues  
✅ **API Endpoints** - RESTful API for all operations  

## 📁 **Project Structure**

```
central-gaming-hub/
├── 🖥️ game-server/           # Main gaming server
│   ├── 📦 package.json       # Dependencies
│   ├── 🚀 src/server.js      # Main server
│   └── 📁 public/            # Static files
├── 🏟️ venue-client/          # Venue app (coming soon)
├── 🛠️ admin-dashboard/       # Admin panel (coming soon)
└── 📋 render.yaml            # Render deployment config
```

## �� **Available Games**

- **Speed Racer** - Multi-lane racing game
- **Trivia Master** - Multiplayer trivia competition  
- **Classic Arcade** - Collection of arcade games

## 🔧 **API Endpoints**

- **Health Check**: `GET /health`
- **Games**: `GET /api/games`
- **Venues**: `GET /api/venues`
- **Competitions**: `GET /api/competitions`

## 🚀 **Deployment**

This platform is designed to deploy on Render with one click using the Blueprint option.

---

**🎮 Ready to build your gaming empire? Deploy on Render and start distributing games to venues!** 🚀
