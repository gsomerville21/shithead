# Shithead Card Game - Monitoring System Documentation

## Overview

The monitoring system provides comprehensive tracking, logging, and performance monitoring for the Shithead card game. It consists of four main components:

1. Error Tracking (Sentry)
2. Performance Monitoring
3. Logging Infrastructure
4. Metrics Collection

## Setup

### Prerequisites

Ensure you have the following dependencies installed:

```bash
npm install @sentry/node @sentry/profiling-node @sentry/react winston prom-client
```

### Environment Variables

Configure the following environment variables:

```env
SENTRY_DSN=your_sentry_dsn
NODE_ENV=development|staging|production
LOG_LEVEL=debug|info|warn|error
```

### Initialization

```typescript
import { initMonitoring } from './config/monitoring';

// Initialize all monitoring systems
initMonitoring();
```

## Components

### 1. Error Tracking (Sentry)

Sentry provides real-time error tracking and monitoring.

#### Usage

```typescript
import { captureException, captureMessage } from '@sentry/react';

try {
  // Game logic
} catch (error) {
  captureException(error, {
    extra: {
      gameId: currentGame.id,
      playerCount: currentGame.players.length
    }
  });
}
```

#### Key Features

- Automatic error grouping for game actions
- Sanitization of sensitive game data
- Performance profiling
- Environment-aware configuration

### 2. Performance Monitoring

Track and analyze game performance metrics.

#### Usage

```typescript
import { GamePerformanceMonitor } from './config/monitoring';

const monitor = GamePerformanceMonitor.getInstance();

// Measure a game action
monitor.measureGameAction('playCard', () => {
  // Card playing logic
});

// Track specific operation
monitor.trackCardOperation('shuffle', 150); // 150ms

// Get performance report
const metrics = monitor.getMetrics();
```

#### Key Metrics

- Action duration
- Operation timings
- Statistical analysis
- Performance trends

### 3. Logging Infrastructure

Structured logging system for game events and errors.

#### Usage

```typescript
import { gameLogger } from './config/monitoring';

// Log game action
gameLogger.logGameAction('game123', 'cardPlayed', {
  playerId: 'player1',
  card: 'ace_of_spades'
});

// Log error
gameLogger.logGameError('game123', new Error('Invalid move'), {
  player: 'player1',
  attemptedMove: 'playCard'
});

// Log metric
gameLogger.logGameMetric('game123', 'roundDuration', 45);
```

#### Log Levels

- ERROR: Game-breaking issues
- WARN: Potential problems
- INFO: Game actions and events
- DEBUG: Detailed debugging information

### 4. Metrics Collection

Prometheus-compatible metrics collection system.

#### Usage

```typescript
import { metrics } from './config/monitoring';

// Record game events
metrics.recordGameStart();
metrics.recordPlayerJoin();
metrics.recordCardPlay('ace', 100);
metrics.recordSpecialCardUse('joker');

// Get metrics for export
const prometheusMetrics = await metrics.getMetrics();
```

#### Available Metrics

- Active Games
- Player Count
- Game Action Duration
- Card Play Frequency
- Special Card Usage
- Game Completion Time

## Best Practices

1. **Error Handling**
   - Always include relevant game context in error reports
   - Use appropriate error levels
   - Handle async errors properly

2. **Performance Monitoring**
   - Monitor critical game operations
   - Track long-running operations
   - Set up alerting for performance degradation

3. **Logging**
   - Use structured logging
   - Include relevant context
   - Don't log sensitive information

4. **Metrics**
   - Monitor business-critical metrics
   - Set up appropriate alerting thresholds
   - Regular metric analysis

## Troubleshooting

### Common Issues

1. **Sentry Not Reporting**
   - Check SENTRY_DSN environment variable
   - Verify initialization
   - Check network connectivity

2. **Missing Logs**
   - Check LOG_LEVEL setting
   - Verify log file permissions
   - Check disk space

3. **Performance Issues**
   - Review performance metrics
   - Check resource utilization
   - Analyze slow operations

## Maintenance

### Regular Tasks

1. **Log Rotation**
   - Logs are automatically rotated at 5MB
   - Keep last 5 log files
   - Archive old logs if needed

2. **Metric Cleanup**
   - Clear stale metrics
   - Archive historical data
   - Review metric retention policy

3. **Error Analysis**
   - Review error trends
   - Update error grouping
   - Adjust sampling rates

## Security Considerations

1. **Data Privacy**
   - Sensitive data is automatically sanitized
   - PII is never logged
   - Metrics are anonymized

2. **Access Control**
   - Restricted access to logs
   - Secure metric endpoints
   - Monitor access patterns