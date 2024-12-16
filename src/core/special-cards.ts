/**
 * Special Card Effects Implementation
 */

import { Card, Rank, CardLocation } from '../types/card-types';
import { SpecialEffectType, SpecialEffect } from '../types/game';
import { compareCards, getCardValue, valueToRank } from './card';
import { GameStateContext } from './game-state';

interface SpecialEffectResult {
  effects: SpecialEffect[];
  nextValue: number;
  skipCount: number;
  burnPile: boolean;
}

/**
 * Process all special effects for played cards
 */
export function processSpecialEffects(
  playedCards: Card[],
  gameState: GameStateContext
): SpecialEffectResult {
  const result: SpecialEffectResult = {
    effects: [],
    nextValue: getCardValue(playedCards[0].rank),
    skipCount: 0,
    burnPile: false,
  };

  // Check for four of a kind (highest priority)
  if (checkFourOfAKind(playedCards, gameState.pile)) {
    result.effects.push({
      type: SpecialEffectType.BURN,
      timestamp: Date.now(),
    });
    result.burnPile = true;
    result.nextValue = 0; // Any card can be played after burn
    return result; // Return early as burn overrides other effects
  }

  // Process 2s (reset)
  if (playedCards.every((card) => card.rank === Rank.TWO)) {
    result.effects.push({
      type: SpecialEffectType.RESET,
      timestamp: Date.now(),
    });
    result.nextValue = 2; // Next card must be 3 or higher
    return result; // Return early as 2s override other effects
  }

  // Process 8s (transparent)
  if (playedCards.every((card) => card.rank === Rank.EIGHT)) {
    result.effects.push({
      type: SpecialEffectType.TRANSPARENT,
      timestamp: Date.now(),
    });
    // Keep previous card's value
    result.nextValue = getLastNonEightValue(gameState.pile);
    // Don't return early as 8s can be combined with Jacks
  }

  // Process Jacks (skip)
  if (playedCards.every((card) => card.rank === Rank.JACK)) {
    result.effects.push({
      type: SpecialEffectType.SKIP,
      timestamp: Date.now(),
    });
    // In a two-player game, skip count of 1 effectively means current player plays again
    result.skipCount = gameState.players.length === 2 ? 2 : playedCards.length;
  }

  return result;
}

/**
 * Validate if cards can be played considering special effects
 */
export function validateSpecialPlay(playedCards: Card[], gameState: GameStateContext): boolean {
  // Validate multiple cards are of the same rank
  if (!allSameRank(playedCards) && !canCompleteFourOfAKind(playedCards, gameState.pile)) {
    return false;
  }

  const topCard = gameState.pile[gameState.pile.length - 1];

  // Special case: no cards in pile or burn pile
  if (!topCard) return true;

  // Special case: 2s can be played on anything
  if (playedCards[0].rank === Rank.TWO) return true;

  // Special case: completing a four-of-a-kind
  if (canCompleteFourOfAKind(playedCards, gameState.pile)) return true;

  // Get effective value considering transparent 8s
  let effectiveTopCard = topCard;
  if (topCard.rank === Rank.EIGHT) {
    const effectiveValue = getLastNonEightValue(gameState.pile);
    const effectiveRank = valueToRank(effectiveValue);
    if (!effectiveRank) return false;
    effectiveTopCard = { ...topCard, rank: effectiveRank };
  }

  // Card must be equal to or higher than the effective top card
  const comparison = compareCards(playedCards[0], effectiveTopCard);
  return comparison >= 0;
}

/**
 * Calculate next player after applying special effects
 */
export function getNextPlayer(gameState: GameStateContext, skipCount: number): string {
  const currentIndex = gameState.players.indexOf(gameState.currentPlayer);
  const nextIndex = (currentIndex + skipCount + 1) % gameState.players.length;
  return gameState.players[nextIndex];
}

/**
 * Helper functions
 */
function allSameRank(cards: Card[]): boolean {
  return cards.every((card) => card.rank === cards[0].rank);
}

function getLastNonEightValue(pile: Card[]): number {
  let consecutiveEights = 0;

  // Count consecutive 8s from the top
  for (let i = pile.length - 1; i >= 0; i--) {
    if (pile[i].rank === Rank.EIGHT) {
      consecutiveEights++;
    } else {
      break;
    }
  }

  // Look for the last non-8 card
  for (let i = pile.length - consecutiveEights - 1; i >= 0; i--) {
    if (pile[i].rank !== Rank.EIGHT) {
      return getCardValue(pile[i].rank);
    }
  }

  // If all cards are 8s or no previous cards
  return 8; // Use 8 as base value
}

function checkFourOfAKind(playedCards: Card[], pile: Card[]): boolean {
  // Direct four of a kind
  if (playedCards.length === 4 && allSameRank(playedCards)) {
    return true;
  }

  // Completing four of a kind with pile
  if (!allSameRank(playedCards)) return false;

  const relevantPileCards = pile.filter((card) => card.rank === playedCards[0].rank);
  return playedCards.length + relevantPileCards.length === 4;
}

function canCompleteFourOfAKind(playedCards: Card[], pile: Card[]): boolean {
  const rankCounts = new Map<Rank, number>();

  // Count played cards
  playedCards.forEach((card) => {
    rankCounts.set(card.rank, (rankCounts.get(card.rank) || 0) + 1);
  });

  // Count relevant pile cards
  pile.forEach((card) => {
    if (rankCounts.has(card.rank)) {
      rankCounts.set(card.rank, rankCounts.get(card.rank)! + 1);
    }
  });

  // Check if any rank reaches exactly four
  return Array.from(rankCounts.values()).some((count) => count === 4);
}
