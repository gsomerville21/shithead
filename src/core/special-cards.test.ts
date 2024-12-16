/**
 * Special Card Effects Tests
 */

import { Card, Rank, Suit, CardLocation } from '../types/card-types';
import {
  processSpecialEffects,
  validateSpecialPlay,
  getNextPlayer,
  SpecialEffect
} from './special-cards';
import { createCard } from './card';

describe('Special Effects Processing', () => {
  const createGameState = (pile: Card[] = []) => ({
    pile,
    currentPlayer: 'player1',
    nextPlayer: 'player2',
    players: ['player1', 'player2', 'player3']
  });

  describe('Reset Effect (2s)', () => {
    test('should process single two', () => {
      const two = createCard(Suit.HEARTS, Rank.TWO);
      const result = processSpecialEffects([two], createGameState());
      
      expect(result.effects).toContain(SpecialEffect.RESET);
      expect(result.nextValue).toBe(2);
    });

    test('should process multiple twos', () => {
      const twos = [
        createCard(Suit.HEARTS, Rank.TWO),
        createCard(Suit.DIAMONDS, Rank.TWO)
      ];
      const result = processSpecialEffects(twos, createGameState());
      
      expect(result.effects).toContain(SpecialEffect.RESET);
      expect(result.nextValue).toBe(2);
    });
  });

  describe('Transparent Effect (8s)', () => {
    test('should process single eight', () => {
      const eight = createCard(Suit.HEARTS, Rank.EIGHT);
      const pile = [createCard(Suit.DIAMONDS, Rank.KING)];
      const result = processSpecialEffects([eight], createGameState(pile));
      
      expect(result.effects).toContain(SpecialEffect.TRANSPARENT);
      expect(result.nextValue).toBe(13); // King's value
    });

    test('should handle multiple eights', () => {
      const eights = [
        createCard(Suit.HEARTS, Rank.EIGHT),
        createCard(Suit.DIAMONDS, Rank.EIGHT)
      ];
      const pile = [createCard(Suit.CLUBS, Rank.QUEEN)];
      const result = processSpecialEffects(eights, createGameState(pile));
      
      expect(result.effects).toContain(SpecialEffect.TRANSPARENT);
      expect(result.nextValue).toBe(12); // Queen's value
    });

    test('should find last non-eight value', () => {
      const eight = createCard(Suit.HEARTS, Rank.EIGHT);
      const pile = [
        createCard(Suit.CLUBS, Rank.QUEEN),
        createCard(Suit.HEARTS, Rank.EIGHT),
        createCard(Suit.DIAMONDS, Rank.EIGHT)
      ];
      const result = processSpecialEffects([eight], createGameState(pile));
      
      expect(result.nextValue).toBe(12); // Queen's value
    });
  });

  describe('Skip Effect (Jacks)', () => {
    test('should process single jack', () => {
      const jack = createCard(Suit.HEARTS, Rank.JACK);
      const result = processSpecialEffects([jack], createGameState());
      
      expect(result.effects).toContain(SpecialEffect.SKIP);
      expect(result.skipCount).toBe(1);
    });

    test('should process multiple jacks', () => {
      const jacks = [
        createCard(Suit.HEARTS, Rank.JACK),
        createCard(Suit.DIAMONDS, Rank.JACK)
      ];
      const result = processSpecialEffects(jacks, createGameState());
      
      expect(result.effects).toContain(SpecialEffect.SKIP);
      expect(result.skipCount).toBe(2);
    });
  });

  describe('Burn Effect (Four of a Kind)', () => {
    test('should process four of same rank', () => {
      const fourKings = [
        createCard(Suit.HEARTS, Rank.KING),
        createCard(Suit.DIAMONDS, Rank.KING),
        createCard(Suit.CLUBS, Rank.KING),
        createCard(Suit.SPADES, Rank.KING)
      ];
      const result = processSpecialEffects(fourKings, createGameState());
      
      expect(result.effects).toContain(SpecialEffect.BURN);
      expect(result.burnPile).toBe(true);
      expect(result.nextValue).toBe(0);
    });

    test('should complete four of kind with pile', () => {
      const twoKings = [
        createCard(Suit.HEARTS, Rank.KING),
        createCard(Suit.DIAMONDS, Rank.KING)
      ];
      const pile = [
        createCard(Suit.CLUBS, Rank.KING),
        createCard(Suit.SPADES, Rank.KING)
      ];
      const result = processSpecialEffects(twoKings, createGameState(pile));
      
      expect(result.effects).toContain(SpecialEffect.BURN);
      expect(result.burnPile).toBe(true);
    });
  });

  describe('Multiple Effects', () => {
    test('should handle multiple effects in order', () => {
      const fourJacks = [
        createCard(Suit.HEARTS, Rank.JACK),
        createCard(Suit.DIAMONDS, Rank.JACK),
        createCard(Suit.CLUBS, Rank.JACK),
        createCard(Suit.SPADES, Rank.JACK)
      ];
      const result = processSpecialEffects(fourJacks, createGameState());
      
      expect(result.effects).toContain(SpecialEffect.BURN);
      expect(result.effects).toContain(SpecialEffect.SKIP);
      expect(result.burnPile).toBe(true);
      expect(result.skipCount).toBe(4);
    });
  });
});

describe('Special Play Validation', () => {
  const createGameState = (pile: Card[] = []) => ({
    pile,
    currentPlayer: 'player1',
    nextPlayer: 'player2',
    players: ['player1', 'player2', 'player3']
  });

  test('should allow twos on anything', () => {
    const two = createCard(Suit.HEARTS, Rank.TWO);
    const pile = [createCard(Suit.SPADES, Rank.ACE)];
    
    expect(validateSpecialPlay([two], createGameState(pile))).toBe(true);
  });

  test('should validate eights against previous value', () => {
    const eight = createCard(Suit.HEARTS, Rank.EIGHT);
    const pile = [
      createCard(Suit.CLUBS, Rank.KING),
      createCard(Suit.DIAMONDS, Rank.EIGHT)
    ];
    
    expect(validateSpecialPlay([eight], createGameState(pile))).toBe(false);
  });

  test('should allow completing four of a kind', () => {
    const twoKings = [
      createCard(Suit.HEARTS, Rank.KING),
      createCard(Suit.DIAMONDS, Rank.KING)
    ];
    const pile = [
      createCard(Suit.CLUBS, Rank.KING),
      createCard(Suit.SPADES, Rank.ACE)
    ];
    
    expect(validateSpecialPlay(twoKings, createGameState(pile))).toBe(true);
  });
});

describe('Next Player Calculation', () => {
  const gameState = {
    currentPlayer: 'player1',
    nextPlayer: 'player2',
    players: ['player1', 'player2', 'player3']
  };

  test('should skip correct number of players', () => {
    expect(getNextPlayer(gameState, 1)).toBe('player3');
    expect(getNextPlayer(gameState, 2)).toBe('player1');
  });

  test('should handle wrap around', () => {
    expect(getNextPlayer(gameState, 3)).toBe('player2');
    expect(getNextPlayer(gameState, 4)).toBe('player3');
  });
});