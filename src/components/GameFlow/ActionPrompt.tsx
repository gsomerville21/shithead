import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/classnames';
import { GamePhase } from '../../types/game';
import { Card as CardType } from '../../types/card-types';

export interface ActionPromptProps {
  phase: GamePhase;
  selectedCards: CardType[];
  isYourTurn: boolean;
  canPlay: boolean;
  onPlay: () => void;
  onPickup: () => void;
  onConfirmReady?: () => void;
  className?: string;
}

const ActionPrompt: React.FC<ActionPromptProps> = ({
  phase,
  selectedCards,
  isYourTurn,
  canPlay,
  onPlay,
  onPickup,
  onConfirmReady,
  className
}) => {
  const getPromptMessage = () => {
    if (!isYourTurn) return "Wait for your turn";
    if (phase === GamePhase.SWAP) return "Swap cards or confirm ready";
    if (selectedCards.length === 0) return "Select cards to play or pickup pile";
    return canPlay ? "Play selected cards" : "Invalid play - try different cards";
  };

  const getActionButtons = () => {
    if (!isYourTurn) return null;

    switch (phase) {
      case GamePhase.SWAP:
        return (
          <button
            onClick={onConfirmReady}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Confirm Ready
          </button>
        );
      case GamePhase.PLAY:
        return (
          <div className="flex gap-2">
            <button
              onClick={onPlay}
              disabled={!canPlay || selectedCards.length === 0}
              className={cn(
                'px-4 py-2 rounded-lg transition-colors',
                canPlay && selectedCards.length > 0
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-500 text-gray-200 cursor-not-allowed'
              )}
            >
              Play Cards ({selectedCards.length})
            </button>
            <button
              onClick={onPickup}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Pickup Pile
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className={cn(
          'flex flex-col items-center gap-4 bg-black bg-opacity-50 rounded-lg p-4',
          className
        )}
      >
        <div className="text-white text-lg">
          {getPromptMessage()}
        </div>
        {getActionButtons()}
      </motion.div>
    </AnimatePresence>
  );
};

export default ActionPrompt;