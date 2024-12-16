export { initSentry } from './sentry.config';
export { GamePerformanceMonitor } from './performance.config';
export { logger, gameLogger } from './logging.config';
export { metrics } from './metrics.config';

// Initialize all monitoring systems
export const initMonitoring = () => {
  // Initialize Sentry
  initSentry();
  
  // Initialize Performance Monitoring
  GamePerformanceMonitor.getInstance();
  
  // Add shutdown hooks
  process.on('SIGTERM', async () => {
    // Flush logs
    await new Promise((resolve) => {
      logger.on('finish', resolve);
      logger.end();
    });
    
    // Export final metrics
    await metrics.getMetrics();
  });
};