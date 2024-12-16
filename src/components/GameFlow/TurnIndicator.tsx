import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/classnames';

export interface TurnIndicatorProps {
  currentPlayer: string;
  timeLeft: number;
  maxTime: number;
  isYourTurn: boolean;
  className?: string;
}

const TurnIndicator = ({
  currentPlayer,
  timeLeft,
  maxTime,
  isYourTurn,
  className,
}: TurnIndicatorProps): React.ReactElement => {
  const timePercentage = (timeLeft / maxTime) * 100;
  const isLowTime = timeLeft <= maxTime * 0.25;
  const isCriticalTime = timeLeft <= maxTime * 0.1;

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={cn(
        'fixed top-2 right-4 flex items-center gap-4 bg-black/80 rounded-lg px-4 py-2',
        className
      )}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPlayer}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={cn('text-lg font-bold', isYourTurn ? 'text-blue-300' : 'text-white')}
        >
          {isYourTurn ? 'Your Turn' : `${currentPlayer}'s Turn`}
        </motion.div>
      </AnimatePresence>

      <div className="w-32 flex flex-col gap-1">
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className={cn(
              'h-full rounded-full',
              isCriticalTime ? 'bg-red-500' : isLowTime ? 'bg-yellow-500' : 'bg-green-500'
            )}
            initial={{ width: '100%' }}
            animate={{
              width: `${timePercentage}%`,
              scale: isCriticalTime ? [1, 1.1, 1] : 1,
            }}
            transition={{
              width: { duration: 0.3 },
              scale: isCriticalTime
                ? {
                    duration: 0.5,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }
                : undefined,
            }}
          />
        </div>

        <motion.div
          className={cn(
            'text-sm font-medium text-center',
            isCriticalTime ? 'text-red-300' : isLowTime ? 'text-yellow-300' : 'text-white'
          )}
          animate={
            isCriticalTime
              ? {
                  scale: [1, 1.1, 1],
                  transition: {
                    duration: 0.5,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  },
                }
              : undefined
          }
        >
          {formatTime(timeLeft)}
        </motion.div>
      </div>
    </div>
  );
};

export default TurnIndicator;