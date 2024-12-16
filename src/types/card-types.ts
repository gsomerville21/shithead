/**
 * Card System Type Definitions
 */

export enum Suit {
  HEARTS = 'H',
  DIAMONDS = 'D',
  CLUBS = 'C',
  SPADES = 'S'
}

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

export enum CardLocation {
  DECK = 'DECK',
  HAND = 'HAND',
  FACE_UP = 'FACE_UP',
  FACE_DOWN = 'FACE_DOWN',
  PILE = 'PILE',
  BURNED = 'BURNED'
}

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  location: CardLocation;
  faceUp: boolean;
  position: number;
  ownerId?: string;
}

export interface CardCollection {
  cards: Card[];
  maxSize?: number;
  location: CardLocation;
}