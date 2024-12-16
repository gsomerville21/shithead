import * as React from 'react';
import { Card as CardType } from '../../types/card-types';
import { PlayerState } from '../../core/game-state';
import { cn } from '../../utils/classnames';

interface BotDebugPanelProps {
  botPlayer: PlayerState;
  lastMove?: CardType[];
  className?: string;
}

const BotDebugPanel: React.FC<BotDebugPanelProps> = ({ botPlayer, lastMove, className }) => {
  return (
    <div
      className={cn('fixed right-0 top-12 w-64 bg-black/80 text-white p-4 rounded-l-lg', className)}
    >
      <h3 className="font-bold mb-2 flex items-center gap-2">
        Bot Debug
        <span className="text-xs bg-blue-500 px-2 py-0.5 rounded">{botPlayer.id}</span>
      </h3>

      {/* Card counts */}
      <div className="space-y-1 text-sm mb-4">
        <div>Hand: {botPlayer.hand.length} cards</div>
        <div>Face Up: {botPlayer.faceUpCards.length} cards</div>
        <div>Face Down: {botPlayer.faceDownCards.length} cards</div>
      </div>

      {/* Current hand */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold mb-1">Current Hand:</h4>
        <div className="text-xs space-y-1">
          {botPlayer.hand.map((card) => (
            <div key={card.id} className="bg-gray-700/50 px-2 py-1 rounded">
              {card.rank} of {card.suit}
            </div>
          ))}
        </div>
      </div>

      {/* Face up cards */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold mb-1">Face Up Cards:</h4>
        <div className="text-xs space-y-1">
          {botPlayer.faceUpCards.map((card) => (
            <div key={card.id} className="bg-gray-700/50 px-2 py-1 rounded">
              {card.rank} of {card.suit}
            </div>
          ))}
        </div>
      </div>

      {/* Last move */}
      {lastMove && lastMove.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-1">Last Move:</h4>
          <div className="text-xs space-y-1">
            {lastMove.map((card) => (
              <div key={card.id} className="bg-green-700/50 px-2 py-1 rounded">
                {card.rank} of {card.suit}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BotDebugPanel;
