import { describe, it, expect } from 'vitest';
import {
  createGameState,
  processGameAction,
  GameState,
  GameAction,
  ActionType,
  GamePhase
} from './game-state';
import { Card } from '../types/card-types';

describe('Game State Management', () => {
  const mockConfig = {
    maxPlayers: 2,
    startingCards: {
      hand: 3,
      faceUp: 3,
      faceDown: 3
    },
    timeouts: {
      turn: 30000,
      swap: 60000,
      reconnect: 120000
    },
    rules: {
      allowMultiples: true,
      burnOnFour: true,
      transparentEights: true,
      jackSkips: true,
      twoReset: true
    },
    hostId: 'player1'
  };

  describe('createGameState', () => {
    it('should create initial game state with empty move history', () => {
      const state = createGameState(['player1', 'player2'], mockConfig);
      expect(state.moveHistory).toEqual([]);
    });
  });

  describe('processGameAction', () => {
    it('should add moves to history', () => {
      const initialState = createGameState(['player1', 'player2'], mockConfig);
      const action: GameAction = {
        type: ActionType.CONFIRM_READY,
        playerId: 'player1',
        timestamp: Date.now()
      };

      const newState = processGameAction(initialState, action);
      expect(newState.moveHistory).toHaveLength(1);
      expect(newState.moveHistory[0].action).toEqual(action);
      expect(newState.moveHistory[0].previousState).toEqual(initialState);
    });

    it('should maintain move history through multiple actions', () => {
      let state = createGameState(['player1', 'player2'], mockConfig);
      
      const actions: GameAction[] = [
        {
          type: ActionType.CONFIRM_READY,
          playerId: 'player1',
          timestamp: Date.now()
        },
        {
          type: ActionType.CONFIRM_READY,
          playerId: 'player2',
          timestamp: Date.now() + 1000
        }
      ];

      actions.forEach(action => {
        state = processGameAction(state, action);
      });

      expect(state.moveHistory).toHaveLength(2);
      expect(state.moveHistory[0].action).toEqual(actions[0]);
      expect(state.moveHistory[1].action).toEqual(actions[1]);
    });
  });

  // ... (previous test cases remain unchanged)
});