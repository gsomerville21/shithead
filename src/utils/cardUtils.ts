import { Card, Rank } from '../types/card-types';

export class CardUtils {
  private static readonly rankValues: { [key in Rank]: number } = {
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

  static getCardValue(card: Card): number {
    return this.rankValues[card.rank];
  }

  static groupCardsByRank(cards: Card[]): Card[][] {
    const groups: Map<Rank, Card[]> = new Map();

    cards.forEach((card) => {
      if (!groups.has(card.rank)) {
        groups.set(card.rank, []);
      }
      groups.get(card.rank)!.push(card);
    });

    return Array.from(groups.values());
  }

  static findLastNonEightCard(pile: Card[]): Card | null {
    for (let i = pile.length - 1; i >= 0; i--) {
      if (pile[i].rank !== Rank.EIGHT) {
        return pile[i];
      }
    }
    return null;
  }

  static canCompleteFourOfAKind(playedCards: Card[], pileCards: Card[]): boolean {
    const rankCounts = new Map<Rank, number>();

    // Count played cards
    playedCards.forEach((card) => {
      rankCounts.set(card.rank, (rankCounts.get(card.rank) || 0) + 1);
    });

    // Count relevant pile cards
    pileCards.forEach((card) => {
      if (rankCounts.has(card.rank)) {
        rankCounts.set(card.rank, rankCounts.get(card.rank)! + 1);
      }
    });

    // Check if any rank reaches four
    return Array.from(rankCounts.values()).some((count) => count === 4);
  }
}
