import React, { Suspense } from 'react';

// Lazy load main game components
export const GameBoard = React.lazy(() => import('../components/GameBoard'));
export const GameFlow = React.lazy(() => import('../components/GameFlow'));
export const AnimatedCardPile = React.lazy(() => import('../components/Card/AnimatedCardPile'));

// Loading fallback component
export const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center w-full h-full min-h-[200px]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// HOC for lazy loaded components
export function withSuspense<T extends object>(
  Component: React.ComponentType<T>,
  Fallback: React.ComponentType = LoadingFallback
) {
  return function WithSuspense(props: T) {
    return (
      <Suspense fallback={<Fallback />}>
        <Component {...props} />
      </Suspense>
    );
  };
}