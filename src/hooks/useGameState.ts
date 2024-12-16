import { useState, useEffect, useCallback } from 'react';
import { GameState, Card, PlayerState } from '../types/game';
import { GameService } from '../services/gameService';

/**
 * Configuration options for the useGameState hook
 * @interface
 */
interface GameStateConfig {
  /** Unique identifier for the game */
  gameId: string;
  /** Number of players in the game */
  numPlayers: number;
  /** ID of the current player */
  playerId: string;
}

/**
 * Custom hook for managing game state and actions
 * 
 * @param {GameStateConfig} config - Configuration for the game state
 * @returns {Object} Game state and methods for updating it
 * 
 * @example
 * ```tsx
 * const { 
 *   gameState,
 *   selectedCards,
 *   playCards,
 *   selectCard,
 *   isValidPlay
 * } = useGameState({
 *   gameId: 'game-123',
 *   numPlayers: 2,
 *   playerId: 'player-1'
 * });
 * ```
 */
export const useGameState = (config: GameStateConfig) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [gameService] = useState(() => new GameService(config.gameId, config.numPlayers));

  /**
   * Initializes the game state
   */
  useEffect(() => {
    const initialState = gameService.initializeGame();
    setGameState(initialState);
  }, [gameService]);

  /**
   * Checks if it's the current player's turn
   * @returns {boolean} Whether it's the current player's turn
   */
  const isPlayerTurn = useCallback((): boolean => {
    if (!gameState) return false;
    return gameState.currentTurnPlayerId === config.playerId;
  }, [gameState, config.playerId]);

  /**
   * Gets the current player's state
   * @returns {PlayerState | undefined} Current player's state
   */
  const getCurrentPlayer = useCallback((): PlayerState | undefined => {
    if (!gameState) return undefined;
    return gameState.players.find(p => p.id === config.playerId);
  }, [gameState, config.playerId]);

  /**
   * Toggles card selection
   * @param {Card} card - Card to toggle selection
   */
  const selectCard = useCallback((card: Card) => {
    setSelectedCards(prev => {
      const isSelected = prev.some(c => c.id === card.id);
      if (isSelected) {
        return prev.filter(c => c.id !== card.id);
      } else {
        if (prev.length > 0 && prev[0].rank !== card.rank) {
          return [card];
        }
        return [...prev, card];
      }
    });
  }, []);

  /**
   * Attempts to play the selected cards
   * @returns {boolean} Whether the play was successful
   */
  const playCards = useCallback((): boolean => {
    if (!gameState || !isPlayerTurn() || selectedCards.length === 0) {
      return false;
    }

    const topCard = gameState.discardPile[gameState.discardPile.length - 1] || null;
    if (!gameService.isValidPlay(selectedCards, topCard)) {
      return false;
    }

    // Update game state with the played cards
    setGameState(prevState => {
      if (!prevState) return null;
      
      const currentPlayer = getCurrentPlayer();
      if (!currentPlayer) return prevState;

      // Remove played cards from player's hand
      const updatedPlayer = {
        ...currentPlayer,
        hand: currentPlayer.hand.filter(
          card => !selectedCards.some(selected => selected.id === card.id)
        )
      };

      return {
        ...prevState,
        discardPile: [...prevState.discardPile, ...selectedCards],
        players: prevState.players.map(p => 
          p.id === config.playerId ? updatedPlayer : p
        )
      };
    });

    // Clear selected cards
    setSelectedCards([]);
    return true;
  }, [gameState, selectedCards, isPlayerTurn, gameService, config.playerId, getCurrentPlayer]);

  /**
   * Checks if currently selected cards can be played
   * @returns {boolean} Whether the selected cards can be played
   */
  const isValidPlay = useCallback((): boolean => {
    if (!gameState || !isPlayerTurn() || selectedCards.length === 0) {
      return false;
    }

    const topCard = gameState.discardPile[gameState.discardPile.length - 1] || null;
    return gameService.isValidPlay(selectedCards, topCard);
  }, [gameState, selectedCards, isPlayerTurn, gameService]);

  return {
    gameState,
    selectedCards,
    playCards,
    selectCard,
    isValidPlay,
    isPlayerTurn,
    getCurrentPlayer
  };
};

export default useGameState;