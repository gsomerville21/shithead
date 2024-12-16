import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/classnames';
import { GameState, GamePhase, SpecialEffectType, SpecialEffect } from '../../types/game';
import { Card as CardType, CardLocation } from '../../types/card-types';
import TurnIndicator from './TurnIndicator';
import ActionPrompt from './ActionPrompt';

export interface GameFlowProps {
  gameState: GameState;
  currentPlayerId: string;
  selectedCards: CardType[];
  onPlay: () => void;
  onPickup: () => void;
  onSwapConfirm?: () => void;
  onReadyConfirm?: () => void;
  className?: string;
}

const effectTextMap: Record<SpecialEffectType, string> = {
  [SpecialEffectType.BURN]: '🔥 Burn!',
  [SpecialEffectType.SKIP]: '⏭️ Skip!',
  [SpecialEffectType.RESET]: '🔄 Reset!',
  [SpecialEffectType.TRANSPARENT]: '👻 Transparent!',
};

const GameFlow = ({
  gameState,
  currentPlayerId,
  selectedCards,
  onPlay,
  onPickup,
  onSwapConfirm,
  onReadyConfirm,
  className,
}: GameFlowProps): React.ReactElement => {
  const [timeLeft, setTimeLeft] = React.useState<number>(gameState.config.timeouts.turn);
  const isYourTurn = gameState.currentPlayer === currentPlayerId;
  const currentPlayer = gameState.players.get(currentPlayerId);

  // Timer management
  React.useEffect(() => {
    if (gameState.phase !== GamePhase.PLAY) return;

    const interval = setInterval(() => {
      setTimeLeft((prev: number) => Math.max(0, prev - 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.phase]);

  // Reset timer on turn change
  React.useEffect(() => {
    if (gameState.phase === GamePhase.PLAY) {
      setTimeLeft(gameState.config.timeouts.turn);
    } else if (gameState.phase === GamePhase.SWAP) {
      setTimeLeft(gameState.config.timeouts.swap);
    }
  }, [gameState.currentPlayer, gameState.phase, gameState.config.timeouts]);

  const canPlay = React.useMemo(() => {
    if (!currentPlayer || !isYourTurn) return false;

    // In swap phase, need exactly one hand card and one face-up card
    if (gameState.phase === GamePhase.SWAP) {
      const handCardSelected = selectedCards.some((card: CardType) =>
        currentPlayer.hand.some((h: CardType) => h.id === card.id)
      );
      const faceUpCardSelected = selectedCards.some((card: CardType) =>
        currentPlayer.faceUpCards.some((f: CardType) => f.id === card.id)
      );
      return selectedCards.length === 2 && handCardSelected && faceUpCardSelected;
    }

    // In play phase
    if (gameState.phase === GamePhase.PLAY) {
      // Must have selected cards
      if (selectedCards.length === 0) return false;

      // All selected cards must be from the same location
      const locations = new Set(selectedCards.map((card: CardType) => card.location));
      if (locations.size !== 1) return false;

      // If hand has cards, must play from hand
      if (currentPlayer.hand.length > 0) {
        return selectedCards.every((card: CardType) => card.location === CardLocation.HAND);
      }

      // If face-up cards remain, must play from face-up
      if (currentPlayer.faceUpCards.length > 0) {
        return selectedCards.every((card: CardType) => card.location === CardLocation.FACE_UP);
      }

      // Can only play face-down cards one at a time
      if (currentPlayer.faceDownCards.length > 0) {
        return selectedCards.length === 1 && selectedCards[0].location === CardLocation.FACE_DOWN;
      }
    }

    return false;
  }, [currentPlayer, selectedCards, gameState.phase, isYourTurn]);

  const getPhaseText = (): string => {
    switch (gameState.phase) {
      case GamePhase.SETUP:
        return 'Game Setup';
      case GamePhase.SWAP:
        return 'Swap Cards';
      case GamePhase.PLAY:
        return isYourTurn ? 'Your Turn' : `${gameState.currentPlayer}'s Turn`;
      case GamePhase.ROUND_END:
        return `Round Over - ${gameState.winner} Wins!`;
      case GamePhase.GAME_END:
        return 'Game Over';
      default:
        return gameState.phase;
    }
  };

  const getActionPrompt = (): string => {
    if (!isYourTurn && gameState.phase !== GamePhase.SWAP) {
      return 'Wait for your turn';
    }

    switch (gameState.phase) {
      case GamePhase.SWAP:
        if (!currentPlayer?.ready) {
          return selectedCards.length === 2
            ? 'Confirm swap'
            : 'Select a hand card and a face-up card to swap';
        }
        return 'Waiting for other players';

      case GamePhase.PLAY:
        if (currentPlayer?.hand.length === 0 && currentPlayer?.faceUpCards.length === 0) {
          return 'Select a face-down card';
        }
        return selectedCards.length > 0
          ? 'Play selected cards or pick up pile'
          : 'Select cards to play or pick up pile';

      default:
        return '';
    }
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Game phase indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg text-center"
      >
        {getPhaseText()}
      </motion.div>

      {/* Turn timer */}
      {(gameState.phase === GamePhase.PLAY || gameState.phase === GamePhase.SWAP) && (
        <TurnIndicator
          currentPlayer={gameState.currentPlayer}
          timeLeft={timeLeft}
          maxTime={
            gameState.phase === GamePhase.PLAY
              ? gameState.config.timeouts.turn
              : gameState.config.timeouts.swap
          }
          isYourTurn={isYourTurn}
        />
      )}

      {/* Action prompt */}
      <ActionPrompt
        phase={gameState.phase}
        prompt={getActionPrompt()}
        selectedCards={selectedCards}
        isYourTurn={isYourTurn}
        canPlay={canPlay}
        onPlay={onPlay}
        onPickup={onPickup}
        onSwapConfirm={onSwapConfirm}
        onReadyConfirm={onReadyConfirm}
      />

      {/* Special effects */}
      <AnimatePresence>
        {gameState.specialEffects.map((effect: SpecialEffect) => {
          const effectText = effectTextMap[effect.type];

          return (
            <motion.div
              key={`${effect.type}-${effect.timestamp}`}
              initial={{ scale: 0.5, opacity: 0, y: 0 }}
              animate={{ scale: 1, opacity: 1, y: -50 }}
              exit={{ scale: 1.5, opacity: 0, y: -100 }}
              transition={{ duration: 0.5 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl text-yellow-400 whitespace-nowrap"
            >
              {effectText}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default GameFlow;
