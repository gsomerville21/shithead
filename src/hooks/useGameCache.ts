import { useState, useCallback } from 'react';
import { GameState } from '../types/game';

const CACHE_VERSION = '1';
const CACHE_PREFIX = 'shithead_game_';

interface CacheEntry<T> {
  version: string;
  timestamp: number;
  data: T;
}

export function useGameCache() {
  const [cacheError, setCacheError] = useState<string | null>(null);

  const saveGameState = useCallback((gameId: string, state: GameState) => {
    try {
      const cacheEntry: CacheEntry<GameState> = {
        version: CACHE_VERSION,
        timestamp: Date.now(),
        data: state
      };
      localStorage.setItem(
        `${CACHE_PREFIX}${gameId}`, 
        JSON.stringify(cacheEntry)
      );
      return true;
    } catch (error) {
      setCacheError(error instanceof Error ? error.message : 'Cache write failed');
      return false;
    }
  }, []);

  const loadGameState = useCallback((gameId: string): GameState | null => {
    try {
      const cached = localStorage.getItem(`${CACHE_PREFIX}${gameId}`);
      if (!cached) return null;

      const entry: CacheEntry<GameState> = JSON.parse(cached);
      if (entry.version !== CACHE_VERSION) {
        localStorage.removeItem(`${CACHE_PREFIX}${gameId}`);
        return null;
      }

      // Convert stored Map back to Map instance
      entry.data.players = new Map(Object.entries(entry.data.players));
      return entry.data;
    } catch (error) {
      setCacheError(error instanceof Error ? error.message : 'Cache read failed');
      return null;
    }
  }, []);

  const clearGameCache = useCallback((gameId?: string) => {
    try {
      if (gameId) {
        localStorage.removeItem(`${CACHE_PREFIX}${gameId}`);
      } else {
        // Clear all game caches
        Object.keys(localStorage)
          .filter(key => key.startsWith(CACHE_PREFIX))
          .forEach(key => localStorage.removeItem(key));
      }
      return true;
    } catch (error) {
      setCacheError(error instanceof Error ? error.message : 'Cache clear failed');
      return false;
    }
  }, []);

  return {
    saveGameState,
    loadGameState,
    clearGameCache,
    cacheError
  };
}