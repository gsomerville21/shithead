import { describe, it, expect } from 'vitest';
import {
  addMoveToHistory,
  rollbackToMove,
  validateRollbackRequest,
  getRelevantMovesForPlayer,
  MoveHistoryEntry
} from './move-history';
import { GameState, GameAction, ActionType, GamePhase } from './game-state';

describe('Move History Management', () => {
  // Helper function to create a mock game state
  const createMockGameState = (overrides = {}): GameState => ({
    id: 'test-game',
    phase: GamePhase.PLAY,
    players: new Map([
      ['player1', { id: 'player1', connected: true, ready: true }],
      ['player2', { id: 'player2', connected: true, ready: true }]
    ]),
    currentPlayer: 'player1',
    nextPlayer: 'player2',
    deck: [],
    pile: [],
    lastAction: null,
    specialEffects: [],
    winner: null,
    config: {
      maxPlayers: 2,
      startingCards: { hand: 3, faceUp: 3, faceDown: 3 },
      timeouts: { turn: 30000, swap: 60000, reconnect: 120000 },
      rules: {
        allowMultiples: true,
        burnOnFour: true,
        transparentEights: true,
        jackSkips: true,
        twoReset: true
      },
      hostId: 'player1'
    },
    timestamp: Date.now(),
    ...overrides
  });

  // Helper function to create a mock action
  const createMockAction = (overrides = {}): GameAction => ({
    type: ActionType.PLAY_CARDS,
    playerId: 'player1',
    cards: [],
    timestamp: Date.now(),
    ...overrides
  });

  describe('addMoveToHistory', () => {
    it('should add a move to empty history', () => {
      const history: MoveHistoryEntry[] = [];
      const state = createMockGameState();
      const action = createMockAction();

      const newHistory = addMoveToHistory(history, state, action);
      expect(newHistory).toHaveLength(1);
      expect(newHistory[0].action).toEqual(action);
      expect(newHistory[0].previousState).toEqual(state);
    });

    it('should maintain history size limit', () => {
      let history: MoveHistoryEntry[] = [];
      const state = createMockGameState();
      
      // Add more than MAX_HISTORY_LENGTH moves
      for (let i = 0; i < 55; i++) {
        const action = createMockAction({ timestamp: Date.now() + i });
        history = addMoveToHistory(history, state, action);
      }

      expect(history.length).toBeLessThanOrEqual(50);
    });
  });

  describe('rollbackToMove', () => {
    it('should successfully rollback to a specific move', () => {
      const targetState = createMockGameState();
      const targetAction = createMockAction({ timestamp: Date.now() - 1000 });
      const history: MoveHistoryEntry[] = [{
        action: targetAction,
        previousState: targetState,
        timestamp: targetAction.timestamp
      }];

      const result = rollbackToMove(history, targetAction.timestamp);
      expect(result.success).toBe(true);
      expect(result.state).toEqual(targetState);
    });

    it('should fail gracefully when target move not found', () => {
      const history: MoveHistoryEntry[] = [{
        action: createMockAction({ timestamp: Date.now() }),
        previousState: createMockGameState(),
        timestamp: Date.now()
      }];

      const result = rollbackToMove(history, Date.now() - 5000);
      expect(result.success).toBe(false);
      expect(result.message).toBeDefined();
    });
  });

  describe('validateRollbackRequest', () => {
    it('should allow rollback during swap phase', () => {
      const state = createMockGameState({ phase: GamePhase.SWAP });
      const isValid = validateRollbackRequest(state, Date.now(), 'player1');
      expect(isValid).toBe(true);
    });

    it('should allow rollback for disconnected player', () => {
      const state = createMockGameState();
      state.players.get('player1')!.connected = false;
      const isValid = validateRollbackRequest(state, Date.now(), 'player1');
      expect(isValid).toBe(true);
    });

    it('should allow rollback for game host', () => {
      const state = createMockGameState();
      const isValid = validateRollbackRequest(state, Date.now(), 'player1'); // player1 is host
      expect(isValid).toBe(true);
    });

    it('should deny rollback in normal play phase for non-host', () => {
      const state = createMockGameState();
      const isValid = validateRollbackRequest(state, Date.now(), 'player2');
      expect(isValid).toBe(false);
    });
  });

  describe('getRelevantMovesForPlayer', () => {
    it('should return moves relevant to specific player', () => {
      const history: MoveHistoryEntry[] = [
        {
          action: createMockAction({ playerId: 'player1', type: ActionType.PLAY_CARDS }),
          previousState: createMockGameState(),
          timestamp: Date.now() - 2000
        },
        {
          action: createMockAction({ playerId: 'player2', type: ActionType.SWAP_CARDS }),
          previousState: createMockGameState(),
          timestamp: Date.now() - 1000
        },
        {
          action: createMockAction({ playerId: 'player2', target: 'player1', type: ActionType.PLAY_CARDS }),
          previousState: createMockGameState(),
          timestamp: Date.now()
        }
      ];

      const relevantMoves = getRelevantMovesForPlayer(history, 'player1');
      expect(relevantMoves).toHaveLength(2); // Should include player1's move and the move targeting player1
    });

    it('should filter moves by start time', () => {
      const now = Date.now();
      const history: MoveHistoryEntry[] = [
        {
          action: createMockAction({ timestamp: now - 2000 }),
          previousState: createMockGameState(),
          timestamp: now - 2000
        },
        {
          action: createMockAction({ timestamp: now }),
          previousState: createMockGameState(),
          timestamp: now
        }
      ];

      const relevantMoves = getRelevantMovesForPlayer(history, 'player1', now - 1000);
      expect(relevantMoves).toHaveLength(1);
    });
  });
});
