import * as React from 'react';
import { motion } from 'framer-motion';
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

const suitSymbols: Record<Suit, string> = {
  [Suit.HEARTS]: '♥',
  [Suit.DIAMONDS]: '♦',
  [Suit.CLUBS]: '♣',
  [Suit.SPADES]: '♠',
};

const suitColors: Record<Suit, string> = {
  [Suit.HEARTS]: 'text-red-600',
  [Suit.DIAMONDS]: 'text-red-600',
  [Suit.CLUBS]: 'text-gray-900',
  [Suit.SPADES]: 'text-gray-900',
};

const Card = ({
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
}: CardProps): React.ReactElement => {
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
  const suitColor = suitColors[card.suit];

  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        y: selected ? -16 : 0,
        rotateY: card.faceUp ? 0 : 180,
      }}
      exit={{ scale: 0.8, opacity: 0 }}
      whileHover={
        selectable
          ? {
              scale: 1.05,
              y: selected ? -20 : -4,
              transition: { duration: 0.2 },
            }
          : undefined
      }
      whileTap={
        selectable
          ? {
              scale: 0.95,
              transition: { duration: 0.1 },
            }
          : undefined
      }
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 30,
        mass: 1,
      }}
      className={cn(
        'relative w-24 h-36 rounded-lg shadow-lg transition-shadow duration-200',
        selectable && 'cursor-pointer hover:shadow-xl',
        selected && 'ring-2 ring-blue-500',
        disabled && 'opacity-50',
        highlight && 'ring-2 ring-yellow-400',
        className
      )}
      style={{
        ...style,
        transformStyle: 'preserve-3d',
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      data-testid={testId}
    >
      <div
        className={cn(
          'absolute inset-0 rounded-lg backface-visibility-hidden',
          card.faceUp ? 'rotate-y-0' : 'rotate-y-180'
        )}
      >
        {card.faceUp ? (
          <div className="w-full h-full bg-white rounded-lg p-2 flex flex-col">
            {/* Top left rank and suit */}
            <div className="flex justify-between items-start">
              <span className={cn('text-xl font-bold', suitColor)}>{card.rank}</span>
              <span className={cn('text-xl', suitColor)}>{suitSymbol}</span>
            </div>

            {/* Center suit */}
            <div className="flex-grow flex items-center justify-center">
              <span className={cn('text-4xl transform', suitColor)}>{suitSymbol}</span>
            </div>

            {/* Bottom right rank and suit (inverted) */}
            <div className="flex justify-between items-end">
              <span className={cn('text-xl', suitColor)}>{suitSymbol}</span>
              <span className={cn('text-xl font-bold transform rotate-180', suitColor)}>
                {card.rank}
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-2">
            <div className="w-full h-full border-2 border-white rounded border-dashed flex items-center justify-center">
              <div className="text-white text-2xl font-bold transform rotate-45">♠</div>
            </div>
          </div>
        )}
      </div>

      {/* Selection/highlight overlay */}
      {(selected || highlight) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            'absolute inset-0 rounded-lg ring-2 pointer-events-none',
            selected && 'ring-blue-500',
            highlight && 'ring-yellow-400'
          )}
        />
      )}
    </motion.div>
  );
};

export default Card;
