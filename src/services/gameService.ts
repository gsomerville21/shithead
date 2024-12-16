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
import { CardUtils } from '../utils/cardUtils';

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

  // Public method to get bot moves
  getBotMove(state: GameState, botId: string): Card[] {
    return this.botService.determineBotMove(state, botId);
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

  private drawCardsFromDeck(state: GameState, player: PlayerState, count: number): void {
    const cardsToAdd = Math.min(count, state.deck.length);
    if (cardsToAdd > 0) {
      const drawnCards = state.deck.splice(0, cardsToAdd).map((card) => ({
        ...card,
        location: CardLocation.HAND,
        faceUp: true,
        ownerId: player.id,
      }));
      player.hand.push(...drawnCards);
    }
  }

  private processPlayCards(state: GameState, player: PlayerState, cards: Card[]): GameState {
    const topCard = state.pile.length > 0 ? state.pile[state.pile.length - 1] : null;
    const playingFromFaceDown = player.hand.length === 0 && player.faceUpCards.length === 0;

    if (!this.validateCardPlay(state, player, cards, topCard, playingFromFaceDown)) {
      return this.handleInvalidPlay(state, player, cards[0]);
    }

    this.removeCardsFromPlayer(player, cards);
    this.addCardsToPile(state, cards);
    this.replenishPlayerHand(state, player);

    this.handleSpecialEffects(state, cards);
    this.updateGameState(state, player);

    state.lastAction = {
      type: ActionType.PLAY_CARDS,
      playerId: player.id,
      cards,
      timestamp: Date.now(),
    };

    return state;
  }

  private validateCardPlay(
    state: GameState,
    player: PlayerState,
    cards: Card[],
    topCard: Card | null,
    playingFromFaceDown: boolean
  ): boolean {
    if (playingFromFaceDown && cards.length !== 1) {
      return false;
    }

    return this.isValidPlay(cards, topCard, state.pile, state.config.rules.minNextCard);
  }

  private handleInvalidPlay(state: GameState, player: PlayerState, invalidCard: Card): GameState {
    if (player.hand.length === 0 && player.faceUpCards.length === 0) {
      player.hand.push(
        ...state.pile.map((card) => ({
          ...card,
          location: CardLocation.HAND,
          faceUp: true,
          ownerId: player.id,
        }))
      );
      player.hand.push({
        ...invalidCard,
        location: CardLocation.HAND,
        faceUp: true,
        ownerId: player.id,
      });
      state.pile = [];

      this.moveToNextPlayer(state);
    }
    return state;
  }

  private removeCardsFromPlayer(player: PlayerState, cards: Card[]): void {
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
  }

  private addCardsToPile(state: GameState, cards: Card[]): void {
    const playedCards = cards.map((card) => ({
      ...card,
      faceUp: true,
      location: CardLocation.PILE,
    }));
    state.pile.push(...playedCards);
  }

  private replenishPlayerHand(state: GameState, player: PlayerState): void {
    if (player.hand.length < 3 && state.deck.length > 0) {
      this.drawCardsFromDeck(state, player, 3 - player.hand.length);
    }
  }

  private handleSpecialEffects(state: GameState, cards: Card[]): void {
    if (
      cards.length === 4 ||
      CardUtils.canCompleteFourOfAKind(cards, state.pile.slice(0, -cards.length))
    ) {
      this.handleBurnEffect(state);
    } else if (cards[0].rank === Rank.JACK) {
      this.handleJackEffect(state);
    } else if (cards[0].rank === Rank.TWO) {
      this.handleTwoEffect(state);
    } else if (cards[0].rank === Rank.EIGHT) {
      this.handleEightEffect(state);
    } else {
      state.config.rules.minNextCard = 0;
    }
  }

  private handleBurnEffect(state: GameState): void {
    state.pile = [];
    state.specialEffects.push({
      type: SpecialEffectType.BURN,
      timestamp: Date.now(),
    });
  }

  private handleJackEffect(state: GameState): void {
    state.specialEffects.push({
      type: SpecialEffectType.SKIP,
      timestamp: Date.now(),
    });
    if (state.players.size === 2) {
      state.nextPlayer = state.currentPlayer;
    } else {
      const players = Array.from(state.players.keys());
      const currentIndex = players.indexOf(state.currentPlayer);
      state.nextPlayer = players[(currentIndex + 2) % players.length];
    }
  }

  private handleTwoEffect(state: GameState): void {
    state.specialEffects.push({
      type: SpecialEffectType.RESET,
      timestamp: Date.now(),
    });
    state.config.rules.minNextCard = 3;
  }

  private handleEightEffect(state: GameState): void {
    state.specialEffects.push({
      type: SpecialEffectType.TRANSPARENT,
      timestamp: Date.now(),
    });
  }

  private updateGameState(state: GameState, player: PlayerState): void {
    if (state.pile.length > 0) {
      this.moveToNextPlayer(state);
    }

    if (
      player.hand.length === 0 &&
      player.faceUpCards.length === 0 &&
      player.faceDownCards.length === 0
    ) {
      state.phase = GamePhase.ROUND_END;
      state.winner = player.id;
    }
  }

  private moveToNextPlayer(state: GameState): void {
    state.currentPlayer = state.nextPlayer;
    const players = Array.from(state.players.keys());
    const nextIndex = (players.indexOf(state.nextPlayer) + 1) % players.length;
    state.nextPlayer = players[nextIndex];
  }

  private processPickupPile(state: GameState, player: PlayerState): GameState {
    const pickedUpCards = state.pile.map((card) => ({
      ...card,
      faceUp: true,
      location: CardLocation.HAND,
      ownerId: player.id,
    }));
    player.hand.push(...pickedUpCards);
    state.pile = [];

    // Check for immediate four-of-a-kind burn opportunity
    const rankCounts = new Map<Rank, number>();
    player.hand.forEach((card) => {
      rankCounts.set(card.rank, (rankCounts.get(card.rank) || 0) + 1);
    });

    const fourOfAKindRank = Array.from(rankCounts.entries()).find(([_, count]) => count === 4)?.[0];
    if (fourOfAKindRank) {
      const fourCards = player.hand.filter((card) => card.rank === fourOfAKindRank).slice(0, 4);
      player.hand = player.hand.filter((card) => !fourCards.includes(card));
      state.pile = fourCards.map((card) => ({
        ...card,
        location: CardLocation.PILE,
      }));
      state.specialEffects.push({
        type: SpecialEffectType.BURN,
        timestamp: Date.now(),
      });
      state.nextPlayer = player.id;
    } else {
      this.moveToNextPlayer(state);
    }

    state.lastAction = {
      type: ActionType.PICKUP_PILE,
      playerId: player.id,
      timestamp: Date.now(),
    };

    return state;
  }

  private processSwapCards(state: GameState, player: PlayerState, cards: Card[]): GameState {
    if (state.phase !== GamePhase.SWAP) {
      throw new Error('Can only swap cards during setup phase');
    }

    const [handCard, faceUpCard] = cards;

    const handCardIndex = player.hand.findIndex((c) => c.id === handCard.id);
    const faceUpCardIndex = player.faceUpCards.findIndex((c) => c.id === faceUpCard.id);

    if (handCardIndex === -1 || faceUpCardIndex === -1) {
      throw new Error('Invalid cards for swap');
    }

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

  isValidPlay(cards: Card[], topCard: Card | null, pile: Card[], minNextCard: number): boolean {
    const allSameRank = cards.every((card) => card.rank === cards[0].rank);
    if (!allSameRank && !CardUtils.canCompleteFourOfAKind(cards, topCard ? [topCard] : [])) {
      return false;
    }

    if (!topCard) return true;

    if (cards[0].rank === Rank.TWO) return true;
    if (cards[0].rank === Rank.EIGHT) return true;
    if (topCard.rank === Rank.EIGHT) {
      const lastNonEight = CardUtils.findLastNonEightCard(pile);
      return lastNonEight
        ? CardUtils.getCardValue(cards[0]) >= CardUtils.getCardValue(lastNonEight)
        : true;
    }

    if (minNextCard > 0 && CardUtils.getCardValue(cards[0]) < minNextCard) {
      return false;
    }

    return CardUtils.getCardValue(cards[0]) >= CardUtils.getCardValue(topCard);
  }

  initializeGame(numBots: number = 0): GameState {
    if (this.numPlayers < 2 || this.numPlayers > 4) {
      throw new Error('Invalid number of players');
    }
    if (numBots >= this.numPlayers) {
      throw new Error('Must have at least one human player');
    }

    const players = new Map<string, PlayerState>();

    for (let i = 0; i < this.numPlayers - numBots; i++) {
      const playerId = `player${i + 1}`;
      players.set(playerId, this.createPlayer(playerId, false));
    }

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
          minNextCard: 0,
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
      ready: isBot,
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
      player.faceDownCards = state.deck.splice(0, 3).map((card) => ({
        ...card,
        location: CardLocation.FACE_DOWN,
        faceUp: false,
        ownerId: player.id,
      }));

      player.faceUpCards = state.deck.splice(0, 3).map((card) => ({
        ...card,
        location: CardLocation.FACE_UP,
        faceUp: true,
        ownerId: player.id,
      }));

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
}
