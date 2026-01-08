# Roadmap

This document outlines the current status and future development plans for the Sports Betting App.

## Current Status: MVP Ready

The core betting functionality is complete and production-ready.

---

## Completed Features

### Authentication
- [x] Phone + Password login
- [x] Multi-step registration with OTP
- [x] Password reset via SMS
- [x] JWT token refresh
- [x] Session persistence

### Betting
- [x] Live betting with real-time odds
- [x] Pre-match betting
- [x] Single bets
- [x] Multiple/Parlay bets
- [x] System bets
- [x] Chain bets
- [x] Quick bet dialog
- [x] Booking codes (save & share betslip)
- [x] Odds change indicators
- [x] 6 odds formats (Decimal, Fractional, American, Hong Kong, Malay, Indonesian)

### Cashout
- [x] Full cashout
- [x] Partial cashout
- [x] Auto-cashout settings
- [x] Cashout dialog

### Wallet
- [x] Balance display (main + bonus)
- [x] Deposit (MTN, Vodafone, AirtelTigo)
- [x] Withdrawal
- [x] Transaction history

### Casino
- [x] Slot games with categories/providers
- [x] Game search
- [x] Play for Real / Demo mode
- [x] Roulette (WebView)
- [x] Virtual Sports (WebView)

### User Features
- [x] Profile management
- [x] Settings (odds format, notifications, sound, animations)
- [x] Favorites (games & competitions)
- [x] Bet history with filters
- [x] Recently viewed games

### Content
- [x] Home banners
- [x] Featured games
- [x] News section
- [x] Help/FAQ
- [x] Jobs portal
- [x] Franchise inquiry

### Real-Time (WebSocket)
- [x] Live scores
- [x] Odds updates
- [x] Market suspension
- [x] Balance updates
- [x] Bet notifications

---

## Future Roadmap

### Phase 1: Production Hardening

**Priority: High | Complexity: Medium**

| Feature | Description | Status |
|---------|-------------|--------|
| reCAPTCHA v3 | Bot protection on registration | Planned |
| Push Notifications | Firebase Cloud Messaging (Android) + APNs (iOS) | Planned |
| Toast Notifications | User feedback system (success/error messages) | Planned |
| Error Boundaries | Graceful error handling in UI | Planned |
| Sentry Integration | Error tracking and monitoring | Planned |

### Phase 2: Enhanced UX

**Priority: Medium | Complexity: Low-Medium**

| Feature | Description | Status |
|---------|-------------|--------|
| BetSlip Expiry | Auto-clear saved betslips after 72 hours | Planned |
| Accumulator Bonus Display | Show bonus % based on selection count | Planned |
| Competition Multi-Select | Floating action button for selecting multiple leagues | Planned |
| Pull-to-Refresh | Add pull-to-refresh on all list screens | Planned |
| Haptic Feedback | Vibration on bet placement, wins | Planned |

### Phase 3: Advanced Features

**Priority: Medium | Complexity: High**

| Feature | Description | Status |
|---------|-------------|--------|
| Multiview | View multiple live games simultaneously | Planned |
| Live Match Tracker | Visual representation of match events | Planned |
| Bet Builder | Create custom bets within a single game | Planned |
| Cash Out History | View all cashout transactions | Planned |
| Refer a Friend | Referral system with rewards | Planned |

### Phase 4: Platform Expansion

**Priority: Low | Complexity: High**

| Feature | Description | Status |
|---------|-------------|--------|
| Deep Linking | Open specific screens from notifications/URLs | Planned |
| App Clips (iOS) | Instant app experience without full install | Planned |
| Widgets | Home screen widgets for live scores | Planned |
| Apple Watch App | View bets and scores on watch | Planned |
| Tablet Layout | Optimized UI for tablets | Planned |

### Phase 5: Analytics & Insights

**Priority: Low | Complexity: Medium**

| Feature | Description | Status |
|---------|-------------|--------|
| Firebase Analytics | User behavior tracking | Planned |
| Betting Statistics | Personal win/loss stats, favorite sports | Planned |
| Responsible Gaming | Self-exclusion, deposit limits, time limits | Planned |
| A/B Testing | Feature flag system for experiments | Planned |

---

## Assets Needed

The following assets need to be created or sourced:

### Images
| Asset | Quantity | Notes |
|-------|----------|-------|
| App Icon | 14 sizes | iOS + Android |
| Splash Screen | 1 | Launch screen |
| Payment Logos | 4 | MTN, Vodafone, AirtelTigo, Mobile Money |
| Sport Icons | 20+ | Icons for each sport type |
| Event Icons | 15+ | Goal, card, corner, etc. |
| Empty States | 5+ | No bets, no results, etc. |

### Audio
| Asset | Notes |
|-------|-------|
| bet_placed.mp3 | Short confirmation sound |
| win.mp3 | Celebration sound |
| notification.mp3 | Alert chime |

### Alternative: Use Libraries
- Country Flags: `react-native-country-flag`
- Icons: Ionicons, MaterialCommunityIcons (already installed)

---

## Configuration Required

Before deploying to production:

```bash
# Environment Variables
API_BASE_URL=https://your-api-domain.com/api/v1
WS_URL=wss://your-api-domain.com

# Firebase (for push notifications)
# Add google-services.json to android/app/
# Add GoogleService-Info.plist to ios/

# App Signing
# Configure release keystore for Android
# Configure signing certificate for iOS
```

---

## Contributing

We welcome contributions! Here's how to get started:

1. **Pick an item** from the roadmap above
2. **Open an issue** to discuss your approach
3. **Fork the repo** and create a feature branch
4. **Submit a PR** with your changes

### Good First Issues

These are great for first-time contributors:

- [ ] Add pull-to-refresh to LiveScreen
- [ ] Add haptic feedback on bet placement
- [ ] Create empty state illustrations
- [ ] Add loading skeletons to more screens
- [ ] Improve error messages

### Help Wanted

These need experienced contributors:

- [ ] Implement push notifications
- [ ] Add reCAPTCHA to registration
- [ ] Build multiview feature
- [ ] Create tablet-optimized layouts

---

## Tech Stack

- **Frontend:** React Native 0.83, TypeScript, Redux Toolkit, RTK Query
- **Backend:** Node.js, Express, PostgreSQL, Redis, Socket.io
- **Styling:** NativeWind (Tailwind CSS)
- **Navigation:** React Navigation 7

---

## License

[Add your license here]

---

*Last updated: January 2026*
