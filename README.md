# Shithead - Online Multiplayer Card Game

[![CI Status](https://github.com/yourusername/shithead-game/workflows/CI/badge.svg)](https://github.com/yourusername/shithead-game/actions)
[![Documentation Status](https://github.com/yourusername/shithead-game/workflows/Documentation/badge.svg)](https://yourusername.github.io/shithead-game/)

An online multiplayer implementation of the classic card game Shithead, built with React, TypeScript, and WebSocket.

## Quick Start

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to start playing.

## Features

- Real-time multiplayer gameplay for 2-4 players
- Advanced bot AI with multiple difficulty levels
- Customizable game rules
- Seamless disconnection handling
- Cross-platform support

## Documentation

- [Game Rules](./docs/rules.md)
- [API Reference](./docs/api/README.md)
- [Development Guide](./docs/development.md)
- [Contributing Guidelines](./CONTRIBUTING.md)

## Technical Stack

- Frontend: React, TypeScript, Socket.IO-client
- Backend: Node.js, Express, Socket.IO
- State Management: Redux Toolkit
- Database: PostgreSQL, Redis
- Testing: Jest, React Testing Library

## Development

### Prerequisites

- Node.js >= 18
- npm >= 9
- Redis
- PostgreSQL

### Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure
4. Start development server: `npm run dev`

### Testing

```bash
npm run test        # Run unit tests
npm run test:e2e    # Run E2E tests
npm run test:cover  # Generate coverage report
```

### Building

```bash
npm run build
```

## Contributing

Please read our [Contributing Guidelines](./CONTRIBUTING.md) before submitting pull requests.

## License

MIT License - see [LICENSE](./LICENSE) for details