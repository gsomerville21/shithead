import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export const initSentry = () => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.VITE_SENTRY_DSN,
      integrations: [new BrowserTracing()],
      tracesSampleRate: 1.0,
      environment: process.env.NODE_ENV,
      beforeSend(event) {
        // Sanitize error data before sending
        if (event.user) {
          delete event.user.ip_address;
          delete event.user.email;
        }
        return event;
      },
      // Game-specific configuration
      tags: {
        app: 'shithead-card-game'
      }
    });
  }
};

export const captureGameError = (error: Error, context?: Record<string, any>) => {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setExtras(context);
    }
    Sentry.captureException(error);
  });
};