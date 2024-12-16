import React from 'react';
import { Card as CardType } from '../types/game';

/**
 * Props for the Card component
 * @interface
 */
interface CardProps {
  /** The card data to display */
  card: CardType;
  /** Whether the card is currently selected */
  isSelected?: boolean;
  /** Whether the card is currently playable */
  isPlayable?: boolean;
  /** Callback fired when the card is clicked */
  onClick?: (card: CardType) => void;
  /** Optional CSS class names */
  className?: string;
}

/**
 * Renders a playing card with appropriate styling based on its state
 * 
 * @component
 * @example
 * ```tsx
 * <Card
 *   card={{ suit: 'hearts', rank: 'A', faceUp: true, id: 'hearts-A' }}
 *   isSelected={false}
 *   isPlayable={true}
 *   onClick={(card) => console.log('Card clicked:', card)}
 * />
 * ```
 */
export const Card: React.FC<CardProps> = ({
  card,
  isSelected = false,
  isPlayable = false,
  onClick,
  className = ''
}) => {
  /**
   * Handles the click event on the card
   * @param {React.MouseEvent} event - Click event
   */
  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    if (onClick && isPlayable) {
      onClick(card);
    }
  };

  /**
   * Gets the display symbol for a card suit
   * @param {string} suit - Card suit
   * @returns {string} Unicode symbol for the suit
   */
  const getSuitSymbol = (suit: string): string => {
    const symbols: { [key: string]: string } = {
      hearts: '♥',
      diamonds: '♦',
      clubs: '♣',
      spades: '♠'
    };
    return symbols[suit] || suit;
  };

  // Build the class string based on card state
  const cardClasses = [
    'card',
    isSelected ? 'selected' : '',
    isPlayable ? 'playable' : '',
    !card.faceUp ? 'face-down' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={cardClasses}
      onClick={handleClick}
      data-testid={`card-${card.id}`}
    >
      {card.faceUp ? (
        <>
          <div className="card-corner top-left">
            <div className="card-rank">{card.rank}</div>
            <div className="card-suit">{getSuitSymbol(card.suit)}</div>
          </div>
          <div className="card-center">
            {getSuitSymbol(card.suit)}
          </div>
          <div className="card-corner bottom-right">
            <div className="card-rank">{card.rank}</div>
            <div className="card-suit">{getSuitSymbol(card.suit)}</div>
          </div>
        </>
      ) : (
        <div className="card-back" />
      )}
    </div>
  );
};

export default Card;