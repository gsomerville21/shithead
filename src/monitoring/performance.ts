import { performance, PerformanceObserver } from 'perf_hooks';

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private observer: PerformanceObserver;
  
  private constructor() {
    // Set up performance observer
    this.observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        this.addMetric({
          name: entry.name,
          duration: entry.duration,
          timestamp: entry.startTime
        });
      });
    });

    this.observer.observe({ entryTypes: ['measure'] });
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMeasure(name: string, metadata?: Record<string, any>) {
    const markName = `${name}_start`;
    performance.mark(markName);
    if (metadata) {
      this.metrics.push({
        name,
        duration: 0,
        timestamp: performance.now(),
        metadata
      });
    }
  }

  endMeasure(name: string) {
    const markName = `${name}_start`;
    const measureName = `${name}_measure`;
    
    try {
      performance.measure(measureName, markName);
      performance.clearMarks(markName);
      performance.clearMeasures(measureName);
    } catch (error) {
      console.warn(`Failed to measure ${name}:`, error);
    }
  }

  private addMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    
    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Report to monitoring service if metric is significant
    if (metric.duration > 100) {
      this.reportSlowOperation(metric);
    }
  }

  private reportSlowOperation(metric: PerformanceMetric) {
    // Here you would send to your monitoring service
    console.warn('Slow operation detected:', metric);
  }

  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(m => m.name === name);
    }
    return this.metrics;
  }

  getAverageMetric(name: string): number {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, curr) => acc + curr.duration, 0);
    return sum / metrics.length;
  }

  clearMetrics() {
    this.metrics = [];
  }
}

// Create hooks for React components
export function usePerformanceMonitoring() {
  const monitor = PerformanceMonitor.getInstance();

  return {
    startMeasure: (name: string, metadata?: Record<string, any>) => 
      monitor.startMeasure(name, metadata),
    endMeasure: (name: string) => monitor.endMeasure(name),
    getMetrics: (name?: string) => monitor.getMetrics(name),
    getAverageMetric: (name: string) => monitor.getAverageMetric(name)
  };
}

export const performance_monitor = PerformanceMonitor.getInstance();