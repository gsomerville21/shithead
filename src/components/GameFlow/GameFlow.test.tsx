import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import GameFlow from './GameFlow';
import { GameState, GamePhase } from '../../types/game';
import { Card, Suit, Rank, CardLocation } from '../../types/card-types';

describe('GameFlow Component', () => {
  const mockCard: Card = {
    id: '1',
    suit: Suit.SPADES,
    rank: Rank.ACE,
    location: CardLocation.HAND,
    faceUp: true,
    position: 0
  };

  const createMockGameState = (override = {}): GameState => ({
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
    ...override
  });

  const mockProps = {
    gameState: createMockGameState(),
    currentPlayerId: 'player1',
    selectedCards: [],
    onPlay: vi.fn(),
    onPickup: vi.fn(),
    onConfirmReady: vi.fn()
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders game phase', () => {
    render(<GameFlow {...mockProps} />);
    expect(screen.getByText('PLAY')).toBeInTheDocument();
  });

  it('shows turn indicator with correct player', () => {
    render(<GameFlow {...mockProps} />);
    expect(screen.getByText('Your Turn')).toBeInTheDocument();
  });

  it('updates timer correctly', () => {
    render(<GameFlow {...mockProps} />);
    expect(screen.getByText('30s')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('29s')).toBeInTheDocument();
  });

  it('shows action prompt with correct message', () => {
    render(<GameFlow {...mockProps} />);
    expect(screen.getByText('Select cards to play or pickup pile')).toBeInTheDocument();
  });

  it('enables play button when cards are selected and play is valid', () => {
    const props = {
      ...mockProps,
      selectedCards: [mockCard]
    };
    
    render(<GameFlow {...props} />);
    const playButton = screen.getByText('Play Cards (1)');
    expect(playButton).not.toBeDisabled();
    
    fireEvent.click(playButton);
    expect(props.onPlay).toHaveBeenCalled();
  });

  it('handles pickup action', () => {
    render(<GameFlow {...mockProps} />);
    const pickupButton = screen.getByText('Pickup Pile');
    
    fireEvent.click(pickupButton);
    expect(mockProps.onPickup).toHaveBeenCalled();
  });

  it('shows confirm ready button in swap phase', () => {
    const props = {
      ...mockProps,
      gameState: createMockGameState({ phase: GamePhase.SWAP })
    };
    
    render(<GameFlow {...props} />);
    const confirmButton = screen.getByText('Confirm Ready');
    
    fireEvent.click(confirmButton);
    expect(props.onConfirmReady).toHaveBeenCalled();
  });

  it('handles special effects display', () => {
    const props = {
      ...mockProps,
      gameState: createMockGameState({
        specialEffects: [{ type: 'BURN', timestamp: Date.now() }]
      })
    };
    
    render(<GameFlow {...props} />);
    expect(screen.getByText('BURN')).toBeInTheDocument();
  });
});