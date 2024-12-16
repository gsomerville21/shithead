import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card as CardType, Suit } from '../../types/card-types';
import { cn } from '../../utils/classnames';

export interface CardProps {
  card: CardType;
  selectable?: boolean;
  selected?: boolean;
  disabled?: boolean;
  highlight?: boolean;
  onClick?: (card: CardType) => void;
  onHover?: (card: CardType) => void;
  className?: string;
  style?: React.CSSProperties;
  testId?: string;
}

const suitSymbols = {
  [Suit.HEARTS]: '♥',
  [Suit.DIAMONDS]: '♦',
  [Suit.CLUBS]: '♣',
  [Suit.SPADES]: '♠'
};

const Card: React.FC<CardProps> = ({
  card,
  selectable = false,
  selected = false,
  disabled = false,
  highlight = false,
  onClick,
  onHover,
  className,
  style,
  testId,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!disabled && onClick) {
      onClick(card);
    }
  };

  const handleMouseEnter = () => {
    if (!disabled && onHover) {
      onHover(card);
    }
  };

  const isRed = card.suit === Suit.HEARTS || card.suit === Suit.DIAMONDS;
  const suitSymbol = suitSymbols[card.suit];

  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      whileHover={selectable ? { scale: 1.05, y: -5 } : undefined}
      whileTap={selectable ? { scale: 0.95 } : undefined}
      className={cn(
        'relative w-24 h-36 rounded-lg shadow-md transition-colors cursor-default',
        selectable && 'cursor-pointer',
        selected && 'ring-2 ring-blue-500',
        disabled && 'opacity-50',
        highlight && 'ring-2 ring-yellow-400',
        className
      )}
      style={style}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      data-testid={testId}
    >
      <div className={cn(
        'absolute inset-0 rounded-lg backface-visibility-hidden transition-transform duration-300',
        !card.faceUp && 'rotate-y-180'
      )}>
        {card.faceUp ? (
          <div className="w-full h-full bg-white rounded-lg p-2 flex flex-col">
            <div className="flex justify-between items-start">
              <span className={cn(
                'text-2xl font-bold',
                isRed ? 'text-red-600' : 'text-gray-900'
              )}>
                {card.rank}
              </span>
              <span className={cn(
                'text-2xl',
                isRed ? 'text-red-600' : 'text-gray-900'
              )}>
                {suitSymbol}
              </span>
            </div>
            <div className="flex-grow flex items-center justify-center">
              <span className={cn(
                'text-4xl',
                isRed ? 'text-red-600' : 'text-gray-900'
              )}>
                {suitSymbol}
              </span>
            </div>
            <div className="flex justify-between items-end">
              <span className={cn(
                'text-2xl',
                isRed ? 'text-red-600' : 'text-gray-900'
              )}>
                {suitSymbol}
              </span>
              <span className={cn(
                'text-2xl font-bold rotate-180',
                isRed ? 'text-red-600' : 'text-gray-900'
              )}>
                {card.rank}
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-blue-500 rounded-lg p-2">
            <div className="w-full h-full border-2 border-white rounded border-dashed flex items-center justify-center">
              <div className="text-white text-2xl font-bold">♠</div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Card;