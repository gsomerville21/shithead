import { PerformanceObserver, performance } from 'perf_hooks';

export class GamePerformanceMonitor {
  private static instance: GamePerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  private constructor() {
    // Initialize Performance Observer
    const obs = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        const existingMetrics = this.metrics.get(entry.name) || [];
        existingMetrics.push(entry.duration);
        this.metrics.set(entry.name, existingMetrics);
      });
    });

    obs.observe({ entryTypes: ['measure'] });
  }

  static getInstance(): GamePerformanceMonitor {
    if (!GamePerformanceMonitor.instance) {
      GamePerformanceMonitor.instance = new GamePerformanceMonitor();
    }
    return GamePerformanceMonitor.instance;
  }

  // Measure game-specific operations
  measureGameAction(actionName: string, action: () => any) {
    const start = `${actionName}-start`;
    const end = `${actionName}-end`;
    
    performance.mark(start);
    const result = action();
    performance.mark(end);
    performance.measure(actionName, start, end);
    
    return result;
  }

  // Track specific game metrics
  trackCardOperation(operation: string, duration: number) {
    const metrics = this.metrics.get(operation) || [];
    metrics.push(duration);
    this.metrics.set(operation, metrics);
  }

  // Get performance report
  getMetrics() {
    const report: Record<string, { avg: number; max: number; min: number }> = {};
    
    this.metrics.forEach((values, key) => {
      report[key] = {
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        max: Math.max(...values),
        min: Math.min(...values)
      };
    });
    
    return report;
  }
}