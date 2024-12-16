import React, { useState } from 'react';
import GameBoard from './components/GameBoard';
import GameFlow from './components/GameFlow';
import { GameState, GamePhase } from './types/game';
import { Card, Suit, Rank, CardLocation } from './types/card-types';

// Create a mock game state for development
const createMockGameState = (): GameState => {
  const mockCard: Card = {
    id: '1',
    suit: Suit.HEARTS,
    rank: Rank.ACE,
    location: CardLocation.HAND,
    faceUp: true,
    position: 0
  };

  return {
    id: 'test-game',
    phase: GamePhase.PLAY,
    players: new Map([
      ['player1', {
        id: 'player1',
        hand: [
          { ...mockCard, id: '1', suit: Suit.HEARTS },
          { ...mockCard, id: '2', suit: Suit.DIAMONDS },
          { ...mockCard, id: '3', suit: Suit.SPADES }
        ],
        faceUpCards: [
          { ...mockCard, id: '4', suit: Suit.CLUBS, faceUp: true },
          { ...mockCard, id: '5', suit: Suit.HEARTS, faceUp: true }
        ],
        faceDownCards: [
          { ...mockCard, id: '6', faceUp: false },
          { ...mockCard, id: '7', faceUp: false }
        ],
        connected: true,
        ready: true,
        timeoutWarnings: 0
      }],
      ['player2', {
        id: 'player2',
        hand: [{ ...mockCard, id: '8' }],
        faceUpCards: [{ ...mockCard, id: '9', faceUp: true }],
        faceDownCards: [{ ...mockCard, id: '10', faceUp: false }],
        connected: true,
        ready: true,
        timeoutWarnings: 0
      }]
    ]),
    currentPlayer: 'player1',
    nextPlayer: 'player2',
    deck: [
      { ...mockCard, id: '11', faceUp: false },
      { ...mockCard, id: '12', faceUp: false }
    ],
    pile: [
      { ...mockCard, id: '13', location: CardLocation.PILE },
      { ...mockCard, id: '14', location: CardLocation.PILE }
    ],
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
    moveHistory: []
  };
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(createMockGameState());
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);

  const handleCardClick = (card: Card) => {
    setSelectedCards(prev => {
      const isSelected = prev.some(c => c.id === card.id);
      if (isSelected) {
        return prev.filter(c => c.id !== card.id);
      }
      return [...prev, card];
    });
  };

  const handlePlayCards = () => {
    console.log('Playing cards:', selectedCards);
    // Implement actual game logic here
  };

  const handlePickupPile = () => {
    console.log('Picking up pile');
    // Implement actual game logic here
  };

  return (
    <div className="w-full h-screen bg-green-900 overflow-hidden">
      <GameFlow
        gameState={gameState}
        currentPlayerId="player1"
        selectedCards={selectedCards}
        onPlay={handlePlayCards}
        onPickup={handlePickupPile}
        className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10"
      />
      <GameBoard
        gameState={gameState}
        onCardClick={handleCardClick}
        currentPlayerId="player1"
        className="w-full h-full"
      />
    </div>
  );
};

export default App;