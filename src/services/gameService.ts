import { Card, GameState, PlayerState, CardRank, CardSuit } from '../types/game';

/**
 * Service class handling core game logic
 * @class GameService
 */
export class GameService {
  /**
   * Creates a new instance of the game service
   * @param {string} gameId - Unique identifier for the game
   * @param {number} numPlayers - Number of players in the game
   */
  constructor(gameId: string, numPlayers: number) {
    this.gameId = gameId;
    this.numPlayers = numPlayers;
  }

  /**
   * Initializes a new game state
   * @returns {GameState} Initial game state
   * @throws {Error} If number of players is invalid
   */
  initializeGame(): GameState {
    if (this.numPlayers < 2 || this.numPlayers > 4) {
      throw new Error('Invalid number of players');
    }
    return {
      id: this.gameId,
      players: [],
      deck: this.createDeck(),
      discardPile: [],
      phase: 'SETUP',
      currentTurnPlayerId: '',
      turnStartTime: Date.now(),
      isGameOver: false
    };
  }

  /**
   * Creates and shuffles a new deck of cards
   * @private
   * @returns {Card[]} Shuffled deck of cards
   */
  private createDeck(): Card[] {
    const deck: Card[] = [];
    Object.values(CardSuit).forEach(suit => {
      Object.values(CardRank).forEach(rank => {
        deck.push({
          suit,
          rank,
          faceUp: false,
          id: `${suit}-${rank}`
        });
      });
    });
    return this.shuffleDeck(deck);
  }

  /**
   * Shuffles an array of cards using Fisher-Yates algorithm
   * @private
   * @param {Card[]} deck - Array of cards to shuffle
   * @returns {Card[]} Shuffled array of cards
   */
  private shuffleDeck(deck: Card[]): Card[] {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  /**
   * Deals initial cards to all players
   * @param {GameState} gameState - Current game state
   * @returns {GameState} Updated game state after dealing
   */
  dealCards(gameState: GameState): GameState {
    const state = { ...gameState };
    state.players.forEach(player => {
      // Deal face down cards
      player.tableCardsDown = state.deck.splice(0, 3);
      // Deal face up cards
      player.tableCardsUp = state.deck.splice(0, 3);
      player.tableCardsUp.forEach(card => card.faceUp = true);
      // Deal hand cards
      player.hand = state.deck.splice(0, 3);
    });
    return state;
  }

  /**
   * Validates if a card or set of cards can be played
   * @param {Card[]} cards - Cards to validate
   * @param {Card | null} topCard - Current top card on discard pile
   * @returns {boolean} Whether the play is valid
   */
  isValidPlay(cards: Card[], topCard: Card | null): boolean {
    // Special case: empty pile
    if (!topCard) return true;
    
    // Check if all cards have same rank
    const allSameRank = cards.every(card => card.rank === cards[0].rank);
    if (!allSameRank) return false;

    // Special cards
    if (cards[0].rank === CardRank.TWO) return true;
    if (cards[0].rank === CardRank.EIGHT) return true;
    
    // Compare with top card
    return this.getCardValue(cards[0]) >= this.getCardValue(topCard);
  }

  /**
   * Gets the numeric value of a card for comparison
   * @private
   * @param {Card} card - Card to evaluate
   * @returns {number} Numeric value of the card
   */
  private getCardValue(card: Card): number {
    const rankValues: { [key in CardRank]: number } = {
      [CardRank.TWO]: 2,
      [CardRank.THREE]: 3,
      [CardRank.FOUR]: 4,
      [CardRank.FIVE]: 5,
      [CardRank.SIX]: 6,
      [CardRank.SEVEN]: 7,
      [CardRank.EIGHT]: 8,
      [CardRank.NINE]: 9,
      [CardRank.TEN]: 10,
      [CardRank.JACK]: 11,
      [CardRank.QUEEN]: 12,
      [CardRank.KING]: 13,
      [CardRank.ACE]: 14
    };
    return rankValues[card.rank];
  }
}