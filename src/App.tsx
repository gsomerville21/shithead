import * as React from 'react';
import GameBoard from './components/GameBoard/GameBoard';
import GameFlow from './components/GameFlow/GameFlow';
import { GameState, GamePhase, GameConfig, ActionType } from './types/game';
import { Card } from './types/card-types';
import { createGameState, processGameAction } from './core/game-state';

const defaultConfig: GameConfig = {
  maxPlayers: 2,
  startingCards: { hand: 3, faceUp: 3, faceDown: 3 },
  timeouts: { turn: 30000, swap: 60000, reconnect: 120000 },
  rules: {
    allowMultiples: true,
    burnOnFour: true,
    transparentEights: true,
    jackSkips: true,
    twoReset: true,
  },
  hostId: 'player1',
};

const App: React.FC = () => {
  const [gameState, setGameState] = React.useState<GameState | null>(null);
  const [selectedCards, setSelectedCards] = React.useState<Card[]>([]);
  const [currentPlayerId] = React.useState('player1'); // In multiplayer this would come from auth

  // Initialize game state
  React.useEffect(() => {
    const initialState = createGameState(['player1', 'player2'], defaultConfig);
    // Set initial phase to SWAP
    initialState.phase = GamePhase.SWAP;
    setGameState(initialState);
  }, []);

  const handleCardClick = (card: Card) => {
    if (!gameState) return;
    console.log('Card clicked:', card); // Add debugging

    // Handle card selection based on game phase
    if (gameState.phase === GamePhase.SWAP) {
      // In swap phase, only allow selecting one card from hand and one from face-up
      const player = gameState.players.get(currentPlayerId)!;
      const isHandCard = player.hand.some((c) => c.id === card.id);
      const isFaceUpCard = player.faceUpCards.some((c) => c.id === card.id);

      if (!isHandCard && !isFaceUpCard) return; // Only allow selecting hand or face-up cards

      setSelectedCards((prev) => {
        // If card is already selected, remove it
        if (prev.some((c) => c.id === card.id)) {
          return prev.filter((c) => c.id !== card.id);
        }

        // If selecting a hand card
        if (isHandCard) {
          const existingHandCard = prev.find((c) => player.hand.some((h) => h.id === c.id));
          if (existingHandCard) {
            return [...prev.filter((c) => c.id !== existingHandCard.id), card];
          }
          return [...prev, card].slice(0, 2); // Limit to 2 cards
        }

        // If selecting a face-up card
        if (isFaceUpCard) {
          const existingFaceUpCard = prev.find((c) =>
            player.faceUpCards.some((f) => f.id === c.id)
          );
          if (existingFaceUpCard) {
            return [...prev.filter((c) => c.id !== existingFaceUpCard.id), card];
          }
          return [...prev, card].slice(0, 2); // Limit to 2 cards
        }

        return prev;
      });
    } else if (gameState.phase === GamePhase.PLAY && gameState.currentPlayer === currentPlayerId) {
      // In play phase, allow selecting multiple cards of the same rank
      const player = gameState.players.get(currentPlayerId)!;
      
      // Validate card can be selected based on hand/face-up/face-down rules
      const canSelectCard = (
        (player.hand.length > 0 && player.hand.some(c => c.id === card.id)) ||
        (player.hand.length === 0 && player.faceUpCards.length > 0 && player.faceUpCards.some(c => c.id === card.id)) ||
        (player.hand.length === 0 && player.faceUpCards.length === 0 && player.faceDownCards.some(c => c.id === card.id))
      );

      if (!canSelectCard) return;

      setSelectedCards((prev) => {
        // If card is already selected, remove it
        if (prev.some((c) => c.id === card.id)) {
          return prev.filter((c) => c.id !== card.id);
        }

        // For face-down cards, only allow one at a time
        if (player.hand.length === 0 && player.faceUpCards.length === 0) {
          return [card];
        }

        // Only allow selecting cards of the same rank
        if (prev.length > 0 && prev[0].rank !== card.rank) {
          return prev;
        }

        return [...prev, card];
      });
    }
  };

  const handlePlayCards = () => {
    if (!gameState || selectedCards.length === 0) return;

    try {
      const action = {
        type: ActionType.PLAY_CARDS,
        playerId: currentPlayerId,
        cards: selectedCards,
        timestamp: Date.now(),
      };

      const newState = processGameAction(gameState, action);
      setGameState(newState);
      setSelectedCards([]);
    } catch (error) {
      console.error('Failed to play cards:', error);
      // TODO: Add error toast notification here
    }
  };

  const handlePickupPile = () => {
    if (!gameState) return;

    try {
      const action = {
        type: ActionType.PICKUP_PILE,
        playerId: currentPlayerId,
        timestamp: Date.now(),
      };

      const newState = processGameAction(gameState, action);
      setGameState(newState);
      setSelectedCards([]);
    } catch (error) {
      console.error('Failed to pickup pile:', error);
      // TODO: Add error toast notification here
    }
  };

  const handleSwapConfirm = () => {
    if (!gameState || selectedCards.length !== 2) return;

    try {
      const action = {
        type: ActionType.SWAP_CARDS,
        playerId: currentPlayerId,
        cards: selectedCards,
        timestamp: Date.now(),
      };

      const newState = processGameAction(gameState, action);
      setGameState(newState);
      setSelectedCards([]);
    } catch (error) {
      console.error('Failed to swap cards:', error);
      // TODO: Add error toast notification here
    }
  };

  const handleReadyConfirm = () => {
    if (!gameState) return;

    try {
      const action = {
        type: ActionType.CONFIRM_READY,
        playerId: currentPlayerId,
        timestamp: Date.now(),
      };

      const newState = processGameAction(gameState, action);
      setGameState(newState);
      setSelectedCards([]);
    } catch (error) {
      console.error('Failed to confirm ready:', error);
      // TODO: Add error toast notification here
    }
  };

  if (!gameState) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-green-900">
        <div className="text-white text-xl font-medium">Loading game...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-green-900 overflow-hidden">
      <GameFlow
        gameState={gameState}
        currentPlayerId={currentPlayerId}
        selectedCards={selectedCards}
        onPlay={handlePlayCards}
        onPickup={handlePickupPile}
        onSwapConfirm={handleSwapConfirm}
        onReadyConfirm={handleReadyConfirm}
        className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10"
      />
      <GameBoard
        gameState={gameState}
        onCardClick={handleCardClick}
        currentPlayerId={currentPlayerId}
        className="w-full h-full"
      />

      {/* Game status messages */}
      {gameState.winner && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/75 text-white p-8 rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold">Game Over!</h2>
          <p className="mt-2">Winner: {gameState.winner}</p>
        </div>
      )}

      {/* Debug info */}
      <div className="absolute bottom-4 right-4 bg-black/50 text-white p-4 rounded-lg text-sm">
        <div>Phase: {gameState.phase}</div>
        <div>Current Player: {gameState.currentPlayer}</div>
        <div>Selected Cards: {selectedCards.length}</div>
      </div>
    </div>
  );
};

export default App;