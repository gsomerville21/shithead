/**
 * Card Management Implementation
 */

import { Card, Suit, Rank, CardLocation } from '../types/card-types';

/**
 * Create a complete deck of cards
 */
export function createDeck(): Card[] {
  const deck: Card[] = [];
  let id = 1;

  Object.values(Suit).forEach((suit) => {
    Object.values(Rank).forEach((rank) => {
      deck.push({
        id: id.toString(),
        suit,
        rank,
        location: CardLocation.DECK,
        faceUp: false,
        position: id - 1,
      });
      id++;
    });
  });

  return deck;
}

/**
 * Shuffle an array of cards using Fisher-Yates algorithm
 */
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    // Update positions after swap
    shuffled[i].position = i;
    shuffled[j].position = j;
  }
  return shuffled;
}

interface PlayerCards {
  hand: Card[];
  faceUp: Card[];
  faceDown: Card[];
}

/**
 * Deal cards to players
 */
export function dealCards(
  deck: Card[],
  playerCount: number,
  config: { hand: number; faceUp: number; faceDown: number }
): Map<string, PlayerCards> {
  const playerCards = new Map<string, PlayerCards>();
  let currentIndex = 0;

  // Deal to each player
  for (let i = 0; i < playerCount; i++) {
    const playerId = `player${i + 1}`;
    const playerHand: PlayerCards = {
      hand: [],
      faceUp: [],
      faceDown: [],
    };

    // Deal face down cards
    for (let j = 0; j < config.faceDown; j++) {
      playerHand.faceDown.push({
        ...deck[currentIndex],
        location: CardLocation.FACE_DOWN,
        ownerId: playerId,
      });
      currentIndex++;
    }

    // Deal face up cards
    for (let j = 0; j < config.faceUp; j++) {
      playerHand.faceUp.push({
        ...deck[currentIndex],
        location: CardLocation.FACE_UP,
        faceUp: true,
        ownerId: playerId,
      });
      currentIndex++;
    }

    // Deal hand cards
    for (let j = 0; j < config.hand; j++) {
      playerHand.hand.push({
        ...deck[currentIndex],
        location: CardLocation.HAND,
        faceUp: true,
        ownerId: playerId,
      });
      currentIndex++;
    }

    playerCards.set(playerId, playerHand);
  }

  return playerCards;
}

/**
 * Compare two cards to determine which is higher
 * Returns:
 *  1 if card1 is higher
 *  -1 if card2 is higher
 *  0 if equal
 */
export function compareCards(card1: Card, card2: Card): number {
  const rankValues: Record<Rank, number> = {
    [Rank.TWO]: 2,
    [Rank.THREE]: 3,
    [Rank.FOUR]: 4,
    [Rank.FIVE]: 5,
    [Rank.SIX]: 6,
    [Rank.SEVEN]: 7,
    [Rank.EIGHT]: 8,
    [Rank.NINE]: 9,
    [Rank.TEN]: 10,
    [Rank.JACK]: 11,
    [Rank.QUEEN]: 12,
    [Rank.KING]: 13,
    [Rank.ACE]: 14,
  };

  const value1 = rankValues[card1.rank];
  const value2 = rankValues[card2.rank];

  if (value1 > value2) return 1;
  if (value1 < value2) return -1;
  return 0;
}

/**
 * Get the numeric value of a card's rank
 */
export function getCardValue(rank: Rank): number {
  const rankValues: Record<Rank, number> = {
    [Rank.TWO]: 2,
    [Rank.THREE]: 3,
    [Rank.FOUR]: 4,
    [Rank.FIVE]: 5,
    [Rank.SIX]: 6,
    [Rank.SEVEN]: 7,
    [Rank.EIGHT]: 8,
    [Rank.NINE]: 9,
    [Rank.TEN]: 10,
    [Rank.JACK]: 11,
    [Rank.QUEEN]: 12,
    [Rank.KING]: 13,
    [Rank.ACE]: 14,
  };
  return rankValues[rank];
}

/**
 * Convert a numeric value back to a Rank
 */
export function valueToRank(value: number): Rank | undefined {
  const rankMap: Record<number, Rank> = {
    2: Rank.TWO,
    3: Rank.THREE,
    4: Rank.FOUR,
    5: Rank.FIVE,
    6: Rank.SIX,
    7: Rank.SEVEN,
    8: Rank.EIGHT,
    9: Rank.NINE,
    10: Rank.TEN,
    11: Rank.JACK,
    12: Rank.QUEEN,
    13: Rank.KING,
    14: Rank.ACE,
  };
  return rankMap[value];
}
