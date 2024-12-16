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

  constructor(gameId: string, numPlayers: number) {
    this.gameId = gameId;
    this.numPlayers = numPlayers;
    this.botService = new BotService(this);
  }

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

  private processPlayCards(state: GameState, player: PlayerState, cards: Card[]): GameState {
    // Validate play
    const topCard = state.pile.length > 0 ? state.pile[state.pile.length - 1] : null;
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

    // Add cards to pile with faceUp=true
    const playedCards = cards.map((card) => ({
      ...card,
      faceUp: true,
      location: CardLocation.PILE,
    }));
    state.pile.push(...playedCards);

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

  private processPickupPile(state: GameState, player: PlayerState): GameState {
    // Add pile to player's hand with faceUp=true for visibility
    player.hand.push(
      ...state.pile.map((card) => ({
        ...card,
        faceUp: true,
        location: CardLocation.HAND,
      }))
    );
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
      { ...player.faceUpCards[faceUpCardIndex], location: CardLocation.HAND },
      { ...player.hand[handCardIndex], location: CardLocation.FACE_UP, faceUp: true },
    ];

    state.lastAction = {
      type: ActionType.SWAP_CARDS,
      playerId: player.id,
      cards,
      timestamp: Date.now(),
    };

    return state;
  }

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

  private shuffleDeck(deck: Card[]): Card[] {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  dealCards(gameState: GameState): GameState {
    const state = { ...gameState };
    state.players.forEach((player) => {
      // Deal face down cards
      player.faceDownCards = state.deck.splice(0, 3).map((card) => ({
        ...card,
        location: CardLocation.FACE_DOWN,
        faceUp: false,
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
        faceUp: true,
        ownerId: player.id,
      }));
    });

    state.phase = GamePhase.SWAP;
    return state;
  }

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

  isValidPlay(cards: Card[], topCard: Card | null): boolean {
    // Check if all cards have same rank
    const allSameRank = cards.every((card) => card.rank === cards[0].rank);
    if (!allSameRank) return false;

    // Special case: empty pile or first play
    if (!topCard) return true;

    // Special cards
    if (cards[0].rank === Rank.TWO) return true; // 2 can be played on anything
    if (cards[0].rank === Rank.EIGHT) return true; // 8 is transparent

    // Compare with top card
    return this.getCardValue(cards[0]) >= this.getCardValue(topCard);
  }

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
