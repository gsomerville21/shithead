import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GameBoard from './GameBoard';
import { GameState, GamePhase } from '../../types/game';
import { Card, Suit, Rank, CardLocation } from '../../types/card-types';

describe('GameBoard Component', () => {
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
      }],
      ['player2', {
        id: 'player2',
        hand: [],
        faceUpCards: [{ ...mockCard, id: '2' }],
        faceDownCards: [],
        connected: true,
        ready: true,
        timeoutWarnings: 0
      }]
    ]),
    currentPlayer: 'player1',
    nextPlayer: 'player2',
    deck: [{ ...mockCard, id: '3', faceUp: false }],
    pile: [{ ...mockCard, id: '4' }],
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

  it('renders game board with correct layout', () => {
    const gameState = createMockGameState();
    render(
      <GameBoard
        gameState={gameState}
        currentPlayerId="player1"
        testId="game-board"
      />
    );

    // Check if player areas are rendered
    expect(screen.getByText('player1')).toBeInTheDocument();
    expect(screen.getByText('player2')).toBeInTheDocument();

    // Check if deck count is shown
    expect(screen.getByText('1 cards remaining')).toBeInTheDocument();

    // Check if game phase is shown
    expect(screen.getByText('PLAY')).toBeInTheDocument();
  });

  it('handles card clicks correctly', () => {
    const onCardClick = vi.fn();
    const gameState = createMockGameState();
    
    render(
      <GameBoard
        gameState={gameState}
        currentPlayerId="player1"
        onCardClick={onCardClick}
        testId="game-board"
      />
    );

    // Find and click a card
    const cards = screen.getAllByTestId(/card-/);
    fireEvent.click(cards[0]);
    
    expect(onCardClick).toHaveBeenCalledWith(mockCard);
  });

  it('shows disconnected state for players', () => {
    const gameState = createMockGameState({
      players: new Map([
        ['player1', {
          id: 'player1',
          hand: [],
          faceUpCards: [],
          faceDownCards: [],
          connected: false,
          ready: true,
          timeoutWarnings: 0
        }]
      ])
    });

    render(
      <GameBoard
        gameState={gameState}
        currentPlayerId="player1"
        testId="game-board"
      />
    );

    expect(screen.getByText('(Disconnected)')).toBeInTheDocument();
  });

  it('highlights active player', () => {
    const gameState = createMockGameState();
    render(
      <GameBoard
        gameState={gameState}
        currentPlayerId="player2"
        testId="game-board"
      />
    );

    const player1Area = screen.getByText('player1').parentElement?.parentElement;
    expect(player1Area).toHaveClass('ring-2', 'ring-yellow-400');
  });

  it('positions players correctly based on player count', () => {
    const twoPlayerState = createMockGameState();
    const { rerender } = render(
      <GameBoard
        gameState={twoPlayerState}
        currentPlayerId="player1"
        testId="game-board"
      />
    );

    // Check 2 player layout
    let players = screen.getAllByText(/player\d/);
    expect(players).toHaveLength(2);

    // Add a third player and check layout
    const threePlayerState = createMockGameState({
      players: new Map([
        ...twoPlayerState.players,
        ['player3', {
          id: 'player3',
          hand: [],
          faceUpCards: [],
          faceDownCards: [],
          connected: true,
          ready: true,
          timeoutWarnings: 0
        }]
      ])
    });

    rerender(
      <GameBoard
        gameState={threePlayerState}
        currentPlayerId="player1"
        testId="game-board"
      />
    );

    players = screen.getAllByText(/player\d/);
    expect(players).toHaveLength(3);
  });
});