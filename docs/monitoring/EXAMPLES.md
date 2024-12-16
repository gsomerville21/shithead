# Shithead Card Game - Monitoring Examples

## Basic Usage Examples

### Game Action Monitoring

```typescript
import { gameLogger, metrics, GamePerformanceMonitor } from './config/monitoring';

class GameController {
  private performanceMonitor = GamePerformanceMonitor.getInstance();

  async playCard(gameId: string, playerId: string, card: Card) {
    // Start performance measurement
    return this.performanceMonitor.measureGameAction('playCard', () => {
      try {
        // Game logic here
        const result = this.gameLogic.playCard(gameId, playerId, card);

        // Log successful action
        gameLogger.logGameAction(gameId, 'cardPlayed', {
          playerId,
          card: card.toString()
        });

        // Record metrics
        metrics.recordCardPlay(card.type, performance.now() - startTime);

        if (card.isSpecial()) {
          metrics.recordSpecialCardUse(card.type);
        }

        return result;
      } catch (error) {
        // Log error with context
        gameLogger.logGameError(gameId, error as Error, {
          action: 'playCard',
          playerId,
          card: card.toString()
        });

        throw error;
      }
    });
  }
}
```

### Game Session Monitoring

```typescript
class GameSession {
  private gameId: string;

  constructor(gameId: string) {
    this.gameId = gameId;
    metrics.recordGameStart();
    
    gameLogger.logGameAction(this.gameId, 'gameStarted', {
      timestamp: new Date().toISOString()
    });
  }

  addPlayer(playerId: string) {
    metrics.recordPlayerJoin();
    
    gameLogger.logGameAction(this.gameId, 'playerJoined', {
      playerId,
      timestamp: new Date().toISOString()
    });
  }

  endGame() {
    const duration = this.calculateGameDuration();
    metrics.recordGameEnd(duration);

    gameLogger.logGameAction(this.gameId, 'gameEnded', {
      duration,
      timestamp: new Date().toISOString()
    });
  }
}
```

## Advanced Usage Examples

### Custom Performance Measurements

```typescript
import { GamePerformanceMonitor } from './config/monitoring';

class AIDifficulty {
  private performanceMonitor = GamePerformanceMonitor.getInstance();

  async calculateNextMove(gameState: GameState) {
    return this.performanceMonitor.measureGameAction('aiCalculation', () => {
      const startTime = performance.now();
      
      // AI logic here
      const move = this.aiLogic.calculateMove(gameState);
      
      const duration = performance.now() - startTime;
      this.performanceMonitor.trackCardOperation('aiMove', duration);
      
      return move;
    });
  }
}
```

### Complex Error Handling

```typescript
import { captureException } from '@sentry/react';
import { gameLogger } from './config/monitoring';

class GameErrorHandler {
  handleError(error: Error, context: any) {
    // Determine error severity
    const severity = this.calculateSeverity(error);
    
    // Log error with appropriate level
    gameLogger.logGameError(context.gameId, error, {
      severity,
      context
    });

    // Report to Sentry with additional context
    captureException(error, {
      level: severity,
      tags: {
        gameId: context.gameId,
        errorType: error.name
      },
      extra: {
        ...context,
        gameState: this.sanitizeGameState(context.gameState)
      }
    });

    // Handle error based on severity
    if (severity === 'critical') {
      this.handleCriticalError(error, context);
    }
  }

  private sanitizeGameState(gameState: any) {
    // Remove sensitive data before sending to Sentry
    const sanitized = { ...gameState };
    delete sanitized.playerCards;
    delete sanitized.playerSecrets;
    return sanitized;
  }
}
```

### Metric Analysis

```typescript
import { metrics, GamePerformanceMonitor } from './config/monitoring';

class GameAnalytics {
  async generateReport(gameId: string) {
    const performanceMonitor = GamePerformanceMonitor.getInstance();
    const performanceMetrics = performanceMonitor.getMetrics();

    // Get Prometheus metrics
    const prometheusMetrics = await metrics.getMetrics();

    return {
      performance: {
        cardPlayDuration: performanceMetrics.cardPlay,
        aiResponseTime: performanceMetrics.aiCalculation
      },
      gameMetrics: {
        specialCardUsage: prometheusMetrics.specialCardUsage,
        averageGameDuration: prometheusMetrics.gameCompletionTime
      }
    };
  }
}
```

## Testing Examples

```typescript
import { gameLogger, metrics, GamePerformanceMonitor } from './config/monitoring';

describe('Game Monitoring', () => {
  let monitor: GamePerformanceMonitor;

  beforeEach(() => {
    monitor = GamePerformanceMonitor.getInstance();
    jest.spyOn(metrics, 'recordCardPlay');
    jest.spyOn(gameLogger, 'logGameAction');
  });

  it('should track card play performance', async () => {
    const result = await monitor.measureGameAction('testAction', () => {
      // Test action
      return 'success';
    });

    expect(result).toBe('success');
    const metrics = monitor.getMetrics();
    expect(metrics.testAction).toBeDefined();
  });

  it('should log game actions', () => {
    gameLogger.logGameAction('test123', 'testAction', {
      test: true
    });

    expect(gameLogger.logGameAction).toHaveBeenCalledWith(
      'test123',
      'testAction',
      expect.objectContaining({ test: true })
    );
  });
});
```