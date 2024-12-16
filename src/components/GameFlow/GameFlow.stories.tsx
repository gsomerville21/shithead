import type { Meta, StoryObj } from '@storybook/react';
import GameFlow from './GameFlow';
import { GamePhase } from '../../types/game';
import { Card, Suit, Rank, CardLocation } from '../../types/card-types';

const meta: Meta<typeof GameFlow> = {
  title: 'Components/GameFlow',
  component: GameFlow,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GameFlow>;

const mockCard: Card = {
  id: '1',
  suit: Suit.SPADES,
  rank: Rank.ACE,
  location: CardLocation.HAND,
  faceUp: true,
  position: 0
};

const createMockGameState = (overrides = {}) => ({
  id: 'test-game',
  phase: GamePhase.PLAY,
  players: new Map([
    ['player1', {
      id: 'player1',
      hand: [mockCard],
      faceUpCards: [],
      faceDownCards: [],
      connected: true,
      ready: true,
      timeoutWarnings: 0
    }],
    ['player2', {
      id: 'player2',
      hand: [],
      faceUpCards: [mockCard],
      faceDownCards: [],
      connected: true,
      ready: true,
      timeoutWarnings: 0
    }]
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
  moveHistory: [],
  ...overrides
});

export const YourTurn: Story = {
  args: {
    gameState: createMockGameState(),
    currentPlayerId: 'player1',
    selectedCards: [],
    onPlay: () => console.log('Play cards'),
    onPickup: () => console.log('Pickup pile'),
    onConfirmReady: () => console.log('Confirm ready')
  }
};

export const OpponentTurn: Story = {
  args: {
    gameState: createMockGameState({ currentPlayer: 'player2' }),
    currentPlayerId: 'player1',
    selectedCards: [],
    onPlay: () => console.log('Play cards'),
    onPickup: () => console.log('Pickup pile'),
    onConfirmReady: () => console.log('Confirm ready')
  }
};

export const SwapPhase: Story = {
  args: {
    gameState: createMockGameState({ phase: GamePhase.SWAP }),
    currentPlayerId: 'player1',
    selectedCards: [],
    onPlay: () => console.log('Play cards'),
    onPickup: () => console.log('Pickup pile'),
    onConfirmReady: () => console.log('Confirm ready')
  }
};

export const WithSelectedCards: Story = {
  args: {
    gameState: createMockGameState(),
    currentPlayerId: 'player1',
    selectedCards: [mockCard],
    onPlay: () => console.log('Play cards'),
    onPickup: () => console.log('Pickup pile'),
    onConfirmReady: () => console.log('Confirm ready')
  }
};

export const WithSpecialEffects: Story = {
  args: {
    gameState: createMockGameState({
      specialEffects: [
        { type: 'BURN', timestamp: Date.now() }
      ]
    }),
    currentPlayerId: 'player1',
    selectedCards: [],
    onPlay: () => console.log('Play cards'),
    onPickup: () => console.log('Pickup pile'),
    onConfirmReady: () => console.log('Confirm ready')
  }
};

export const LowTimeWarning: Story = {
  args: {
    gameState: createMockGameState({
      config: {
        ...createMockGameState().config,
        timeouts: { turn: 8000, swap: 60000, reconnect: 120000 }
      }
    }),
    currentPlayerId: 'player1',
    selectedCards: [],
    onPlay: () => console.log('Play cards'),
    onPickup: () => console.log('Pickup pile'),
    onConfirmReady: () => console.log('Confirm ready')
  }
};