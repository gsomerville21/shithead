import { Card } from './card-types';

export enum GamePhase {
  SETUP = 'SETUP',
  SWAP = 'SWAP',
  PLAY = 'PLAY',
  ROUND_END = 'ROUND_END',
  GAME_END = 'GAME_END',
}

export enum ActionType {
  PLAY_CARDS = 'PLAY_CARDS',
  PICKUP_PILE = 'PICKUP_PILE',
  SWAP_CARDS = 'SWAP_CARDS',
  CONFIRM_READY = 'CONFIRM_READY',
}

export enum SpecialEffectType {
  BURN = 'BURN',
  SKIP = 'SKIP',
  RESET = 'RESET',
  TRANSPARENT = 'TRANSPARENT',
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

export interface SpecialEffect {
  type: SpecialEffectType;
  timestamp: number;
}

export interface GameAction {
  type: ActionType;
  playerId: string;
  cards?: Card[];
  timestamp: number;
  target?: string;
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

export interface MoveHistoryEntry {
  action: GameAction;
  previousState: GameState;
  timestamp: number;
}
