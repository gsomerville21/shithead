import {
  Card,
  GameState,
  PlayerState,
  GamePhase,
  ActionType,
  GameAction,
  SpecialEffectType,
} from '../types/game';
import { Suit, Rank, CardLocation } from '../types/card-types';
import { BotService } from './botService';

/**
 * Service class handling core game logic
 * @class GameService
 */
export class GameService {
  private gameId: string;
  private numPlayers: number;
  private botService: BotService;

  /**
   * Creates a new instance of the game service
   * @param {string} gameId - Unique identifier for the game
   * @param {number} numPlayers - Number of players in the game
   */
  constructor(gameId: string, numPlayers: number) {
    this.gameId = gameId;
    this.numPlayers = numPlayers;
    this.botService = new BotService(this);
  }

  /**
   * Processes a game action and returns the updated game state
   * @param {GameState} state - Current game state
   * @param {GameAction} action - Action to process
   * @returns {GameState} Updated game state
   */
  processAction(state: GameState, action: GameAction): GameState {
    const newState = { ...state };
    const player = newState.players.get(action.playerId);

    if (!player) {
      throw new Error('Invalid player ID');
    }

    switch (action.type) {
      case ActionType.PLAY_CARDS:
        if (!action.cards || action.cards.length === 0) {
          throw new Error('No cards provided for play action');
        }
        return this.processPlayCards(newState, player, action.cards);

      case ActionType.PICKUP_PILE:
        return this.processPickupPile(newState, player);

      case ActionType.SWAP_CARDS:
        if (!action.cards || action.cards.length !== 2) {
          throw new Error('Invalid number of cards for swap action');
        }
        return this.processSwapCards(newState, player, action.cards);

      case ActionType.CONFIRM_READY:
        return this.processConfirmReady(newState, player);

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Processes playing cards
   */
  private processPlayCards(state: GameState, player: PlayerState, cards: Card[]): GameState {
    // Validate play
    const topCard = state.pile[state.pile.length - 1];
    if (!this.isValidPlay(cards, topCard)) {
      throw new Error('Invalid card play');
    }

    // Remove cards from player's appropriate location
    if (player.hand.length > 0) {
      player.hand = player.hand.filter((c) => !cards.some((played) => played.id === c.id));
    } else if (player.faceUpCards.length > 0) {
      player.faceUpCards = player.faceUpCards.filter(
        (c) => !cards.some((played) => played.id === c.id)
      );
    } else if (player.faceDownCards.length > 0) {
      player.faceDownCards = player.faceDownCards.filter(
        (c) => !cards.some((played) => played.id === c.id)
      );
    }

    // Add cards to pile
    state.pile.push(...cards);

    // Check for special effects
    if (cards.length === 4) {
      // Four of a kind burns the pile
      state.pile = [];
      state.specialEffects.push({
        type: SpecialEffectType.BURN,
        timestamp: Date.now(),
      });
    } else if (cards[0].rank === Rank.JACK) {
      state.specialEffects.push({
        type: SpecialEffectType.SKIP,
        timestamp: Date.now(),
      });
      // Skip next player
      const players = Array.from(state.players.keys());
      const currentIndex = players.indexOf(state.currentPlayer);
      state.nextPlayer = players[(currentIndex + 2) % players.length];
    } else if (cards[0].rank === Rank.TWO) {
      state.specialEffects.push({
        type: SpecialEffectType.RESET,
        timestamp: Date.now(),
      });
    } else if (cards[0].rank === Rank.EIGHT) {
      state.specialEffects.push({
        type: SpecialEffectType.TRANSPARENT,
        timestamp: Date.now(),
      });
    }

    // Update current player if not burned
    if (state.pile.length > 0) {
      state.currentPlayer = state.nextPlayer;
      const players = Array.from(state.players.keys());
      const nextIndex = (players.indexOf(state.nextPlayer) + 1) % players.length;
      state.nextPlayer = players[nextIndex];
    }

    // Check win condition
    if (
      player.hand.length === 0 &&
      player.faceUpCards.length === 0 &&
      player.faceDownCards.length === 0
    ) {
      state.phase = GamePhase.ROUND_END;
      state.winner = player.id;
    }

    state.lastAction = {
      type: ActionType.PLAY_CARDS,
      playerId: player.id,
      cards,
      timestamp: Date.now(),
    };

    return state;
  }

  /**
   * Processes picking up the pile
   */
  private processPickupPile(state: GameState, player: PlayerState): GameState {
    // Add pile to player's hand
    player.hand.push(...state.pile);
    state.pile = [];

    // Move to next player
    state.currentPlayer = state.nextPlayer;
    const players = Array.from(state.players.keys());
    const nextIndex = (players.indexOf(state.nextPlayer) + 1) % players.length;
    state.nextPlayer = players[nextIndex];

    state.lastAction = {
      type: ActionType.PICKUP_PILE,
      playerId: player.id,
      timestamp: Date.now(),
    };

    return state;
  }

  /**
   * Processes swapping cards during the swap phase
   */
  private processSwapCards(state: GameState, player: PlayerState, cards: Card[]): GameState {
    const [handCard, faceUpCard] = cards;

    // Validate cards exist in correct locations
    const handCardIndex = player.hand.findIndex((c) => c.id === handCard.id);
    const faceUpCardIndex = player.faceUpCards.findIndex((c) => c.id === faceUpCard.id);

    if (handCardIndex === -1 || faceUpCardIndex === -1) {
      throw new Error('Invalid cards for swap');
    }

    // Perform swap
    [player.hand[handCardIndex], player.faceUpCards[faceUpCardIndex]] = [
      player.faceUpCards[faceUpCardIndex],
      player.hand[handCardIndex],
    ];

    state.lastAction = {
      type: ActionType.SWAP_CARDS,
      playerId: player.id,
      cards,
      timestamp: Date.now(),
    };

    return state;
  }

  /**
   * Processes confirming ready during the swap phase
   */
  private processConfirmReady(state: GameState, player: PlayerState): GameState {
    player.ready = true;

    // Check if all players are ready
    if (Array.from(state.players.values()).every((p) => p.ready)) {
      state.phase = GamePhase.PLAY;
    }

    state.lastAction = {
      type: ActionType.CONFIRM_READY,
      playerId: player.id,
      timestamp: Date.now(),
    };

    return state;
  }

  /**
   * Initializes a new game state
   * @param {number} numBots - Number of bot players to add
   * @returns {GameState} Initial game state
   * @throws {Error} If number of players is invalid
   */
  initializeGame(numBots: number = 0): GameState {
    if (this.numPlayers < 2 || this.numPlayers > 4) {
      throw new Error('Invalid number of players');
    }
    if (numBots >= this.numPlayers) {
      throw new Error('Must have at least one human player');
    }

    const players = new Map<string, PlayerState>();

    // Add human players
    for (let i = 0; i < this.numPlayers - numBots; i++) {
      const playerId = `player${i + 1}`;
      players.set(playerId, this.createPlayer(playerId, false));
    }

    // Add bot players
    for (let i = 0; i < numBots; i++) {
      const botId = `bot${i + 1}`;
      players.set(botId, this.createPlayer(botId, true));
    }

    const gameState: GameState = {
      id: this.gameId,
      phase: GamePhase.SETUP,
      players,
      currentPlayer: Array.from(players.keys())[0],
      nextPlayer: Array.from(players.keys())[1],
      deck: this.createDeck(),
      pile: [],
      lastAction: null,
      specialEffects: [],
      winner: null,
      config: {
        maxPlayers: this.numPlayers,
        startingCards: {
          hand: 3,
          faceUp: 3,
          faceDown: 3,
        },
        timeouts: {
          turn: 30000,
          swap: 60000,
          reconnect: 120000,
        },
        rules: {
          allowMultiples: true,
          burnOnFour: true,
          transparentEights: true,
          jackSkips: true,
          twoReset: true,
        },
        hostId: Array.from(players.keys())[0],
      },
      timestamp: Date.now(),
      moveHistory: [],
    };

    return this.dealCards(gameState);
  }

  /**
   * Creates a new player state
   * @private
   * @param {string} id - Player identifier
   * @param {boolean} isBot - Whether this is a bot player
   * @returns {PlayerState} New player state
   */
  private createPlayer(id: string, isBot: boolean): PlayerState {
    return {
      id,
      hand: [],
      faceUpCards: [],
      faceDownCards: [],
      connected: true,
      ready: isBot, // Bots are always ready
      timeoutWarnings: 0,
      isBot,
    };
  }

  /**
   * Creates and shuffles a new deck of cards
   * @private
   * @returns {Card[]} Shuffled deck of cards
   */
  private createDeck(): Card[] {
    const deck: Card[] = [];
    Object.values(Suit).forEach((suit) => {
      Object.values(Rank).forEach((rank) => {
        deck.push({
          id: `${suit}-${rank}`,
          suit,
          rank,
          location: CardLocation.DECK,
          faceUp: false,
          position: 0,
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
    state.players.forEach((player) => {
      // Deal face down cards
      player.faceDownCards = state.deck.splice(0, 3).map((card) => ({
        ...card,
        location: CardLocation.FACE_DOWN,
        ownerId: player.id,
      }));

      // Deal face up cards
      player.faceUpCards = state.deck.splice(0, 3).map((card) => ({
        ...card,
        location: CardLocation.FACE_UP,
        faceUp: true,
        ownerId: player.id,
      }));

      // Deal hand cards
      player.hand = state.deck.splice(0, 3).map((card) => ({
        ...card,
        location: CardLocation.HAND,
        ownerId: player.id,
      }));
    });

    state.phase = GamePhase.SWAP;
    return state;
  }

  /**
   * Processes a bot's turn if current player is a bot
   * @param {GameState} gameState - Current game state
   * @returns {GameState} Updated game state after bot's turn
   */
  processBotTurn(gameState: GameState): GameState {
    const currentPlayer = gameState.players.get(gameState.currentPlayer);
    if (!currentPlayer?.isBot) return gameState;

    // Get bot's move
    const cards = this.botService.determineBotMove(gameState, currentPlayer.id);

    // Process the move
    if (cards.length === 0) {
      // Bot picks up pile
      return this.processAction(gameState, {
        type: ActionType.PICKUP_PILE,
        playerId: currentPlayer.id,
        timestamp: Date.now(),
      });
    } else {
      // Bot plays cards
      return this.processAction(gameState, {
        type: ActionType.PLAY_CARDS,
        playerId: currentPlayer.id,
        cards,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Validates if a card or set of cards can be played
   * @param {Card[]} cards - Cards to validate
   * @param {Card | null} topCard - Current top card on pile
   * @returns {boolean} Whether the play is valid
   */
  isValidPlay(cards: Card[], topCard: Card | null): boolean {
    // Special case: empty pile
    if (!topCard) return true;

    // Check if all cards have same rank
    const allSameRank = cards.every((card) => card.rank === cards[0].rank);
    if (!allSameRank) return false;

    // Special cards
    if (cards[0].rank === Rank.TWO) return true;
    if (cards[0].rank === Rank.EIGHT) return true;

    // Compare with top card
    return this.getCardValue(cards[0]) >= this.getCardValue(topCard);
  }

  /**
   * Gets the numeric value of a card for comparison
   * @param {Card} card - Card to evaluate
   * @returns {number} Numeric value of the card
   */
  getCardValue(card: Card): number {
    const rankValues: { [key in Rank]: number } = {
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
    return rankValues[card.rank];
  }
}
