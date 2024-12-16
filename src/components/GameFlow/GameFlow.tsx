import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/classnames';
import { GameState, GamePhase } from '../../types/game';
import { Card as CardType } from '../../types/card-types';
import TurnIndicator from './TurnIndicator';
import ActionPrompt from './ActionPrompt';

export interface GameFlowProps {
  gameState: GameState;
  currentPlayerId: string;
  selectedCards: CardType[];
  onPlay: () => void;
  onPickup: () => void;
  onConfirmReady?: () => void;
  className?: string;
}

const GameFlow: React.FC<GameFlowProps> = ({
  gameState,
  currentPlayerId,
  selectedCards,
  onPlay,
  onPickup,
  onConfirmReady,
  className
}) => {
  const [timeLeft, setTimeLeft] = useState(gameState.config.timeouts.turn);
  const isYourTurn = gameState.currentPlayer === currentPlayerId;

  // Timer management
  useEffect(() => {
    if (gameState.phase !== GamePhase.PLAY) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.phase]);

  // Reset timer on turn change
  useEffect(() => {
    setTimeLeft(gameState.config.timeouts.turn);
  }, [gameState.currentPlayer, gameState.config.timeouts.turn]);

  const canPlay = React.useMemo(() => {
    // Add your card play validation logic here
    // This is a simplified version
    return selectedCards.length > 0;
  }, [selectedCards]);

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Game phase indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg text-center"
      >
        {gameState.phase}
      </motion.div>

      {/* Turn timer */}
      {gameState.phase === GamePhase.PLAY && (
        <TurnIndicator
          currentPlayer={gameState.currentPlayer}
          timeLeft={timeLeft}
          maxTime={gameState.config.timeouts.turn}
          isYourTurn={isYourTurn}
        />
      )}

      {/* Action prompt */}
      <ActionPrompt
        phase={gameState.phase}
        selectedCards={selectedCards}
        isYourTurn={isYourTurn}
        canPlay={canPlay}
        onPlay={onPlay}
        onPickup={onPickup}
        onConfirmReady={onConfirmReady}
      />

      {/* Special effects */}
      {gameState.specialEffects.map((effect, index) => (
        <motion.div
          key={index}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.5, opacity: 0 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl text-yellow-400"
        >
          {effect.type}
        </motion.div>
      ))}
    </div>
  );
};

export default GameFlow;