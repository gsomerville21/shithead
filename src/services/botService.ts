import { Card, Rank, CardLocation } from '../types/card-types';
import { GameState, PlayerState, GamePhase } from '../types/game';
import { GameService } from './gameService';
import { CardUtils } from '../utils/cardUtils';

export class BotService {
  private gameService: GameService;

  constructor(gameService: GameService) {
    this.gameService = gameService;
  }

  /**
   * Determines the best move for the bot to make
   */
  determineBotMove(gameState: GameState, botId: string): Card[] {
    const botPlayer = gameState.players.get(botId);
    if (!botPlayer) throw new Error('Bot player not found');

    const topCard = gameState.pile[gameState.pile.length - 1];
    const playableCards = this.getPlayableCards(botPlayer, gameState.phase);

    // Find valid plays
    const validPlays = this.findValidPlays(playableCards, topCard, gameState);
    if (validPlays.length === 0) return []; // Pick up pile if no valid plays

    // Choose best play based on strategy
    const bestPlay = this.chooseBestPlay(validPlays, gameState);

    // Ensure cards are face up when played
    return bestPlay.map((card) => ({
      ...card,
      faceUp: true,
      location: CardLocation.PILE,
    }));
  }

  /**
   * Gets cards that the bot can currently play based on game phase
   */
  private getPlayableCards(botPlayer: PlayerState, gamePhase: GamePhase): Card[] {
    if (botPlayer.hand.length > 0) {
      return botPlayer.hand;
    } else if (botPlayer.faceUpCards.length > 0) {
      return botPlayer.faceUpCards;
    } else if (botPlayer.faceDownCards.length > 0) {
      // When playing face down cards, make them face up
      return botPlayer.faceDownCards.map((card) => ({
        ...card,
        faceUp: true,
      }));
    }
    return [];
  }

  /**
   * Finds all valid card combinations that can be played
   */
  private findValidPlays(cards: Card[], topCard: Card | null, gameState: GameState): Card[][] {
    const validPlays: Card[][] = [];

    // Single card plays
    cards.forEach((card) => {
      if (
        this.gameService.isValidPlay(
          [card],
          topCard,
          gameState.pile,
          gameState.config.rules.minNextCard
        )
      ) {
        validPlays.push([card]);
      }
    });

    // Multiple card plays (same rank)
    const rankGroups = CardUtils.groupCardsByRank(cards);
    rankGroups.forEach((group) => {
      if (
        this.gameService.isValidPlay(
          group,
          topCard,
          gameState.pile,
          gameState.config.rules.minNextCard
        )
      ) {
        validPlays.push(group);
      }
    });

    return validPlays;
  }

  /**
   * Chooses the best play from valid options using basic strategy
   */
  private chooseBestPlay(validPlays: Card[][], gameState: GameState): Card[] {
    // Check for four of a kind (highest priority)
    const fourOfAKind = validPlays.find((play) => play.length === 4);
    if (fourOfAKind) return fourOfAKind;

    // Check for special cards
    const specialPlays = this.findSpecialPlays(validPlays);
    if (specialPlays.length > 0) {
      return this.chooseSpecialCard(specialPlays, gameState);
    }

    // Prefer multiple cards of same rank
    const multiplePlays = validPlays.filter((play) => play.length > 1);
    if (multiplePlays.length > 0) {
      return multiplePlays[0];
    }

    // Default to highest value card
    return validPlays.reduce((highest, current) => {
      const highestValue = CardUtils.getCardValue(highest[0]);
      const currentValue = CardUtils.getCardValue(current[0]);
      return currentValue > highestValue ? current : highest;
    });
  }

  /**
   * Finds plays containing special cards (2s, 8s, Jacks)
   */
  private findSpecialPlays(validPlays: Card[][]): Card[][] {
    return validPlays.filter(
      (play) =>
        play[0].rank === Rank.TWO || play[0].rank === Rank.EIGHT || play[0].rank === Rank.JACK
    );
  }

  /**
   * Chooses the most strategic special card to play
   */
  private chooseSpecialCard(specialPlays: Card[][], gameState: GameState): Card[] {
    // Use 2s when pile is high value
    const topCard = gameState.pile[gameState.pile.length - 1];
    if (topCard && CardUtils.getCardValue(topCard) > 10) {
      const twoPlay = specialPlays.find((play) => play[0].rank === Rank.TWO);
      if (twoPlay) return twoPlay;
    }

    // Use Jacks to skip when opponent has few cards
    const nextPlayer = this.getNextPlayer(gameState);
    if (nextPlayer && this.getPlayableCardCount(nextPlayer) <= 3) {
      const jackPlay = specialPlays.find((play) => play[0].rank === Rank.JACK);
      if (jackPlay) return jackPlay;
    }

    // Default to first special play
    return specialPlays[0];
  }

  /**
   * Gets the next player in turn order
   */
  private getNextPlayer(gameState: GameState): PlayerState | null {
    const players = Array.from(gameState.players.values());
    const currentPlayerIndex = players.findIndex((p) => p.id === gameState.currentPlayer);
    if (currentPlayerIndex === -1) return null;

    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
    return players[nextPlayerIndex];
  }

  /**
   * Gets total number of playable cards for a player
   */
  private getPlayableCardCount(player: PlayerState): number {
    return player.hand.length + player.faceUpCards.length + player.faceDownCards.length;
  }
}
