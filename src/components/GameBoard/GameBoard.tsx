import * as React from 'react';
import { motion } from 'framer-motion';
import Card from '../Card/Card';
import { GameState, PlayerState } from '../../types/game';
import { Card as CardType, CardLocation, Suit, Rank } from '../../types/card-types';
import { cn } from '../../utils/classnames';

export interface GameBoardProps {
  gameState: GameState;
  onCardClick?: (card: CardType) => void;
  currentPlayerId: string;
  className?: string;
}

interface PlayerAreaProps {
  player: PlayerState;
  isCurrentPlayer: boolean;
  isActivePlayer: boolean;
  onCardClick?: (card: CardType) => void;
  position: 'bottom' | 'top' | 'left' | 'right';
}

const PlayerArea = ({
  player,
  isCurrentPlayer,
  isActivePlayer,
  onCardClick,
  position,
}: PlayerAreaProps): React.ReactElement => {
  const positionClasses = {
    bottom: 'bottom-4 left-1/2 -translate-x-1/2',
    top: 'top-4 left-1/2 -translate-x-1/2',
    left: 'left-4 top-1/2 -translate-y-1/2 rotate-90',
    right: 'right-4 top-1/2 -translate-y-1/2 -rotate-90',
  };

  const cardStackOffset = 30; // Pixels to offset each card in a stack

  return (
    <div
      className={cn(
        'absolute p-6 rounded-xl transition-all duration-300',
        positionClasses[position],
        isActivePlayer && 'ring-2 ring-yellow-400 bg-black/20'
      )}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Face down cards */}
        <div className="relative h-36 min-w-[96px]">
          {player.faceDownCards.map((card, index) => (
            <div
              key={card.id}
              className="absolute transition-all duration-200"
              style={{
                left: `${index * cardStackOffset}px`,
                zIndex: index,
              }}
            >
              <Card
                card={card}
                selectable={
                  isCurrentPlayer && player.hand.length === 0 && player.faceUpCards.length === 0
                }
                onClick={onCardClick}
              />
            </div>
          ))}
        </div>

        {/* Face up cards */}
        <div className="relative h-36 min-w-[96px]">
          {player.faceUpCards.map((card, index) => (
            <div
              key={card.id}
              className="absolute transition-all duration-200"
              style={{
                left: `${index * cardStackOffset}px`,
                zIndex: index,
              }}
            >
              <Card
                card={card}
                selectable={isCurrentPlayer && player.hand.length === 0}
                onClick={onCardClick}
              />
            </div>
          ))}
        </div>

        {/* Hand cards */}
        <div className="relative h-36 min-w-[96px]">
          {player.hand.map((card, index) => (
            <div
              key={card.id}
              className="absolute transition-all duration-200"
              style={{
                left: `${index * cardStackOffset}px`,
                zIndex: index,
              }}
            >
              <Card card={card} selectable={isCurrentPlayer} onClick={onCardClick} />
            </div>
          ))}
        </div>

        {/* Player info */}
        <div
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium shadow-lg transition-colors',
            !player.connected && 'bg-red-900/50 text-red-200',
            isCurrentPlayer && 'bg-blue-900/50 text-blue-200',
            !isCurrentPlayer && player.connected && 'bg-black/50 text-white'
          )}
        >
          {player.id} {!player.connected && '(Disconnected)'}
        </div>
      </div>
    </div>
  );
};

const GameBoard = ({
  gameState,
  onCardClick,
  currentPlayerId,
  className,
}: GameBoardProps): React.ReactElement => {
  const players = Array.from(gameState.players.values());
  const playerCount = players.length;

  // Calculate positions based on player count
  const getPlayerPosition = (index: number): 'bottom' | 'top' | 'left' | 'right' => {
    if (playerCount === 2) {
      return index === 0 ? 'bottom' : 'top';
    }
    if (playerCount === 3) {
      return index === 0 ? 'bottom' : index === 1 ? 'top' : 'right';
    }
    return index === 0 ? 'bottom' : index === 1 ? 'left' : index === 2 ? 'top' : 'right';
  };

  return (
    <div className={cn('relative w-full h-full min-h-[600px] bg-green-800', className)}>
      {/* Center pile */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative w-24 h-36">
          {gameState.pile.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute"
              style={{
                zIndex: index,
                transform: `rotate(${Math.random() * 20 - 10}deg)`,
              }}
            >
              <Card card={card} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Deck */}
      {gameState.deck.length > 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -ml-40">
          <div className="relative">
            {[...Array(Math.min(3, gameState.deck.length))].map((_, index) => (
              <div
                key={index}
                className="absolute transition-transform"
                style={{
                  top: `${-index * 2}px`,
                  left: `${-index * 2}px`,
                }}
              >
                <Card
                  card={{
                    id: `deck-${index}`,
                    suit: Suit.SPADES,
                    rank: Rank.TWO,
                    location: CardLocation.DECK,
                    faceUp: false,
                    position: index,
                  }}
                />
              </div>
            ))}
          </div>
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/50 text-white text-sm font-medium shadow-lg">
            {gameState.deck.length} cards remaining
          </div>
        </div>
      )}

      {/* Player areas */}
      {players.map((player, index) => (
        <PlayerArea
          key={player.id}
          player={player}
          isCurrentPlayer={player.id === currentPlayerId}
          isActivePlayer={player.id === gameState.currentPlayer}
          onCardClick={onCardClick}
          position={getPlayerPosition(index)}
        />
      ))}

      {/* Game phase indicator */}
      <div className="absolute top-4 left-4 px-4 py-2 rounded-full bg-black/50 text-white text-sm font-medium shadow-lg">
        {gameState.phase}
      </div>
    </div>
  );
};

export default GameBoard;
