import { io, Socket } from 'socket.io-client';
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

class GameSocket {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  private gameStateCallback: ((state: GameState) => void) | null = null;
  private errorCallback: ((error: string) => void) | null = null;

  constructor() {
    this.socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:3001', {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.socket.on('game:state', (state: GameState) => {
      if (this.gameStateCallback) {
        this.gameStateCallback(state);
      }
    });

    this.socket.on('game:error', (error: string) => {
      if (this.errorCallback) {
        this.errorCallback(error);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      if (this.errorCallback) {
        this.errorCallback('Connection error. Please check your internet connection.');
      }
    });
  }

  connect() {
    this.socket.connect();
  }

  disconnect() {
    this.socket.disconnect();
  }

  createGame() {
    this.socket.emit('game:create');
  }

  joinGame(gameId: string) {
    this.socket.emit('game:join', gameId);
  }

  leaveGame() {
    this.socket.emit('game:leave');
  }

  sendGameAction(action: GameAction) {
    this.socket.emit('game:action', action);
  }

  onGameState(callback: (state: GameState) => void) {
    this.gameStateCallback = callback;
  }

  onError(callback: (error: string) => void) {
    this.errorCallback = callback;
  }

  isConnected(): boolean {
    return this.socket.connected;
  }
}

export const gameSocket = new GameSocket();
