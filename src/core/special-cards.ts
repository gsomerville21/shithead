/**
 * Special Card Effects Implementation
 */

import { Card, Rank, CardLocation } from '../types/card-types';
import { compareCards } from './card';

export enum SpecialEffect {
  RESET = 'RESET',         // 2s: Reset pile value
  TRANSPARENT = 'TRANSPARENT', // 8s: Previous card value remains
  SKIP = 'SKIP',          // Jacks: Skip next player
  BURN = 'BURN'           // Four of a kind: Burns pile
}

interface SpecialEffectResult {
  effects: SpecialEffect[];
  nextValue: number;
  skipCount: number;
  burnPile: boolean;
}

interface GameState {
  pile: Card[];
  currentPlayer: string;
  nextPlayer: string;
  players: string[];
}

/**
 * Process all special effects for played cards
 */
export function processSpecialEffects(
  playedCards: Card[],
  gameState: GameState
): SpecialEffectResult {
  const result: SpecialEffectResult = {
    effects: [],
    nextValue: getCardValue(playedCards[0]),
    skipCount: 0,
    burnPile: false
  };

  // Check for four of a kind (highest priority)
  if (checkFourOfAKind(playedCards, gameState.pile)) {
    result.effects.push(SpecialEffect.BURN);
    result.burnPile = true;
    result.nextValue = 0; // Any card can be played after burn
  }

  // Process 2s (reset)
  if (playedCards.every(card => card.rank === Rank.TWO)) {
    result.effects.push(SpecialEffect.RESET);
    result.nextValue = 2;
  }

  // Process 8s (transparent)
  if (playedCards.every(card => card.rank === Rank.EIGHT)) {
    result.effects.push(SpecialEffect.TRANSPARENT);
    // Keep previous card's value
    result.nextValue = getLastNonEightValue(gameState.pile);
  }

  // Process Jacks (skip)
  if (playedCards.every(card => card.rank === Rank.JACK)) {
    result.effects.push(SpecialEffect.SKIP);
    result.skipCount = playedCards.length;
  }

  return result;
}

/**
 * Validate if cards can be played considering special effects
 */
export function validateSpecialPlay(
  playedCards: Card[],
  gameState: GameState
): boolean {
  // Can't play different ranks together (except in four-of-a-kind completion)
  if (!allSameRank(playedCards) && !canCompleteFourOfAKind(playedCards, gameState.pile)) {
    return false;
  }

  const topCard = gameState.pile[gameState.pile.length - 1];

  // Special case: no cards in pile
  if (!topCard) return true;

  // Special case: 2s can be played on anything
  if (playedCards[0].rank === Rank.TWO) return true;

  // Special case: 8s use previous non-8 card's value
  if (topCard.rank === Rank.EIGHT) {
    const effectiveValue = getLastNonEightValue(gameState.pile);
    return compareCards(playedCards[0], { ...topCard, rank: effectiveValue as Rank }) >= 0;
  }

  // Normal comparison
  return compareCards(playedCards[0], topCard) >= 0;
}

/**
 * Calculate next player after applying special effects
 */
export function getNextPlayer(
  gameState: GameState,
  skipCount: number
): string {
  const currentIndex = gameState.players.indexOf(gameState.currentPlayer);
  const nextIndex = (currentIndex + skipCount + 1) % gameState.players.length;
  return gameState.players[nextIndex];
}

/**
 * Helper functions
 */
function getCardValue(card: Card): number {
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
    [Rank.ACE]: 14
  };
  return rankValues[card.rank];
}

function allSameRank(cards: Card[]): boolean {
  return cards.every(card => card.rank === cards[0].rank);
}

function getLastNonEightValue(pile: Card[]): number {
  for (let i = pile.length - 1; i >= 0; i--) {
    if (pile[i].rank !== Rank.EIGHT) {
      return getCardValue(pile[i]);
    }
  }
  return 8; // If no non-8 found, use 8 as base value
}

function checkFourOfAKind(playedCards: Card[], pile: Card[]): boolean {
  if (playedCards.length === 4 && allSameRank(playedCards)) {
    return true;
  }

  // Check if playing cards completes four of a kind with pile
  const relevantPileCards = pile.filter(card => card.rank === playedCards[0].rank);
  return playedCards.length + relevantPileCards.length === 4;
}

function canCompleteFourOfAKind(playedCards: Card[], pile: Card[]): boolean {
  const rankCounts = new Map<Rank, number>();

  // Count played cards
  playedCards.forEach(card => {
    rankCounts.set(card.rank, (rankCounts.get(card.rank) || 0) + 1);
  });

  // Count relevant pile cards
  pile.forEach(card => {
    if (rankCounts.has(card.rank)) {
      rankCounts.set(card.rank, rankCounts.get(card.rank)! + 1);
    }
  });

  // Check if any rank reaches four
  return Array.from(rankCounts.values()).some(count => count === 4);
}