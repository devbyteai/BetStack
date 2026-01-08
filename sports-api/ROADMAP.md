# Backend Roadmap

This document outlines the current status and future development plans for the Sports Betting API.

## Current Status: MVP Ready

The core API is complete with 51 endpoints across 8 modules.

---

## Completed Features

### Authentication Module
- [x] User registration with phone verification
- [x] Login with JWT tokens
- [x] Token refresh mechanism
- [x] Password reset via OTP
- [x] Account lockout after failed attempts
- [x] Argon2id password hashing

### User Module
- [x] Profile management (CRUD)
- [x] User settings (odds format, notifications, sound)
- [x] Password change

### Wallet Module
- [x] Balance management (main + bonus)
- [x] Deposit (MTN, Vodafone, AirtelTigo stubs)
- [x] Withdrawal requests
- [x] Transaction history with filters
- [x] Balance history

### Sports Module
- [x] Sports hierarchy (Sports → Regions → Competitions → Games)
- [x] Live games endpoint
- [x] Upcoming games endpoint
- [x] Featured games endpoint
- [x] Game search by team name
- [x] Full game details with markets

### Bets Module
- [x] Place bet (single, multiple, system, chain)
- [x] Bet validation (odds, stakes, balance)
- [x] Bet history with filters
- [x] Booking codes (save betslip)
- [x] Full cashout
- [x] Partial cashout
- [x] Auto-cashout value storage
- [x] Accumulator bonus calculation

### Casino Module
- [x] Games list with filters
- [x] Categories and providers
- [x] Game launch URL generation
- [x] Demo mode support

### Bonus Module
- [x] Available bonuses
- [x] Claim bonus
- [x] Active bonuses tracking
- [x] Bonus history
- [x] Free bets
- [x] Wagering requirements

### Content Module
- [x] Banners by position
- [x] News with categories
- [x] Info pages (terms, FAQ)
- [x] Jobs portal
- [x] Franchise inquiries

### WebSocket
- [x] Room-based subscriptions
- [x] Odds updates (single + batch)
- [x] Game status updates
- [x] Market suspension
- [x] Bet notifications
- [x] Balance updates
- [x] Cashout updates

### Infrastructure
- [x] Redis rate limiting
- [x] Redis caching
- [x] Zod validation on all endpoints
- [x] Structured error handling
- [x] JWT authentication middleware
- [x] Database migrations (7 files)

---

## Future Roadmap

### Phase 1: Production Hardening

**Priority: Critical**

| Feature | Description | Status |
|---------|-------------|--------|
| SMS Provider Integration | Replace stub with real provider (Twilio, etc.) | Planned |
| Payment Webhooks | Signature verification for payment callbacks | Planned |
| Winston Logging | Structured logging with log levels | Planned |
| CORS Configuration | Lock down to specific frontend domains | Planned |
| Rate Limit Tuning | Adjust limits based on production load | Planned |

### Phase 2: Security Enhancements

**Priority: High**

| Feature | Description | Status |
|---------|-------------|--------|
| reCAPTCHA Verification | Verify registration tokens on backend | Planned |
| Wallet Row Locking | Add `forUpdate()` to prevent race conditions | Planned |
| IP-based Rate Limiting | Additional protection against abuse | Planned |
| Request Signing | Sign sensitive requests | Planned |
| Audit Logging | Log all sensitive operations | Planned |

### Phase 3: Performance Optimization

**Priority: Medium**

| Feature | Description | Status |
|---------|-------------|--------|
| Query Optimization | Add indexes, optimize N+1 queries | Planned |
| Redis Pub/Sub | Scale WebSocket across multiple servers | Planned |
| Connection Pooling | Optimize database connections | Planned |
| Response Compression | Gzip/Brotli compression | Planned |
| CDN Integration | Serve static assets via CDN | Planned |

### Phase 4: Advanced Features

**Priority: Medium**

| Feature | Description | Status |
|---------|-------------|--------|
| Bet Settlement Engine | Automated bet settlement on game completion | Planned |
| Odds Feed Integration | Connect to real odds provider | Planned |
| KYC Verification | Document upload and verification | Planned |
| Multi-Currency Support | Support multiple currencies | Planned |
| Referral System | User referral tracking and rewards | Planned |

### Phase 5: Analytics & Reporting

**Priority: Low**

| Feature | Description | Status |
|---------|-------------|--------|
| Admin Dashboard API | Endpoints for admin metrics | Planned |
| User Analytics | Betting patterns, preferences | Planned |
| Financial Reports | Revenue, payouts, margins | Planned |
| Responsible Gaming | Self-exclusion, limits enforcement | Planned |

---

## Known Issues to Fix

| Issue | Severity | Description |
|-------|----------|-------------|
| JWT Payload Mismatch | Critical | WebSocket decodes `userId` but JWT has `id` |
| Route Ordering | High | `/booking/temp/:code` unreachable due to route order |
| AsyncStorage Race | Medium | Tokens may not persist before navigation |

---

## Database Migrations Needed

| Migration | Purpose |
|-----------|---------|
| Add `animations_enabled` | User setting for animations |
| Add `theme` | User theme preference |
| Add `referral_code` | User referral tracking |
| Add `kyc_documents` | KYC document storage |
| Add `user_limits` | Responsible gaming limits |

---

## Configuration Required

```bash
# Required Environment Variables
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379
JWT_SECRET=your-32-char-secret
JWT_REFRESH_SECRET=your-32-char-secret

# Optional (for production)
CORS_ORIGIN=https://your-frontend-domain.com
SMS_PROVIDER_API_KEY=your-sms-api-key
PAYMENT_WEBHOOK_SECRET=your-webhook-secret
```

---

## API Documentation

API documentation is available at `/api/v1/docs` when running in development mode.

### Endpoint Summary

| Module | Endpoints |
|--------|-----------|
| Auth | 8 |
| User | 5 |
| Wallet | 6 |
| Sports | 8 |
| Bets | 7 |
| Casino | 5 |
| Bonus | 6 |
| Content | 6 |
| **Total** | **51** |

---

## Contributing

### Backend Setup

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your values

# Run migrations
npm run db:migrate

# Start development server
npm run dev
```

### Good First Issues

- [ ] Add request logging middleware
- [ ] Add health check endpoint
- [ ] Improve error messages
- [ ] Add input sanitization

### Help Wanted

- [ ] Integrate real SMS provider
- [ ] Implement payment webhooks
- [ ] Add WebSocket scaling with Redis pub/sub
- [ ] Build admin dashboard endpoints

---

## Tech Stack

- **Runtime:** Node.js 20+
- **Framework:** Express.js
- **Language:** TypeScript (strict mode)
- **Database:** PostgreSQL + Knex.js
- **Cache:** Redis (ioredis)
- **WebSocket:** Socket.io
- **Validation:** Zod
- **Auth:** JWT + Argon2

---

*Last updated: January 2026*
