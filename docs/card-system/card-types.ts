/**
 * Card System Type Definitions for Shithead Card Game
 */

// Card Suits
export enum Suit {
  HEARTS = 'HEARTS',
  DIAMONDS = 'DIAMONDS',
  CLUBS = 'CLUBS',
  SPADES = 'SPADES'
}

// Card Ranks
export enum Rank {
  TWO = '2',
  THREE = '3',
  FOUR = '4',
  FIVE = '5',
  SIX = '6',
  SEVEN = '7',
  EIGHT = '8',
  NINE = '9',
  TEN = '10',
  JACK = 'J',
  QUEEN = 'Q',
  KING = 'K',
  ACE = 'A'
}

// Numeric values for comparing cards
export const RANK_VALUES: Record<Rank, number> = {
  [Rank.TWO]: 2,    // Special: Resets pile to 2
  [Rank.THREE]: 3,
  [Rank.FOUR]: 4,
  [Rank.FIVE]: 5,
  [Rank.SIX]: 6,
  [Rank.SEVEN]: 7,
  [Rank.EIGHT]: 8,  // Special: Transparent/Invisible
  [Rank.NINE]: 9,
  [Rank.TEN]: 10,
  [Rank.JACK]: 11,  // Special: Skip next player
  [Rank.QUEEN]: 12,
  [Rank.KING]: 13,
  [Rank.ACE]: 14
};

// Card location states
export enum CardLocation {
  DECK = 'DECK',
  HAND = 'HAND',
  FACE_UP = 'FACE_UP',
  FACE_DOWN = 'FACE_DOWN',
  PILE = 'PILE',
  BURNED = 'BURNED'
}

// Basic card interface
export interface Card {
  suit: Suit;
  rank: Rank;
  id: string;   // Unique identifier for each card
  location: CardLocation;
  ownerId?: string;  // ID of player who owns/sees this card
}

// Special card effects
export enum SpecialEffect {
  RESET = 'RESET',         // 2: Resets pile value
  TRANSPARENT = 'TRANSPARENT', // 8: Previous card's value remains active
  SKIP = 'SKIP',          // Jack: Skips next player
  BURN = 'BURN'           // Four of a kind: Burns the pile
}

// Card move validation interface
export interface CardMove {
  cards: Card[];          // Cards being played
  playerId: string;       // Player making the move
  targetLocation: CardLocation;
  timestamp: number;
}

// Card validation result
export interface ValidationResult {
  valid: boolean;
  reason?: string;
  specialEffect?: SpecialEffect;
}