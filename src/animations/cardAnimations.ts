import { CardLocation } from '../types/card-types';

export interface Position {
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

export interface AnimationOptions {
  duration?: number;
  ease?: string;
  delay?: number;
}

export const defaultAnimationOptions: AnimationOptions = {
  duration: 0.5,
  ease: 'easeInOut',
  delay: 0
};

export const getCardPosition = (
  sourceLocation: CardLocation,
  targetLocation: CardLocation,
  index: number,
  total: number
): Position => {
  // Calculate positions based on source and target locations
  const calculateOffset = (idx: number, count: number) => {
    const spread = Math.min(count - 1, 5);
    const normalizedIndex = Math.min(idx, spread);
    return (normalizedIndex - spread / 2) * 30;
  };

  switch (targetLocation) {
    case CardLocation.PILE:
      return {
        x: 0,
        y: 0,
        rotation: Math.random() * 20 - 10,
        scale: 1
      };
    case CardLocation.HAND:
      return {
        x: calculateOffset(index, total),
        y: 200,
        rotation: 0,
        scale: 1
      };
    case CardLocation.FACE_UP:
      return {
        x: calculateOffset(index, total),
        y: 100,
        rotation: 0,
        scale: 1
      };
    case CardLocation.FACE_DOWN:
      return {
        x: calculateOffset(index, total),
        y: 0,
        rotation: 0,
        scale: 1
      };
    default:
      return { x: 0, y: 0, rotation: 0, scale: 1 };
  }
};

export const cardAnimationVariants = {
  initial: (custom: Position) => ({
    x: custom.x,
    y: custom.y,
    rotate: custom.rotation,
    scale: 0.8,
    opacity: 0
  }),
  animate: (custom: Position) => ({
    x: custom.x,
    y: custom.y,
    rotate: custom.rotation,
    scale: custom.scale,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut'
    }
  }),
  exit: (custom: Position) => ({
    x: custom.x,
    y: custom.y,
    rotate: custom.rotation,
    scale: 0.8,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: 'easeIn'
    }
  }),
  hover: {
    y: -10,
    scale: 1.05,
    transition: {
      duration: 0.2
    }
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1
    }
  }
};

export const createCardMovementAnimation = (
  from: Position,
  to: Position,
  options: AnimationOptions = {}
) => {
  const { duration, ease, delay } = { ...defaultAnimationOptions, ...options };
  
  return {
    animate: {
      x: [from.x, to.x],
      y: [from.y, to.y],
      rotate: [from.rotation, to.rotation],
      scale: [from.scale, to.scale],
      transition: {
        duration,
        ease,
        delay
      }
    }
  };
};

export const specialEffectAnimations = {
  burn: {
    initial: { scale: 2, opacity: 0 },
    animate: {
      scale: [2, 1],
      opacity: [0, 1, 0],
      transition: {
        duration: 1,
        times: [0, 0.3, 1]
      }
    }
  },
  flip: {
    initial: { rotateY: 0 },
    animate: {
      rotateY: 180,
      transition: {
        duration: 0.6,
        ease: 'easeInOut'
      }
    }
  },
  shake: {
    animate: {
      x: [0, -10, 10, -10, 10, 0],
      transition: {
        duration: 0.5,
        ease: 'easeInOut'
      }
    }
  }
};