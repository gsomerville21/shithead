import type { Meta, StoryObj } from '@storybook/react';
import GameBoard from './GameBoard';
import { GamePhase } from '../../types/game';
import { Suit, Rank, CardLocation } from '../../types/card-types';

const meta: Meta<typeof GameBoard> = {
  title: 'Components/GameBoard',
  component: GameBoard,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GameBoard>;

const mockCard = {
  id: '1',
  suit: Suit.SPADES,
  rank: Rank.ACE,
  location: CardLocation.HAND,
  faceUp: true,
  position: 0
};

const createMockGameState = (playerCount: number) => ({
  id: 'test-game',
  phase: GamePhase.PLAY,
  players: new Map(
    Array.from({ length: playerCount }, (_, i) => [
      `player${i + 1}`,
      {
        id: `player${i + 1}`,
        hand: [{ ...mockCard, id: `hand-${i}` }],
        faceUpCards: [{ ...mockCard, id: `faceup-${i}` }],
        faceDownCards: [{ ...mockCard, id: `facedown-${i}`, faceUp: false }],
        connected: true,
        ready: true,
        timeoutWarnings: 0
      }
    ])
  ),
  currentPlayer: 'player1',
  nextPlayer: 'player2',
  deck: Array.from({ length: 10 }, (_, i) => ({
    ...mockCard,
    id: `deck-${i}`,
    faceUp: false,
    location: CardLocation.DECK
  })),
  pile: Array.from({ length: 3 }, (_, i) => ({
    ...mockCard,
    id: `pile-${i}`,
    location: CardLocation.PILE
  })),
  lastAction: null,
  specialEffects: [],
  winner: null,
  config: {
    maxPlayers: 4,
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
});

export const TwoPlayers: Story = {
  args: {
    gameState: createMockGameState(2),
    currentPlayerId: 'player1',
    onCardClick: (card) => console.log('Card clicked:', card)
  }
};

export const ThreePlayers: Story = {
  args: {
    gameState: createMockGameState(3),
    currentPlayerId: 'player1',
    onCardClick: (card) => console.log('Card clicked:', card)
  }
};

export const FourPlayers: Story = {
  args: {
    gameState: createMockGameState(4),
    currentPlayerId: 'player1',
    onCardClick: (card) => console.log('Card clicked:', card)
  }
};

export const DisconnectedPlayer: Story = {
  args: {
    gameState: {
      ...createMockGameState(2),
      players: new Map([
        ['player1', {
          id: 'player1',
          hand: [mockCard],
          faceUpCards: [],
          faceDownCards: [],
          connected: false,
          ready: true,
          timeoutWarnings: 0
        }],
        ['player2', {
          id: 'player2',
          hand: [mockCard],
          faceUpCards: [],
          faceDownCards: [],
          connected: true,
          ready: true,
          timeoutWarnings: 0
        }]
      ])
    },
    currentPlayerId: 'player1',
    onCardClick: (card) => console.log('Card clicked:', card)
  }
};

export const EmptyPile: Story = {
  args: {
    gameState: {
      ...createMockGameState(2),
      pile: []
    },
    currentPlayerId: 'player1',
    onCardClick: (card) => console.log('Card clicked:', card)
  }
};

export const EmptyDeck: Story = {
  args: {
    gameState: {
      ...createMockGameState(2),
      deck: []
    },
    currentPlayerId: 'player1',
    onCardClick: (card) => console.log('Card clicked:', card)
  }
};