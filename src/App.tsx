import * as React from 'react';
import GameBoard from './components/GameBoard/GameBoard';
import GameFlow from './components/GameFlow/GameFlow';
import { GameState, GamePhase, GameConfig, ActionType } from './types/game';
import { Card, CardLocation } from './types/card-types';
import { GameService } from './services/gameService';

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
    minNextCard: 0,
  },
  hostId: 'player1',
};

const App: React.FC = () => {
  const [gameState, setGameState] = React.useState<GameState | null>(null);
  const [selectedCards, setSelectedCards] = React.useState<Card[]>([]);
  const [currentPlayerId] = React.useState('player1'); // In multiplayer this would come from auth
  const gameService = React.useRef(new GameService('game1', 2));

  // Initialize game state
  React.useEffect(() => {
    const initialState = gameService.current.initializeGame(1); // Initialize with 1 bot
    setGameState(initialState);
  }, []);

  // Process bot turns
  React.useEffect(() => {
    if (!gameState) return;

    // If current player is a bot and game is in PLAY phase
    if (gameState.phase === GamePhase.PLAY) {
      const currentPlayer = gameState.players.get(gameState.currentPlayer);
      if (currentPlayer?.isBot) {
        // Add a small delay to make bot moves visible
        const timeoutId = setTimeout(() => {
          // Use the bot service through the game service
          const botMove = gameService.current.getBotMove(gameState, currentPlayer.id);
          if (botMove.length > 0) {
            handlePlayCards(botMove);
          } else {
            handlePickupPile();
          }
        }, 1000);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [gameState]);

  const handleCardClick = (card: Card) => {
    if (!gameState) return;

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
      // In play phase, handle card selection
      const player = gameState.players.get(currentPlayerId)!;

      // Determine which set of cards the player should be using
      let validCards = player.hand;
      if (player.hand.length === 0) {
        validCards = player.faceUpCards;
      }
      if (player.hand.length === 0 && player.faceUpCards.length === 0) {
        validCards = player.faceDownCards;
      }

      // Check if the clicked card is in the valid set
      const isValidCard = validCards.some((c) => c.id === card.id);
      if (!isValidCard) return;

      setSelectedCards((prev) => {
        // If card is already selected, remove it
        if (prev.some((c) => c.id === card.id)) {
          return prev.filter((c) => c.id !== card.id);
        }

        // For face-down cards, only allow one at a time
        if (validCards === player.faceDownCards) {
          return [card];
        }

        // For first play or empty pile, allow any card selection
        if (gameState.pile.length === 0) {
          // If no cards selected yet, start new selection
          if (prev.length === 0) return [card];
          // If cards already selected, only allow same rank
          return prev[0].rank === card.rank ? [...prev, card] : prev;
        }

        // Only allow selecting cards of the same rank for subsequent plays
        if (prev.length > 0 && prev[0].rank !== card.rank) {
          return prev;
        }

        return [...prev, card];
      });
    }
  };

  const handlePlayCards = (cardsToPlay?: Card[]) => {
    if (!gameState) return;

    const cards = Array.isArray(cardsToPlay) ? cardsToPlay : selectedCards;
    if (cards.length === 0) return;

    try {
      // Ensure selected cards are face up when played
      const playCards = cards.map((card) => ({
        ...card,
        faceUp: true,
        location: CardLocation.PILE,
      }));

      const action = {
        type: ActionType.PLAY_CARDS,
        playerId: gameState.currentPlayer,
        cards: playCards,
        timestamp: Date.now(),
      };

      const newState = gameService.current.processAction(gameState, action);
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
        playerId: gameState.currentPlayer,
        timestamp: Date.now(),
      };

      const newState = gameService.current.processAction(gameState, action);
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

      const newState = gameService.current.processAction(gameState, action);
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

      const newState = gameService.current.processAction(gameState, action);
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
        onPlay={() => handlePlayCards()}
        onPickup={handlePickupPile}
        onSwapConfirm={handleSwapConfirm}
        onReadyConfirm={handleReadyConfirm}
      />
      <GameBoard
        gameState={gameState}
        onCardClick={handleCardClick}
        currentPlayerId={currentPlayerId}
        onPlayCards={() => handlePlayCards()}
        onPickupPile={handlePickupPile}
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
        <div>Bot Turn: {gameState.players.get(gameState.currentPlayer)?.isBot ? 'Yes' : 'No'}</div>
      </div>
    </div>
  );
};

export default App;
