import React from 'react';
import { motion } from 'framer-motion';
import Card from '../Card';
import { GameState, PlayerState } from '../../types/game';
import { Card as CardType, CardLocation } from '../../types/card-types';
import { cn } from '../../utils/classnames';

export interface GameBoardProps {
  gameState: GameState;
  onCardClick?: (card: CardType) => void;
  currentPlayerId: string;
  className?: string;
}

const PlayerArea: React.FC<{
  player: PlayerState;
  isCurrentPlayer: boolean;
  isActivePlayer: boolean;
  onCardClick?: (card: CardType) => void;
  position: 'bottom' | 'top' | 'left' | 'right';
}> = ({ player, isCurrentPlayer, isActivePlayer, onCardClick, position }) => {
  const positionClasses = {
    bottom: 'bottom-0 left-1/2 -translate-x-1/2',
    top: 'top-0 left-1/2 -translate-x-1/2',
    left: 'left-0 top-1/2 -translate-y-1/2 rotate-90',
    right: 'right-0 top-1/2 -translate-y-1/2 -rotate-90'
  };

  return (
    <div className={cn(
      'absolute p-4',
      positionClasses[position],
      isActivePlayer && 'ring-2 ring-yellow-400 rounded-lg'
    )}>
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-2 relative">
          {player.faceDownCards.map((card, index) => (
            <Card
              key={card.id}
              card={card}
              selectable={isCurrentPlayer && player.hand.length === 0 && player.faceUpCards.length === 0}
              onClick={onCardClick}
              style={{ position: 'relative', left: `${index * 20}px` }}
            />
          ))}
        </div>
        <div className="flex gap-2 relative">
          {player.faceUpCards.map((card, index) => (
            <Card
              key={card.id}
              card={card}
              selectable={isCurrentPlayer && player.hand.length === 0}
              onClick={onCardClick}
              style={{ position: 'relative', left: `${index * 20}px` }}
            />
          ))}
        </div>
        <div className="flex gap-2 relative">
          {player.hand.map((card, index) => (
            <Card
              key={card.id}
              card={card}
              selectable={isCurrentPlayer}
              onClick={onCardClick}
              style={{ position: 'relative', left: `${index * 20}px` }}
            />
          ))}
        </div>
        <div className={cn(
          'text-sm font-medium',
          !player.connected && 'text-red-500',
          isCurrentPlayer && 'text-blue-500'
        )}>
          {player.id} {!player.connected && '(Disconnected)'}
        </div>
      </div>
    </div>
  );
};

const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  onCardClick,
  currentPlayerId,
  className
}) => {
  const players = Array.from(gameState.players.values());
  const playerCount = players.length;
  
  // Calculate positions based on player count
  const getPlayerPosition = (index: number): 'bottom' | 'top' | 'left' | 'right' => {
    if (playerCount === 2) {
      return index === 0 ? 'bottom' : 'top';
    }
    if (playerCount === 3) {
      return index === 0 ? 'bottom' : (index === 1 ? 'top' : 'right');
    }
    return index === 0 ? 'bottom' : (index === 1 ? 'left' : (index === 2 ? 'top' : 'right'));
  };

  return (
    <div className={cn('relative w-full h-full min-h-[600px] bg-green-800', className)}>
      {/* Center pile */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          {gameState.pile.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute"
              style={{
                zIndex: index,
                transform: `rotate(${Math.random() * 20 - 10}deg)`
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
                className="absolute"
                style={{
                  top: `${-index * 2}px`,
                  left: `${-index * 2}px`
                }}
              >
                <Card
                  card={{
                    id: `deck-${index}`,
                    suit: 'S',
                    rank: '2',
                    location: CardLocation.DECK,
                    faceUp: false,
                    position: index
                  }}
                />
              </div>
            ))}
          </div>
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-white text-sm">
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
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
        {gameState.phase}
      </div>
    </div>
  );
};

export default GameBoard;