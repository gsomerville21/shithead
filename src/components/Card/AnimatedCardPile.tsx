import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedCard from './AnimatedCard';
import { Card as CardType, CardLocation } from '../../types/card-types';
import { getCardPosition } from '../../animations/cardAnimations';
import { cn } from '../../utils/classnames';

export interface AnimatedCardPileProps {
  cards: CardType[];
  location: CardLocation;
  selectable?: boolean;
  onCardSelect?: (card: CardType) => void;
  className?: string;
}

const AnimatedCardPile: React.FC<AnimatedCardPileProps> = ({
  cards,
  location,
  selectable = false,
  onCardSelect,
  className
}) => {
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());

  const handleCardSelect = useCallback((card: CardType) => {
    if (!selectable) return;

    setSelectedCards(prev => {
      const next = new Set(prev);
      if (next.has(card.id)) {
        next.delete(card.id);
      } else {
        next.add(card.id);
      }
      return next;
    });

    if (onCardSelect) {
      onCardSelect(card);
    }
  }, [selectable, onCardSelect]);

  return (
    <div className={cn('relative', className)}>
      <AnimatePresence mode="popLayout">
        {cards.map((card, index) => {
          const position = getCardPosition(
            card.location,
            location,
            index,
            cards.length
          );

          return (
            <AnimatedCard
              key={card.id}
              card={card}
              position={position}
              isSelected={selectedCards.has(card.id)}
              isSelectable={selectable}
              onSelect={handleCardSelect}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(AnimatedCardPile);