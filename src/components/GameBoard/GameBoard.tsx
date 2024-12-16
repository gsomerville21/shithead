import * as React from 'react';
import { motion } from 'framer-motion';
import Card from '../Card/Card';
import BotDebugPanel from '../BotDebugPanel/BotDebugPanel';
import { GameState, PlayerState } from '../../types/game';
import { Card as CardType, CardLocation, Suit, Rank } from '../../types/card-types';
import { cn } from '../../utils/classnames';
import { BotService } from '../../services/botService';
import { GameService } from '../../services/gameService';

export interface GameBoardProps {
  gameState: GameState;
  onCardClick?: (card: CardType) => void;
  currentPlayerId: string;
  className?: string;
  onPlayCards: (cards: CardType[]) => void;
  onPickupPile: () => void;
}

type Position = {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  rotate: number;
};

const PLAYER_POSITIONS: Record<number, Position[]> = {
  2: [
    { top: '8%', left: '50%', rotate: 0 }, // North
    { bottom: '2%', left: '50%', rotate: 180 }, // South (current player)
  ],
  3: [
    { top: '8%', left: '50%', rotate: 0 }, // North
    { bottom: '25%', right: '8%', rotate: 120 }, // Southeast
    { bottom: '25%', left: '8%', rotate: -120 }, // Southwest
  ],
  4: [
    { top: '8%', left: '50%', rotate: 0 }, // North
    { left: '8%', top: '50%', rotate: -90 }, // West
    { bottom: '2%', left: '50%', rotate: 180 }, // South (current player)
    { right: '8%', top: '50%', rotate: 90 }, // East
  ],
};

const PlayerArea = ({
  player,
  isCurrentPlayer,
  isActivePlayer,
  onCardClick,
  position,
}: {
  player: PlayerState;
  isCurrentPlayer: boolean;
  isActivePlayer: boolean;
  onCardClick?: (card: CardType) => void;
  position: Position;
}) => {
  const { rotate, ...positionStyles } = position;

  return (
    <div
      className="absolute"
      style={{
        ...positionStyles,
        transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
      }}
    >
      {/* Player name badge */}
      <div
        className={cn(
          'absolute left-1/2 -translate-x-1/2 px-3 py-1 rounded-full flex items-center gap-2 text-white text-sm whitespace-nowrap',
          {
            'bg-blue-600/80': isActivePlayer,
            'bg-black/50': !isActivePlayer,
            'bottom-full mb-2': rotate > 90 || rotate < -90,
            'top-full mt-2': !(rotate > 90 || rotate < -90),
          }
        )}
      >
        {player.id}
        {player.isBot && (
          <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-gray-700 text-gray-100 rounded">
            BOT
          </span>
        )}
        {isActivePlayer && <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />}
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
                left: `${i * 25}px`,
                zIndex: 1,
                transform: `rotate(${-position.rotate}deg)`,
              }}
            >
              <Card
                card={{ ...card, faceUp: false }}
                selectable={
                  isCurrentPlayer && player.hand.length === 0 && player.faceUpCards.length === 0
                }
                onClick={onCardClick}
              />
            </div>
          ))}
        </div>

        {/* Face up cards */}
        <div className="absolute" style={{ top: '35px' }}>
          {player.faceUpCards.map((card, i) => (
            <div
              key={card.id}
              className="absolute"
              style={{
                left: `${i * 25}px`,
                zIndex: 2,
                transform: `rotate(${-position.rotate}deg)`,
              }}
            >
              <Card
                card={{ ...card, faceUp: true }}
                selectable={isCurrentPlayer && player.hand.length === 0}
                onClick={onCardClick}
              />
            </div>
          ))}
        </div>

        {/* Hand cards */}
        <div className="absolute" style={{ top: '70px' }}>
          {player.hand.map((card, i) => (
            <div
              key={card.id}
              className="absolute transition-transform hover:-translate-y-2"
              style={{
                left: `${i * 25}px`,
                zIndex: 3,
                transform: `rotate(${-position.rotate}deg)`,
              }}
            >
              <Card
                card={{ ...card, faceUp: isCurrentPlayer }}
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
  onPlayCards,
  onPickupPile,
  className,
}: GameBoardProps): React.ReactElement => {
  const players = Array.from(gameState.players.values());
  const positions = PLAYER_POSITIONS[players.length] || [];
  const [lastBotMove, setLastBotMove] = React.useState<CardType[]>([]);

  // Initialize services
  const gameService = React.useMemo(
    () => new GameService(gameState.id, players.length),
    [gameState.id, players.length]
  );
  const botService = React.useMemo(() => new BotService(gameService), [gameService]);

  // Get current bot player if it's their turn
  const currentBotPlayer = React.useMemo(() => {
    const player = gameState.players.get(gameState.currentPlayer);
    return player?.isBot ? player : null;
  }, [gameState.currentPlayer, gameState.players]);

  // Get first bot player for debug panel
  const firstBotPlayer = React.useMemo(() => {
    return players.find((player) => player.isBot);
  }, [players]);

  // Handle bot moves
  React.useEffect(() => {
    if (!currentBotPlayer) return;

    // Add a small delay to make bot moves visible
    const timeout = setTimeout(() => {
      const botMove = botService.determineBotMove(gameState, currentBotPlayer.id);
      if (botMove.length > 0) {
        setLastBotMove(botMove);
        onPlayCards(botMove);
      } else {
        onPickupPile();
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [currentBotPlayer, gameState, botService, onPlayCards, onPickupPile]);

  // Reorder players to ensure current player is at the bottom position
  const orderedPlayers = React.useMemo(() => {
    const currentPlayerIndex = players.findIndex((p) => p.id === currentPlayerId);
    if (currentPlayerIndex === -1) return players;
    return [...players.slice(currentPlayerIndex + 1), ...players.slice(0, currentPlayerIndex + 1)];
  }, [players, currentPlayerId]);

  return (
    <div className={cn('relative w-full h-[calc(100vh-96px)] mt-12 mb-20', className)}>
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
                    left: `${-i * 2}px`,
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
                key={`${card.id}-${i}`}
                className="absolute"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  transform: `rotate(${Math.random() * 20 - 10}deg)`,
                }}
              >
                <Card card={card} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Players */}
        {orderedPlayers.map((player, i) => (
          <PlayerArea
            key={player.id}
            player={player}
            isCurrentPlayer={player.id === currentPlayerId}
            isActivePlayer={player.id === gameState.currentPlayer}
            onCardClick={onCardClick}
            position={positions[i]}
          />
        ))}
      </div>

      {/* Bot Debug Panel - Always show if there's at least one bot */}
      {firstBotPlayer && <BotDebugPanel botPlayer={firstBotPlayer} lastMove={lastBotMove} />}
    </div>
  );
};

export default GameBoard;
