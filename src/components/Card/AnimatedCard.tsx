import React, { useRef, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import Card from './Card';
import { Card as CardType } from '../../types/card-types';
import { cardAnimationVariants, Position, getCardPosition } from '../../animations/cardAnimations';

export interface AnimatedCardProps {
  card: CardType;
  position: Position;
  isSelected?: boolean;
  isSelectable?: boolean;
  isDisabled?: boolean;
  onSelect?: (card: CardType) => void;
  className?: string;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  card,
  position,
  isSelected,
  isSelectable,
  isDisabled,
  onSelect,
  className
}) => {
  const controls = useAnimation();
  const elementRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    controls.start('animate');
  }, [position, controls]);

  const handleClick = () => {
    if (!isDisabled && onSelect) {
      onSelect(card);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={elementRef}
        custom={position}
        variants={cardAnimationVariants}
        initial="initial"
        animate={controls}
        exit="exit"
        whileHover={isSelectable ? 'hover' : undefined}
        whileTap={isSelectable ? 'tap' : undefined}
        style={{
          position: 'absolute',
          transformOrigin: 'center center',
          perspective: 1000
        }}
        layoutId={card.id}
      >
        <Card
          card={card}
          selected={isSelected}
          selectable={isSelectable}
          disabled={isDisabled}
          onClick={handleClick}
          className={className}
        />
      </motion.div>
    </AnimatePresence>
  );
};

// Optimize renders with React.memo and custom comparison
export default React.memo(AnimatedCard, (prev, next) => {
  return (
    prev.card.id === next.card.id &&
    prev.position.x === next.position.x &&
    prev.position.y === next.position.y &&
    prev.position.rotation === next.position.rotation &&
    prev.isSelected === next.isSelected &&
    prev.isSelectable === next.isSelectable &&
    prev.isDisabled === next.isDisabled
  );
});