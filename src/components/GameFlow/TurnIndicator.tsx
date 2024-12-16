import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/classnames';

export interface TurnIndicatorProps {
  currentPlayer: string;
  timeLeft: number;
  maxTime: number;
  isYourTurn: boolean;
  className?: string;
}

const TurnIndicator: React.FC<TurnIndicatorProps> = ({
  currentPlayer,
  timeLeft,
  maxTime,
  isYourTurn,
  className
}) => {
  const timePercentage = (timeLeft / maxTime) * 100;
  const isLowTime = timeLeft <= maxTime * 0.25;

  return (
    <div className={cn(
      'flex flex-col items-center gap-2 bg-black bg-opacity-50 rounded-lg p-4',
      className
    )}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPlayer}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="text-white text-lg font-bold"
        >
          {isYourTurn ? "Your Turn" : `${currentPlayer}'s Turn`}
        </motion.div>
      </AnimatePresence>

      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={cn(
            'h-full rounded-full',
            isLowTime ? 'bg-red-500' : 'bg-green-500'
          )}
          initial={{ width: '100%' }}
          animate={{ width: `${timePercentage}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className={cn(
        'text-sm',
        isLowTime ? 'text-red-300' : 'text-white'
      )}>
        {Math.ceil(timeLeft / 1000)}s
      </div>
    </div>
  );
};

export default TurnIndicator;