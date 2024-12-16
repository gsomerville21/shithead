import { GameState, GameAction, ActionType } from './game-state';

export interface MoveHistoryEntry {
  action: GameAction;
  previousState: GameState;
  timestamp: number;
}

export interface RollbackResult {
  success: boolean;
  state: GameState;
  message?: string;
}

const MAX_HISTORY_LENGTH = 50; // Limit history to prevent memory issues

export function addMoveToHistory(history: MoveHistoryEntry[], currentState: GameState, action: GameAction): MoveHistoryEntry[] {
  const entry: MoveHistoryEntry = {
    action,
    previousState: JSON.parse(JSON.stringify(currentState)), // Deep clone the current state
    timestamp: Date.now()
  };

  // Add new entry and maintain history limit
  const newHistory = [...history, entry];
  return newHistory.slice(-MAX_HISTORY_LENGTH);
}

export function rollbackToMove(history: MoveHistoryEntry[], targetTimestamp: number): RollbackResult {
  const targetIndex = history.findIndex(entry => entry.timestamp === targetTimestamp);
  
  if (targetIndex === -1) {
    return {
      success: false,
      state: history[history.length - 1].previousState,
      message: 'Target move not found in history'
    };
  }

  return {
    success: true,
    state: history[targetIndex].previousState
  };
}

export function validateRollbackRequest(
  state: GameState,
  targetTimestamp: number,
  requestingPlayerId: string
): boolean {
  // Only allow rollbacks in specific situations:
  // 1. During the SWAP phase for the requesting player's own moves
  // 2. By disconnected player rejoining
  // 3. By admin/host for dispute resolution
  
  const isSwapPhase = state.phase === 'SWAP';
  const isPlayerDisconnected = !state.players.get(requestingPlayerId)?.connected;
  const isGameHost = requestingPlayerId === state.config.hostId;

  return isSwapPhase || isPlayerDisconnected || isGameHost;
}

export function getRelevantMovesForPlayer(
  history: MoveHistoryEntry[],
  playerId: string,
  startTime?: number
): MoveHistoryEntry[] {
  return history.filter(entry => {
    const isRelevantAction = 
      entry.action.playerId === playerId || // Player's own moves
      entry.action.target === playerId || // Moves targeting this player
      entry.action.type === ActionType.PLAY_CARDS || // Card plays (visible to all)
      entry.action.type === ActionType.PICKUP_PILE; // Pile pickups (visible to all)
    
    return isRelevantAction && (!startTime || entry.timestamp >= startTime);
  });
}
