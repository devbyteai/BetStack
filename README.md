# BetStack

Full-stack sports betting platform with real-time odds, live betting, casino games, and mobile money payments. Built with React Native, Node.js, PostgreSQL, Redis, and WebSocket.

<p align="center">
  <strong>Created by <a href="https://github.com/devbyteai">@devbyteai</a></strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React%20Native-0.83.1-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.io-4.8-010101?style=for-the-badge&logo=socket.io&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Redux%20Toolkit-2.11-764ABC?style=for-the-badge&logo=redux&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-5.x-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Knex.js-3.1-E16426?style=for-the-badge&logo=knex&logoColor=white" />
  <img src="https://img.shields.io/badge/Zod-4.x-3E67B1?style=for-the-badge&logo=zod&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />
  <img src="https://img.shields.io/badge/Argon2-Hashing-6C3483?style=for-the-badge" />
</p>

---

## Architecture Overview

```
                              MOBILE APP
                         React Native + TypeScript
  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
  │   Redux     │  │  RTK Query  │  │  Socket.io  │  │ NativeWind  │
  │   Toolkit   │  │   (Cache)   │  │   Client    │  │ (Tailwind)  │
  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
                                │
                    ┌───────────┴───────────┐
                    │    HTTPS / WSS        │
                    └───────────┬───────────┘
                                │
                              BACKEND API
                         Node.js + Express + TypeScript
  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
  │   Express   │  │  Socket.io  │  │   Helmet    │  │    Zod      │
  │   Router    │  │   Server    │  │  Security   │  │ Validation  │
  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
  │    JWT      │  │   Argon2    │  │Rate Limiter │  │   Winston   │
  │    Auth     │  │  Password   │  │   (Redis)   │  │   Logger    │
  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
                          │                   │
            ┌─────────────┴─────────────┐ ┌───┴───────────┐
            │                           │ │               │
    ┌───────┴───────┐           ┌───────┴───────┐ ┌───────┴───────┐
    │  PostgreSQL   │           │     Redis     │ │     Redis     │
    │   Database    │           │     Cache     │ │   Rate Limit  │
    │   (Knex.js)   │           │   (ioredis)   │ │    Storage    │
    └───────────────┘           └───────────────┘ └───────────────┘
```

---

## Complete Tech Stack

### Mobile App (React Native)

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Framework** | React Native | 0.83.1 | Cross-platform mobile development |
| **Runtime** | React | 19.2.0 | UI component library |
| **Language** | TypeScript | 5.8.3 | Type-safe JavaScript |
| **State Management** | Redux Toolkit | 2.11.2 | Global state management |
| **API Layer** | RTK Query | 2.11.2 | Data fetching & caching |
| **Navigation** | React Navigation | 7.x | Screen navigation |
| **Styling** | NativeWind | 4.2.1 | Tailwind CSS for React Native |
| **CSS Framework** | Tailwind CSS | 3.4.19 | Utility-first CSS |
| **Forms** | React Hook Form | 7.70.0 | Form state management |
| **Validation** | Zod | 4.3.5 | Schema validation |
| **HTTP Client** | Axios | 1.13.2 | REST API calls |
| **Real-time** | Socket.io Client | 4.8.3 | WebSocket communication |
| **Storage** | AsyncStorage | 2.2.0 | Local data persistence |
| **Animations** | Reanimated | 4.2.1 | High-performance animations |
| **Gestures** | Gesture Handler | 2.30.0 | Touch handling |
| **Bottom Sheet** | @gorhom/bottom-sheet | 5.2.8 | Modal bottom sheets |
| **WebView** | react-native-webview | 13.16.0 | Embedded web content |
| **SVG** | react-native-svg | 15.15.1 | Vector graphics |
| **Icons** | Vector Icons | 10.3.0 | Icon library |
| **Gradients** | Linear Gradient | 2.8.3 | UI gradients |
| **Date Utils** | date-fns | 4.1.0 | Date manipulation |
| **Utilities** | lodash-es | 4.17.22 | Utility functions |
| **Clipboard** | @react-native-clipboard | 1.16.3 | Copy/paste functionality |
| **Device Info** | react-native-device-info | 15.0.1 | Device metadata |
| **Network Info** | @react-native-community/netinfo | 11.4.1 | Network status |
| **Notifications** | react-native-notifications | 5.2.2 | Push notifications |
| **Splash Screen** | react-native-splash-screen | 3.3.0 | Launch screen |

### Backend API (Node.js)

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Runtime** | Node.js | 20+ | JavaScript runtime |
| **Framework** | Express.js | 5.2.1 | Web application framework |
| **Language** | TypeScript | 5.9.3 | Type-safe JavaScript |
| **Database** | PostgreSQL | 16 | Relational database |
| **Query Builder** | Knex.js | 3.1.0 | SQL query builder & migrations |
| **Cache** | Redis | 7 | In-memory data store |
| **Redis Client** | ioredis | 5.9.0 | Redis connection |
| **Real-time** | Socket.io | 4.8.3 | WebSocket server |
| **Authentication** | JWT | 9.0.3 | Token-based auth |
| **Password Hashing** | Argon2 | 0.44.0 | Secure password hashing |
| **Validation** | Zod | 4.3.5 | Request validation |
| **Security** | Helmet | 8.1.0 | HTTP security headers |
| **Rate Limiting** | express-rate-limit | 8.2.1 | API rate limiting |
| **Rate Limit Store** | rate-limit-redis | 4.3.1 | Redis-backed rate limiting |
| **CORS** | cors | 2.8.5 | Cross-origin requests |
| **Logging** | Morgan | 1.10.1 | HTTP request logging |
| **Logging** | Winston | 3.19.0 | Application logging |
| **Date Utils** | Day.js | 1.11.19 | Date manipulation |
| **Unique IDs** | UUID | 13.0.0 | Unique identifiers |
| **Short IDs** | nanoid | 5.1.6 | Short unique IDs |
| **Env Config** | dotenv | 17.2.3 | Environment variables |

### Database Schema (PostgreSQL + Knex.js)

**7 Migration Files | 25+ Tables**

```
USERS & AUTH
├── users                 # User accounts
├── refresh_tokens        # JWT refresh tokens
├── otp_codes            # SMS verification
└── user_settings        # Preferences

WALLET & PAYMENTS
├── wallets              # User balances
└── transactions         # Payment history

SPORTS & BETTING
├── sports               # Sport types
├── regions              # Geographic regions
├── competitions         # Leagues/tournaments
├── games                # Matches/events
├── markets              # Betting markets
├── events               # Odds/selections
├── bets                 # Placed bets
├── bet_selections       # Bet legs
└── favorites            # User favorites

CASINO
├── casino_providers     # Game providers
├── casino_categories    # Game types
└── casino_games         # Casino games

BONUSES
├── bonuses              # Promotions
├── user_bonuses         # Claimed bonuses
└── free_bets            # Free bet credits

CONTENT
├── banners              # Marketing banners
├── news                 # News articles
├── info_pages           # Static pages
├── jobs                 # Career listings
└── messages             # User notifications
```

### Redis Usage

| Use Case | Purpose | TTL |
|----------|---------|-----|
| **Rate Limiting** | API abuse prevention | Per window |
| **Session Cache** | Fast auth token lookup | 15 min |
| **Refresh Tokens** | Token storage & rotation | 7 days |
| **OTP Codes** | SMS verification codes | 5 min |
| **Booking Codes** | Temporary betslip storage | 72 hours |
| **Odds Cache** | Reduce database load | 30 sec |
| **WebSocket Pub/Sub** | Scale Socket.io servers | N/A |

---

## API Endpoints (51 Total)

### Authentication (8 endpoints)
```
POST   /api/v1/auth/register           # Create account
POST   /api/v1/auth/login              # Login (phone + password)
POST   /api/v1/auth/logout             # Invalidate tokens
POST   /api/v1/auth/refresh            # Refresh access token
POST   /api/v1/auth/send-otp           # Send SMS verification
POST   /api/v1/auth/verify-otp         # Verify OTP code
POST   /api/v1/auth/forgot-password    # Request password reset
POST   /api/v1/auth/reset-password     # Reset with OTP
```

### User Management (5 endpoints)
```
GET    /api/v1/users/me                # Get profile
PATCH  /api/v1/users/me                # Update profile
PATCH  /api/v1/users/me/password       # Change password
GET    /api/v1/users/me/settings       # Get settings
PATCH  /api/v1/users/me/settings       # Update settings
```

### Wallet & Payments (6 endpoints)
```
GET    /api/v1/wallet                  # Get balance
GET    /api/v1/wallet/transactions     # Transaction history
GET    /api/v1/wallet/balance-history  # Balance over time
POST   /api/v1/wallet/deposit          # Initiate deposit
POST   /api/v1/wallet/withdraw         # Request withdrawal
POST   /api/v1/wallet/webhook          # Payment callback
```

### Sports & Games (8 endpoints)
```
GET    /api/v1/sports                  # List all sports
GET    /api/v1/sports/:id/regions      # Regions for sport
GET    /api/v1/regions/:id/competitions # Competitions
GET    /api/v1/competitions/:id/games  # Games in competition
GET    /api/v1/games                   # Games list (filterable)
GET    /api/v1/games/:id               # Game with markets
GET    /api/v1/games/live              # Live games
GET    /api/v1/games/search            # Search by team
```

### Betting (7 endpoints)
```
POST   /api/v1/bets                    # Place bet
GET    /api/v1/bets                    # Bet history
GET    /api/v1/bets/:id                # Bet details
POST   /api/v1/bets/:id/cashout        # Cashout bet
GET    /api/v1/bets/booking/:code      # Get by booking code
POST   /api/v1/bets/booking            # Create booking
GET    /api/v1/bets/booking/temp/:code # Temp booking
```

### Casino (5 endpoints)
```
GET    /api/v1/casino/games            # List games
GET    /api/v1/casino/games/:id        # Game details
GET    /api/v1/casino/categories       # Categories
GET    /api/v1/casino/providers        # Providers
POST   /api/v1/casino/games/:id/launch # Launch game
```

### Bonuses (6 endpoints)
```
GET    /api/v1/bonuses                 # Available bonuses
GET    /api/v1/bonuses/user/active     # Active bonuses
GET    /api/v1/bonuses/user/history    # Bonus history
GET    /api/v1/bonuses/user/free-bets  # Free bets
POST   /api/v1/bonuses/:id/claim       # Claim bonus
POST   /api/v1/bonuses/:id/withdraw    # Withdraw bonus
```

### Content (6 endpoints)
```
GET    /api/v1/banners                 # Banners by position
GET    /api/v1/news                    # News list
GET    /api/v1/news/:id                # News article
GET    /api/v1/info/:slug              # Info pages
GET    /api/v1/jobs                    # Job listings
POST   /api/v1/jobs/:id/apply          # Apply for job
```

---

## WebSocket Events

### Client to Server
```typescript
subscribe       { room: 'sport' | 'game' | 'live' | 'user', id: string }
unsubscribe     { room: string, id: string }
```

### Server to Client
```typescript
odds:update        { eventId, price, previousPrice, direction }
odds:update:batch  { updates: OddsUpdate[] }
game:status        { gameId, isLive, info: { score, time, period } }
game:start         { gameId }
game:end           { gameId, result }
market:suspend     { marketId, isSuspended }
bet:placed         { betId, status, bookingCode }
bet:settled        { betId, status, payout }
cashout:update     { betId, currentValue }
cashout:result     { betId, amount, success }
balance:update     { balance, bonusBalance }
```

---

## Features

### Core Betting
- **Live Betting** - Real-time odds via WebSocket
- **Pre-match Betting** - Sports > Regions > Competitions > Games
- **Quick Bet** - One-tap with preset stakes
- **Bet Types** - Single, Multiple/Parlay, System, Chain
- **6 Odds Formats** - Decimal, Fractional, American, Hong Kong, Malay, Indonesian

### Cashout System
- Full cashout at current value
- Partial cashout with slider
- Auto-cashout triggers

### Wallet & Payments
- Mobile Money (MTN, Vodafone, AirtelTigo)
- Real-time balance updates
- Transaction history

### Casino
- Slot games with categories
- Roulette (WebView)
- Virtual Sports
- Demo mode

### Security
- **Argon2id** password hashing (NOT bcrypt/MD5)
- **JWT** with refresh token rotation
- **Redis-backed** rate limiting
- **Helmet** security headers
- **Zod** request validation

---

## Project Structure

```
betting-app/
├── src/                         # React Native App
│   ├── app/                     # App entry & providers
│   ├── features/                # Feature modules
│   │   ├── auth/               # Authentication
│   │   ├── betting/            # Live & pre-match
│   │   ├── betslip/            # Bet management
│   │   ├── wallet/             # Payments
│   │   ├── casino/             # Games
│   │   ├── bonuses/            # Promotions
│   │   ├── history/            # Bet history
│   │   └── profile/            # User settings
│   ├── shared/
│   │   ├── api/                # API & WebSocket clients
│   │   ├── components/ui/      # Reusable components
│   │   ├── hooks/              # Custom hooks
│   │   ├── utils/              # Utilities
│   │   └── constants/          # Theme & config
│   ├── navigation/             # Navigators
│   └── store/                  # Redux store
│
├── sports-api/                  # Node.js Backend
│   ├── src/
│   │   ├── config/             # Database, Redis, env
│   │   ├── modules/            # Feature modules
│   │   │   ├── auth/          # Authentication
│   │   │   ├── user/          # Profile
│   │   │   ├── wallet/        # Payments
│   │   │   ├── sports/        # Sports data
│   │   │   ├── bets/          # Betting
│   │   │   ├── casino/        # Casino
│   │   │   ├── bonus/         # Bonuses
│   │   │   └── content/       # CMS
│   │   ├── shared/
│   │   │   ├── middleware/    # Auth, rate limit, validation
│   │   │   ├── utils/         # JWT, password, SMS
│   │   │   └── errors/        # Error classes
│   │   ├── websocket/         # Socket.io server
│   │   └── database/
│   │       └── migrations/    # Knex migrations (7 files)
│   └── package.json
│
├── android/                    # Android native
├── ios/                        # iOS native
└── package.json
```

---

## Getting Started

### Quick Start with Docker

The fastest way to get the backend running:

```bash
# Start PostgreSQL, Redis, and API with one command
docker-compose up -d

# Run database migrations
docker-compose exec api npm run db:migrate

# API is now running at http://localhost:3000
```

**Services:**
| Service | Port | Description |
|---------|------|-------------|
| API | 3000 | Backend REST + WebSocket |
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Cache & Rate Limiting |

### Manual Setup

#### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- React Native CLI
- Xcode (iOS) / Android Studio (Android)

#### Backend Setup

```bash
cd sports-api

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database/redis credentials

# Run migrations
npm run db:migrate

# Start development server
npm run dev
```

### Mobile App Setup

```bash
# Install dependencies
npm install

# iOS only
cd ios && pod install && cd ..

# Start Metro bundler
npm start

# Run on device
npm run android  # or npm run ios
```

### Environment Variables

```bash
# Backend (.env)
DATABASE_URL=postgresql://user:pass@localhost:5432/sportsbook
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-32-char-secret-key
JWT_REFRESH_SECRET=your-32-char-refresh-secret
CORS_ORIGIN=http://localhost:3000
```

---

## Performance

| Metric | Value |
|--------|-------|
| API Response Time | < 100ms (cached) |
| WebSocket Latency | < 50ms |
| Database Queries | Optimized with indexes |
| Rate Limiting | 100 req/15min (API), 30 req/min (betting) |

---

## Security Features

| Feature | Implementation |
|---------|----------------|
| Password Hashing | Argon2id (memory: 64MB, iterations: 3) |
| Authentication | JWT + Refresh Token Rotation |
| Rate Limiting | Redis-backed, per-endpoint limits |
| Input Validation | Zod schemas on all endpoints |
| SQL Injection | Parameterized queries (Knex.js) |
| XSS Prevention | Helmet security headers |
| CORS | Configurable origin whitelist |

---

## Contributing

This is a community-driven project! If there's interest and active contributors, we'll continue building features from the [ROADMAP.md](ROADMAP.md).

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

### What's Next?

Check out [ROADMAP.md](ROADMAP.md) for planned features including:
- Push notifications (Firebase/APNs)
- reCAPTCHA bot protection
- Multiview for live games
- Live match tracker
- And more...

**Community interest will drive development priorities!**

---

## Support

If you find this project useful:

**SOL:** `3R6DJ8BcUxMErn3d3Bqp7RV74r4uaFUV3zoQY1H6rChd`

---

## Author

**[@devbyteai](https://github.com/devbyteai)**

---

## License

MIT License - see [LICENSE](LICENSE) for details.
