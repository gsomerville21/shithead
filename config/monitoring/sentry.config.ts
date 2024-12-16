import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

export const initSentry = () => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    integrations: [
      new ProfilingIntegration(),
    ],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    
    // Custom configuration for card game
    beforeSend(event) {
      // Sanitize any sensitive game data
      if (event.extra?.gameState) {
        delete event.extra.gameState.playerCards;
      }
      return event;
    },
    
    // Group similar game-related errors
    beforeBreadcrumb(breadcrumb) {
      if (breadcrumb.category === 'game.action') {
        // Normalize game actions for better grouping
        breadcrumb.message = normalizeGameAction(breadcrumb.message);
      }
      return breadcrumb;
    }
  });
};

// Helper function to normalize game actions for consistent error grouping
const normalizeGameAction = (message: string): string => {
  // Add game-specific normalization logic here
  return message.replace(/player_\d+/g, 'player_n');
};