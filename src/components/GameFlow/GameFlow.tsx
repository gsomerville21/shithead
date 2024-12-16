import * as React from 'react';
import { GameState, GamePhase, SpecialEffectType, SpecialEffect } from '../../types/game';
import { Card as CardType, CardLocation } from '../../types/card-types';

export interface GameFlowProps {
  gameState: GameState;
  currentPlayerId: string;
  selectedCards: CardType[];
  onPlay: () => void;
  onPickup: () => void;
  onSwapConfirm?: () => void;
  onReadyConfirm?: () => void;
}

const GameFlow = ({
  gameState,
  currentPlayerId,
  selectedCards,
  onPlay,
  onPickup,
  onSwapConfirm,
  onReadyConfirm,
}: GameFlowProps): React.ReactElement => {
  const isYourTurn = gameState.currentPlayer === currentPlayerId;
  const currentPlayer = gameState.players.get(currentPlayerId);
  const activePlayer = gameState.players.get(gameState.currentPlayer);
  const [timeLeft, setTimeLeft] = React.useState<number>(gameState.config.timeouts.turn);

  // Timer management - only for human players
  React.useEffect(() => {
    if (!isYourTurn || gameState.phase !== GamePhase.PLAY || activePlayer?.isBot) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isYourTurn, gameState.phase, activePlayer]);

  // Reset timer on turn change
  React.useEffect(() => {
    setTimeLeft(gameState.config.timeouts.turn);
  }, [gameState.currentPlayer]);

  const canPlay = React.useMemo(() => {
    if (!currentPlayer || !isYourTurn || activePlayer?.isBot) return false;

    if (gameState.phase === GamePhase.SWAP) {
      const handCardSelected = selectedCards.some((card) =>
        currentPlayer.hand.some((h) => h.id === card.id)
      );
      const faceUpCardSelected = selectedCards.some((card) =>
        currentPlayer.faceUpCards.some((f) => f.id === card.id)
      );
      return selectedCards.length === 2 && handCardSelected && faceUpCardSelected;
    }

    if (gameState.phase === GamePhase.PLAY) {
      if (selectedCards.length === 0) return false;

      const locations = new Set(selectedCards.map((card) => card.location));
      if (locations.size !== 1) return false;

      if (currentPlayer.hand.length > 0) {
        return selectedCards.every((card) => card.location === CardLocation.HAND);
      }

      if (currentPlayer.faceUpCards.length > 0) {
        return selectedCards.every((card) => card.location === CardLocation.FACE_UP);
      }

      if (currentPlayer.faceDownCards.length > 0) {
        return selectedCards.length === 1 && selectedCards[0].location === CardLocation.FACE_DOWN;
      }
    }

    return false;
  }, [currentPlayer, selectedCards, gameState.phase, isYourTurn, activePlayer]);

  const formatTime = (ms: number): string => {
    const seconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getCurrentTurnText = () => {
    if (isYourTurn) return 'Your Turn';
    const player = gameState.players.get(gameState.currentPlayer);
    if (player?.isBot) return `Bot's Turn (${gameState.currentPlayer})`;
    return `${gameState.currentPlayer}'s Turn`;
  };

  return (
    <>
      {/* Game Status Bar */}
      <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-4 py-2 bg-black/80 text-white">
        <div className="flex items-center gap-4">
          {/* Phase */}
          <div className="text-sm">Phase: {gameState.phase}</div>

          {/* Current Turn */}
          <div className="text-sm flex items-center gap-2">
            {getCurrentTurnText()}
            {activePlayer?.isBot && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-gray-700 text-gray-100 rounded animate-pulse">
                Thinking...
              </span>
            )}
          </div>

          {/* Timer - only show during PLAY phase and human turns */}
          {gameState.phase === GamePhase.PLAY && !activePlayer?.isBot && (
            <div className="text-sm">Time: {formatTime(timeLeft)}</div>
          )}
        </div>

        {/* Ready Status - only during SWAP */}
        {gameState.phase === GamePhase.SWAP && (
          <div className="text-sm">
            Players Ready: {Array.from(gameState.players.values()).filter((p) => p.ready).length}/
            {gameState.players.size}
          </div>
        )}
      </div>

      {/* Player Controls - Only show for human players */}
      {!activePlayer?.isBot && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/80 text-white">
          {/* Selected Cards Info */}
          {selectedCards.length > 0 && (
            <div className="text-center py-1 text-sm">
              Selected: {selectedCards.length} card{selectedCards.length !== 1 ? 's' : ''}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 p-2">
            {gameState.phase === GamePhase.SWAP ? (
              <>
                {!currentPlayer?.ready && selectedCards.length === 2 && onSwapConfirm && (
                  <button
                    onClick={onSwapConfirm}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Confirm Swap
                  </button>
                )}
                {onReadyConfirm && !currentPlayer?.ready && (
                  <button
                    onClick={onReadyConfirm}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Ready to Play
                  </button>
                )}
              </>
            ) : (
              gameState.phase === GamePhase.PLAY &&
              isYourTurn && (
                <>
                  <button
                    onClick={onPlay}
                    disabled={!canPlay || selectedCards.length === 0}
                    className={
                      canPlay && selectedCards.length > 0
                        ? 'px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors'
                        : 'px-4 py-2 bg-gray-600 text-gray-300 rounded cursor-not-allowed'
                    }
                  >
                    Play Selected
                  </button>
                  <button
                    onClick={onPickup}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Pick Up Pile
                  </button>
                </>
              )
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default GameFlow;
