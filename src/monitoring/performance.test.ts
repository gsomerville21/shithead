import { describe, it, expect, beforeEach, vi } from 'vitest';
import { performance_monitor, usePerformanceMonitoring } from './performance';
import { renderHook, act } from '@testing-library/react';

describe('Performance Monitoring', () => {
  beforeEach(() => {
    performance_monitor.clearMetrics();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('measures operation duration correctly', () => {
    const { result } = renderHook(() => usePerformanceMonitoring());
    
    act(() => {
      result.current.startMeasure('test-operation');
      vi.advanceTimersByTime(100);
      result.current.endMeasure('test-operation');
    });

    const metrics = result.current.getMetrics('test-operation');
    expect(metrics.length).toBe(1);
    expect(metrics[0].duration).toBeGreaterThan(0);
  });

  it('calculates average metrics correctly', () => {
    const { result } = renderHook(() => usePerformanceMonitoring());
    
    act(() => {
      // First operation: 100ms
      result.current.startMeasure('test-operation');
      vi.advanceTimersByTime(100);
      result.current.endMeasure('test-operation');

      // Second operation: 200ms
      result.current.startMeasure('test-operation');
      vi.advanceTimersByTime(200);
      result.current.endMeasure('test-operation');
    });

    const average = result.current.getAverageMetric('test-operation');
    expect(average).toBeCloseTo(150);
  });

  it('handles metadata correctly', () => {
    const { result } = renderHook(() => usePerformanceMonitoring());
    const metadata = { userId: '123', action: 'test' };
    
    act(() => {
      result.current.startMeasure('test-operation', metadata);
      vi.advanceTimersByTime(100);
      result.current.endMeasure('test-operation');
    });

    const metrics = result.current.getMetrics('test-operation');
    expect(metrics[0].metadata).toEqual(metadata);
  });

  it('limits stored metrics to 1000 entries', () => {
    const { result } = renderHook(() => usePerformanceMonitoring());
    
    act(() => {
      for (let i = 0; i < 1100; i++) {
        result.current.startMeasure(`operation-${i}`);
        vi.advanceTimersByTime(1);
        result.current.endMeasure(`operation-${i}`);
      }
    });

    const allMetrics = result.current.getMetrics();
    expect(allMetrics.length).toBeLessThanOrEqual(1000);
  });

  it('clears metrics correctly', () => {
    const { result } = renderHook(() => usePerformanceMonitoring());
    
    act(() => {
      result.current.startMeasure('test-operation');
      vi.advanceTimersByTime(100);
      result.current.endMeasure('test-operation');
    });

    expect(result.current.getMetrics().length).toBe(1);
    
    act(() => {
      performance_monitor.clearMetrics();
    });

    expect(result.current.getMetrics().length).toBe(0);
  });
});