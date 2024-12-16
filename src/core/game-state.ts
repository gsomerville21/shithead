/**
 * Game State Management Implementation
 */

import { Card, CardLocation } from '../types/card-types';
import { createDeck, shuffleDeck, dealCards } from './card';
import { processSpecialEffects, getNextPlayer, validateSpecialPlay, SpecialEffect } from './special-cards';
import { MoveHistoryEntry, addMoveToHistory } from './move-history';

export enum GamePhase {
  SETUP = 'SETUP',
  SWAP = 'SWAP',
  PLAY = 'PLAY',
  ROUND_END = 'ROUND_END',
  GAME_END = 'GAME_END'
}

export interface GameState {
  id: string;
  phase: GamePhase;
  players: Map<string, PlayerState>;
  currentPlayer: string;
  nextPlayer: string;
  deck: Card[];
  pile: Card[];
  lastAction: GameAction | null;
  specialEffects: SpecialEffect[];
  winner: string | null;
  config: GameConfig;
  timestamp: number;
  moveHistory: MoveHistoryEntry[];
}

export interface PlayerState {
  id: string;
  hand: Card[];
  faceUpCards: Card[];
  faceDownCards: Card[];
  connected: boolean;
  ready: boolean;
  timeoutWarnings: number;
}

export interface GameConfig {
  maxPlayers: number;
  startingCards: {
    hand: number;
    faceUp: number;
    faceDown: number;
  };
  timeouts: {
    turn: number;
    swap: number;
    reconnect: number;
  };
  rules: GameRules;
  hostId: string;
}

export interface GameRules {
  allowMultiples: boolean;
  burnOnFour: boolean;
  transparentEights: boolean;
  jackSkips: boolean;
  twoReset: boolean;
}

export interface GameAction {
  type: ActionType;
  playerId: string;
  cards?: Card[];
  timestamp: number;
  target?: string;
}

export enum ActionType {
  PLAY_CARDS = 'PLAY_CARDS',
  PICKUP_PILE = 'PICKUP_PILE',
  SWAP_CARDS = 'SWAP_CARDS',
  CONFIRM_READY = 'CONFIRM_READY'
}

/**
 * Game state management functions
 */
export function createGameState(playerIds: string[], config: GameConfig): GameState {
  const deck = shuffleDeck(createDeck());
  const playerCards = dealCards(deck, playerIds.length, config.startingCards);
  
  const players = new Map<string, PlayerState>();
  playerIds.forEach(id => {
    const cards = playerCards.get(id)!;
    players.set(id, {
      id,
      hand: cards.hand,
      faceUpCards: cards.faceUp,
      faceDownCards: cards.faceDown,
      connected: true,
      ready: false,
      timeoutWarnings: 0
    });
  });

  return {
    id: generateGameId(),
    phase: GamePhase.SETUP,
    players,
    currentPlayer: playerIds[0],
    nextPlayer: playerIds[1],
    deck: deck.slice(playerIds.length * (config.startingCards.hand + config.startingCards.faceUp + config.startingCards.faceDown)),
    pile: [],
    lastAction: null,
    specialEffects: [],
    winner: null,
    config,
    timestamp: Date.now(),
    moveHistory: []
  };
}

export function processGameAction(state: GameState, action: GameAction): GameState {
  validateAction(state, action);
  
  // Store the current state in history before processing the action
  const newState = {
    ...state,
    moveHistory: addMoveToHistory(state.moveHistory, state, action)
  };
  
  switch (action.type) {
    case ActionType.PLAY_CARDS:
      return processPlayCards(newState, action);
    case ActionType.PICKUP_PILE:
      return processPickupPile(newState, action);
    case ActionType.SWAP_CARDS:
      return processSwapCards(newState, action);
    case ActionType.CONFIRM_READY:
      return processConfirmReady(newState, action);
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

function validateAction(state: GameState, action: GameAction): void {
  // Player must exist
  if (!state.players.has(action.playerId)) {
    throw new Error('Invalid player ID');
  }

  // Player must be connected
  const player = state.players.get(action.playerId)!;
  if (!player.connected) {
    throw new Error('Player is disconnected');
  }

  // Phase-specific validation
  switch (state.phase) {
    case GamePhase.SWAP:
      if (action.type !== ActionType.SWAP_CARDS && action.type !== ActionType.CONFIRM_READY) {
        throw new Error('Invalid action for swap phase');
      }
      break;
    case GamePhase.PLAY:
      if (action.playerId !== state.currentPlayer) {
        throw new Error('Not player\'s turn');
      }
      if (action.type !== ActionType.PLAY_CARDS && action.type !== ActionType.PICKUP_PILE) {
        throw new Error('Invalid action for play phase');
      }
      break;
  }
}

function processPlayCards(state: GameState, action: GameAction): GameState {
  const newState = { ...state };
  const player = newState.players.get(action.playerId)!;
  const cards = action.cards!;

  // Validate play
  if (!validateSpecialPlay(cards, { pile: state.pile, currentPlayer: state.currentPlayer, nextPlayer: state.nextPlayer, players: Array.from(state.players.keys()) })) {
    throw new Error('Invalid card play');
  }

  // Process special effects
  const effectResult = processSpecialEffects(cards, { 
    pile: state.pile,
    currentPlayer: state.currentPlayer,
    nextPlayer: state.nextPlayer,
    players: Array.from(state.players.keys())
  });

  // Update game state
  newState.pile = effectResult.burnPile ? [] : [...state.pile, ...cards];
  newState.specialEffects = effectResult.effects;
  newState.nextPlayer = getNextPlayer({
    currentPlayer: state.currentPlayer,
    nextPlayer: state.nextPlayer,
    players: Array.from(state.players.keys())
  }, effectResult.skipCount);

  // Remove cards from player's hand/face-up/face-down cards
  removeCardsFromPlayer(player, cards);

  // Check win condition
  if (checkWinCondition(player)) {
    newState.phase = GamePhase.ROUND_END;
    newState.winner = player.id;
  }

  newState.lastAction = action;
  newState.timestamp = Date.now();

  return newState;
}

function processPickupPile(state: GameState, action: GameAction): GameState {
  const newState = { ...state };
  const player = newState.players.get(action.playerId)!;

  // Add pile to player's hand
  player.hand = [...player.hand, ...state.pile];
  newState.pile = [];

  // Move to next player
  newState.currentPlayer = state.nextPlayer;
  newState.nextPlayer = getNextPlayer({
    currentPlayer: state.nextPlayer,
    nextPlayer: state.currentPlayer,
    players: Array.from(state.players.keys())
  }, 1);

  newState.lastAction = action;
  newState.timestamp = Date.now();

  return newState;
}

function processSwapCards(state: GameState, action: GameAction): GameState {
  const newState = { ...state };
  const player = newState.players.get(action.playerId)!;

  // Validate swap
  if (!validateSwap(player, action.cards!)) {
    throw new Error('Invalid card swap');
  }

  // Perform swap
  const [handCard, faceUpCard] = action.cards!;
  player.hand = player.hand.filter(c => c.id !== handCard.id).concat(faceUpCard);
  player.faceUpCards = player.faceUpCards.filter(c => c.id !== faceUpCard.id).concat(handCard);

  newState.lastAction = action;
  newState.timestamp = Date.now();

  return newState;
}

function processConfirmReady(state: GameState, action: GameAction): GameState {
  const newState = { ...state };
  const player = newState.players.get(action.playerId)!;

  player.ready = true;

  // Check if all players are ready
  if (Array.from(newState.players.values()).every(p => p.ready)) {
    newState.phase = GamePhase.PLAY;
  }

  newState.lastAction = action;
  newState.timestamp = Date.now();

  return newState;
}

/**
 * Helper functions
 */
function generateGameId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function removeCardsFromPlayer(player: PlayerState, cards: Card[]): void {
  const cardIds = new Set(cards.map(c => c.id));
  player.hand = player.hand.filter(c => !cardIds.has(c.id));
  player.faceUpCards = player.faceUpCards.filter(c => !cardIds.has(c.id));
  player.faceDownCards = player.faceDownCards.filter(c => !cardIds.has(c.id));
}

function validateSwap(player: PlayerState, cards: Card[]): boolean {
  const [handCard, faceUpCard] = cards;
  return (
    player.hand.some(c => c.id === handCard.id) &&
    player.faceUpCards.some(c => c.id === faceUpCard.id)
  );
}

function checkWinCondition(player: PlayerState): boolean {
  return (
    player.hand.length === 0 &&
    player.faceUpCards.length === 0 &&
    player.faceDownCards.length === 0
  );
}