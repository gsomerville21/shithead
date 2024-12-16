import React, { lazy, Suspense } from 'react';
import { LoadingFallback } from '../routes/LazyComponents';
import { usePerformanceMonitoring } from '../monitoring/performance';
import { useGameCache } from '../hooks/useGameCache';

// Dynamic imports with webpack magic comments for better code splitting
const GameBoard = lazy(() => import(
  /* webpackChunkName: "game-board" */
  /* webpackPreload: true */
  './GameBoard'
));

const GameFlow = lazy(() => import(
  /* webpackChunkName: "game-flow" */
  /* webpackPrefetch: true */
  './GameFlow'
));

const App: React.FC = () => {
  const { startMeasure, endMeasure } = usePerformanceMonitoring();
  const { loadGameState, saveGameState } = useGameCache();

  React.useEffect(() => {
    // Preload other chunks when idle
    const idleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));
    
    idleCallback(() => {
      const chunks = [
        () => import(/* webpackChunkName: "card-components" */ './Card'),
        () => import(/* webpackChunkName: "animations" */ '../animations/cardAnimations')
      ];
      
      chunks.forEach(chunk => chunk());
    });
  }, []);

  return (
    <div className="w-full h-full min-h-screen bg-green-800">
      <Suspense fallback={<LoadingFallback />}>
        {/* Game components will be rendered here */}
      </Suspense>
    </div>
  );
};

export default App;