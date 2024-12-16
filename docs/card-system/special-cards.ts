/**
 * Special Card Effects Implementation for Shithead Card Game
 */

import { Card, SpecialEffect, Rank, CardLocation } from './card-types';

// Special card effect handler interface
export interface EffectHandler {
  canTrigger: (cards: Card[], topCard?: Card) => boolean;
  apply: (gameState: GameState) => GameState;
  priority: number;  // Higher priority effects trigger first
}

// Game state interface for effect handling
export interface GameState {
  currentPlayer: string;
  nextPlayer: string;
  pile: Card[];
  activeValue: number;
  skipCount: number;
  burned: boolean;
}

// Effect handler registry
export const effectHandlers: Record<SpecialEffect, EffectHandler> = {
  [SpecialEffect.RESET]: {
    priority: 1,
    canTrigger: (cards) => cards.every(card => card.rank === Rank.TWO),
    apply: (state) => ({
      ...state,
      activeValue: 2,
      burned: false
    })
  },

  [SpecialEffect.TRANSPARENT]: {
    priority: 2,
    canTrigger: (cards, topCard) => (
      cards.every(card => card.rank === Rank.EIGHT) && topCard !== undefined
    ),
    apply: (state) => ({
      ...state,
      // Eight maintains previous card's value
      activeValue: state.pile[state.pile.length - 2]?.value ?? 8
    })
  },

  [SpecialEffect.SKIP]: {
    priority: 3,
    canTrigger: (cards) => cards.every(card => card.rank === Rank.JACK),
    apply: (state) => ({
      ...state,
      skipCount: state.skipCount + cards.length,
      nextPlayer: calculateNextPlayer(state.currentPlayer, state.skipCount + 1)
    })
  },

  [SpecialEffect.BURN]: {
    priority: 4,
    canTrigger: (cards) => {
      // Check for four of a kind
      if (cards.length === 4) {
        return cards.every(card => card.rank === cards[0].rank);
      }
      // Check for completing four of a kind with pile
      const pileCards = getTopPileCards(3);
      return cards.length + pileCards.length === 4 && 
             [...cards, ...pileCards].every(card => card.rank === cards[0].rank);
    },
    apply: (state) => ({
      ...state,
      pile: [],
      burned: true,
      activeValue: 0  // Next card can be anything
    })
  }
};

// Effect chain processing
export interface EffectResult {
  finalState: GameState;
  triggeredEffects: SpecialEffect[];
}

/**
 * Process all applicable special effects for a card play
 * @param cards Cards being played
 * @param gameState Current game state
 * @returns Updated game state and triggered effects
 */
export function processSpecialEffects(
  cards: Card[], 
  gameState: GameState
): EffectResult {
  let currentState = { ...gameState };
  const triggeredEffects: SpecialEffect[] = [];

  // Sort handlers by priority
  const sortedHandlers = Object.entries(effectHandlers)
    .sort(([, a], [, b]) => b.priority - a.priority);

  // Process each handler
  for (const [effect, handler] of sortedHandlers) {
    if (handler.canTrigger(cards, currentState.pile[currentState.pile.length - 1])) {
      currentState = handler.apply(currentState);
      triggeredEffects.push(effect as SpecialEffect);
    }
  }

  return {
    finalState: currentState,
    triggeredEffects
  };
}

/**
 * Special Effect Validation Rules
 */
export const effectValidation = {
  validateReset: (cards: Card[], topCard?: Card): boolean => {
    // Twos can be played on anything
    return cards.every(card => card.rank === Rank.TWO);
  },

  validateTransparent: (cards: Card[], topCard?: Card): boolean => {
    // Eights take on previous card's value
    return cards.every(card => card.rank === Rank.EIGHT) && topCard !== undefined;
  },

  validateSkip: (cards: Card[], topCard?: Card): boolean => {
    // Jacks must follow normal value rules unless played on burn
    if (!topCard || topCard.value <= 11) {
      return cards.every(card => card.rank === Rank.JACK);
    }
    return false;
  },

  validateBurn: (cards: Card[], pile: Card[]): boolean => {
    // Must have exactly four cards of same rank, either all at once
    // or completing a set with top pile cards
    const totalCards = [...cards];
    let i = pile.length - 1;
    
    while (i >= 0 && totalCards.length < 4 && 
           pile[i].rank === cards[0].rank) {
      totalCards.push(pile[i]);
      i--;
    }

    return totalCards.length === 4 && 
           totalCards.every(card => card.rank === totalCards[0].rank);
  }
};