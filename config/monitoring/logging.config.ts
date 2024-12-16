import winston from 'winston';

// Custom format for game-specific logging
const gameFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  const gameState = metadata.gameState ? ` [Game ${metadata.gameState.id}]` : '';
  return `${timestamp} ${level}:${gameState} ${message} ${Object.keys(metadata).length ? JSON.stringify(metadata) : ''}`;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.metadata(),
    gameFormat
  ),
  transports: [
    // Console logging for development
    new winston.transports.Console({
      format: winston.format.colorize({ all: true }),
    }),
    // File logging for production
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/game.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Game-specific logging functions
export const gameLogger = {
  logGameAction: (gameId: string, action: string, playerData: any) => {
    logger.info(action, {
      gameState: { id: gameId },
      player: playerData,
      actionType: 'game_action'
    });
  },
  
  logGameError: (gameId: string, error: Error, context?: any) => {
    logger.error(error.message, {
      gameState: { id: gameId },
      errorStack: error.stack,
      context,
      errorType: 'game_error'
    });
  },
  
  logGameMetric: (gameId: string, metric: string, value: number) => {
    logger.info(`Metric: ${metric}`, {
      gameState: { id: gameId },
      metricName: metric,
      metricValue: value,
      metricType: 'game_metric'
    });
  }
};