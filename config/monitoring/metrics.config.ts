import client from 'prom-client';

// Initialize the metrics registry
const register = new client.Registry();

// Add default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// Game-specific metrics
const gameMetrics = {
  activeGames: new client.Gauge({
    name: 'shithead_active_games',
    help: 'Number of currently active games',
    registers: [register],
  }),

  playerCount: new client.Gauge({
    name: 'shithead_player_count',
    help: 'Number of connected players',
    registers: [register],
  }),

  gameActionDuration: new client.Histogram({
    name: 'shithead_game_action_duration',
    help: 'Duration of game actions',
    labelNames: ['action_type'],
    buckets: [0.1, 0.5, 1, 2, 5],
    registers: [register],
  }),

  cardPlays: new client.Counter({
    name: 'shithead_card_plays_total',
    help: 'Total number of cards played',
    labelNames: ['card_type'],
    registers: [register],
  }),

  specialCardUsage: new client.Counter({
    name: 'shithead_special_card_usage_total',
    help: 'Usage of special cards',
    labelNames: ['card_type'],
    registers: [register],
  }),

  gameCompletionTime: new client.Histogram({
    name: 'shithead_game_completion_time',
    help: 'Time taken to complete games',
    buckets: [60, 180, 300, 600, 1200],
    registers: [register],
  }),
};

// Metrics collection functions
export const metrics = {
  register,
  
  recordGameStart: () => {
    gameMetrics.activeGames.inc();
  },
  
  recordGameEnd: (durationSeconds: number) => {
    gameMetrics.activeGames.dec();
    gameMetrics.gameCompletionTime.observe(durationSeconds);
  },
  
  recordPlayerJoin: () => {
    gameMetrics.playerCount.inc();
  },
  
  recordPlayerLeave: () => {
    gameMetrics.playerCount.dec();
  },
  
  recordCardPlay: (cardType: string, duration: number) => {
    gameMetrics.cardPlays.inc({ card_type: cardType });
    gameMetrics.gameActionDuration.observe({ action_type: 'card_play' }, duration);
  },
  
  recordSpecialCardUse: (cardType: string) => {
    gameMetrics.specialCardUsage.inc({ card_type: cardType });
  },

  // Get metrics for export
  getMetrics: async () => {
    return await register.metrics();
  },
};