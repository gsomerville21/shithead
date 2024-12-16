import { GameState, GameAction } from '../types/game';

export interface ServerToClientEvents {
  'game:state': (state: GameState) => void;
  'game:error': (error: string) => void;
  'player:joined': (playerId: string) => void;
  'player:left': (playerId: string) => void;
  'player:disconnected': (playerId: string) => void;
  'player:reconnected': (playerId: string) => void;
  'game:ended': (winnerId: string) => void;
}

export interface ClientToServerEvents {
  'game:action': (action: GameAction) => void;
  'game:join': (gameId: string) => void;
  'game:create': () => void;
  'game:leave': () => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  gameId?: string;
}
