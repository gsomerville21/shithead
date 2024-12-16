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

const PLAYER_POSITIONS = {
  2: [
    { top: '5%', left: '50%', rotate: 0 },      // North
    { bottom: '5%', left: '50%', rotate: 180 }  // South
  ],
  3: [
    { top: '5%', left: '50%', rotate: 0 },      // North
    { bottom: '25%', right: '5%', rotate: 120 }, // Southeast
    { bottom: '25%', left: '5%', rotate: -120 }  // Southwest
  ],
  4: [
    { top: '5%', left: '50%', rotate: 0 },      // North
    { left: '5%', top: '50%', rotate: -90 },    // West
    { bottom: '5%', left: '50%', rotate: 180 }, // South
    { right: '5%', top: '50%', rotate: 90 }     // East
  ]
};

const PlayerArea = ({
  player,
  isCurrentPlayer,
  isActivePlayer,
  onCardClick,
  position,
  phase
}: {
  player: PlayerState;
  isCurrentPlayer: boolean;
  isActivePlayer: boolean;
  onCardClick?: (card: CardType) => void;
  position: { top?: string; bottom?: string; left?: string; right?: string; rotate: number };
  phase: string;
}) => {
  return (
    <div 
      className="absolute"
      style={{ 
        ...position,
        transform: `rotate(${position.rotate}deg)`
      }}
    >
      {/* Player name and status */}
      <div className={cn(
        'absolute left-1/2 -translate-x-1/2 px-3 py-1 rounded-full',
        isActivePlayer ? 'bg-blue-600' : 'bg-black/50',
        'text-white text-sm whitespace-nowrap z-10',
        position.rotate > 90 || position.rotate < -90 ? 'bottom-full mb-2' : 'top-full mt-2'
      )}>
        {player.id}
        {phase === 'SWAP' && isCurrentPlayer && (
          <span className="ml-2 text-xs bg-yellow-500 px-2 py-0.5 rounded-full">
            Swap
          </span>
        )}
      </div>

      {/* Cards area */}
      <div className="relative">
        {/* Face down cards */}
        <div className="absolute">
          {player.faceDownCards.map((card, i) => (
            <div 
              key={card.id}
              className="absolute"
              style={{
                left: `${i * 20}px`,
                zIndex: 1
              }}
            >
              <Card
                card={card}
                selectable={isCurrentPlayer && player.hand.length === 0 && player.faceUpCards.length === 0}
                onClick={onCardClick}
              />
            </div>
          ))}
        </div>

        {/* Face up cards */}
        <div className="absolute" style={{ top: '30px' }}>
          {player.faceUpCards.map((card, i) => (
            <div 
              key={card.id}
              className="absolute"
              style={{
                left: `${i * 20}px`,
                zIndex: 2
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
        <div className="absolute" style={{ top: '60px' }}>
          {player.hand.map((card, i) => (
            <div 
              key={card.id}
              className="absolute transition-transform hover:-translate-y-2"
              style={{
                left: `${i * 20}px`,
                zIndex: 3
              }}
            >
              <Card
                card={card}
                selectable={isCurrentPlayer}
                onClick={onCardClick}
              />
            </div>
          ))}
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
  const positions = PLAYER_POSITIONS[players.length as keyof typeof PLAYER_POSITIONS] || [];

  return (
    <div className={cn('relative w-full h-full min-h-[800px]', className)}>
      {/* Game table */}
      <div className="absolute inset-4 rounded-[35%] bg-green-800 border-8 border-[#543021] shadow-lg">
        {/* Center play area */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-16">
          {/* Deck */}
          {gameState.deck.length > 0 && (
            <div className="relative">
              {[...Array(Math.min(3, gameState.deck.length))].map((_, i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    top: `${-i * 2}px`,
                    left: `${-i * 2}px`
                  }}
                >
                  <Card
                    card={{
                      id: `deck-${i}`,
                      suit: Suit.SPADES,
                      rank: Rank.TWO,
                      location: CardLocation.DECK,
                      faceUp: false,
                      position: i,
                    }}
                  />
                </div>
              ))}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-black/50 text-white text-xs">
                {gameState.deck.length}
              </div>
            </div>
          )}

          {/* Pile */}
          <div className="relative h-36 w-24">
            {gameState.pile.map((card, i) => (
              <motion.div
                key={card.id}
                className="absolute"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  transform: `rotate(${Math.random() * 20 - 10}deg)`
                }}
              >
                <Card card={card} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Players */}
        {players.map((player, i) => (
          <PlayerArea
            key={player.id}
            player={player}
            isCurrentPlayer={player.id === currentPlayerId}
            isActivePlayer={player.id === gameState.currentPlayer}
            onCardClick={onCardClick}
            position={positions[i]}
            phase={gameState.phase}
          />
        ))}
      </div>
    </div>
  );
};

export default GameBoard;