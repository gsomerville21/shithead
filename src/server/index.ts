import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import Redis from 'ioredis';
import { GameState, GameAction, GamePhase } from '../types/game';
import { processGameAction, createGameState } from '../core/game-state';
import { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData } from './types';

const app = express();
const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
  httpServer,
  {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  }
);

// Redis client for game state persistence
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Active games map for quick access
const activeGames = new Map<string, GameState>();

// Timeout map for disconnected players
const disconnectionTimeouts = new Map<string, NodeJS.Timeout>();

io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
  console.log('Client connected:', socket.id);

  socket.on('game:create', async () => {
    try {
      // Create new game state
      const gameState = createGameState([socket.id], {
        maxPlayers: 4,
        startingCards: { hand: 3, faceUp: 3, faceDown: 3 },
        timeouts: { turn: 30000, swap: 60000, reconnect: 120000 },
        rules: {
          allowMultiples: true,
          burnOnFour: true,
          transparentEights: true,
          jackSkips: true,
          twoReset: true,
        },
        hostId: socket.id,
      });

      // Store game state in Redis and memory
      await redis.set(`game:${gameState.id}`, JSON.stringify(gameState));
      activeGames.set(gameState.id, gameState);

      // Join socket room
      socket.join(`game:${gameState.id}`);
      socket.data.gameId = gameState.id;

      // Send game state to client
      socket.emit('game:state', gameState);
    } catch (error) {
      console.error('Error creating game:', error);
      socket.emit('game:error', 'Failed to create game');
    }
  });

  socket.on('game:join', async (gameId: string) => {
    try {
      const gameState = activeGames.get(gameId);

      if (!gameState) {
        // Try to load from Redis
        const savedState = await redis.get(`game:${gameId}`);
        if (!savedState) {
          throw new Error('Game not found');
        }
        const loadedState = JSON.parse(savedState) as GameState;
        activeGames.set(gameId, loadedState);
        return handleJoinGame(socket, loadedState);
      }

      await handleJoinGame(socket, gameState);
    } catch (error) {
      console.error('Error joining game:', error);
      socket.emit('game:error', error instanceof Error ? error.message : 'Failed to join game');
    }
  });

  socket.on('game:action', async (action: GameAction) => {
    try {
      const gameId = socket.data.gameId;
      if (!gameId) {
        throw new Error('Not in a game');
      }

      const gameState = activeGames.get(gameId);
      if (!gameState) {
        throw new Error('Game not found');
      }

      // Process action
      const newState = processGameAction(gameState, {
        ...action,
        playerId: socket.id, // Ensure the action comes from the correct player
      });

      // Update game state
      await redis.set(`game:${gameState.id}`, JSON.stringify(newState));
      activeGames.set(gameState.id, newState);

      // Broadcast new state
      io.to(`game:${gameState.id}`).emit('game:state', newState);

      // Check for game end
      if (newState.winner) {
        io.to(`game:${gameState.id}`).emit('game:ended', newState.winner);
      }
    } catch (error) {
      console.error('Error processing game action:', error);
      socket.emit(
        'game:error',
        error instanceof Error ? error.message : 'Failed to process action'
      );
    }
  });

  socket.on('disconnect', async () => {
    try {
      const gameId = socket.data.gameId;
      if (!gameId) return;

      const gameState = activeGames.get(gameId);
      if (!gameState) return;

      const player = gameState.players.get(socket.id);
      if (!player) return;

      // Mark player as disconnected
      player.connected = false;
      gameState.players.set(socket.id, player);

      // Update game state
      await redis.set(`game:${gameId}`, JSON.stringify(gameState));
      activeGames.set(gameId, gameState);

      // Notify other players
      io.to(gameId).emit('player:disconnected', socket.id);

      // Set reconnection timeout
      const timeout = setTimeout(async () => {
        const currentState = activeGames.get(gameId);
        if (currentState?.players.get(socket.id)?.connected === false) {
          currentState.players.delete(socket.id);
          await redis.set(`game:${gameId}`, JSON.stringify(currentState));
          activeGames.set(gameId, currentState);
          io.to(gameId).emit('player:left', socket.id);
        }
      }, gameState.config.timeouts.reconnect);

      disconnectionTimeouts.set(socket.id, timeout);
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });
});

async function handleJoinGame(
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  gameState: GameState
): Promise<void> {
  if (gameState.players.size >= gameState.config.maxPlayers) {
    throw new Error('Game is full');
  }

  if (gameState.phase !== GamePhase.SETUP) {
    throw new Error('Game already started');
  }

  // Add player to game
  const player = {
    id: socket.id,
    hand: [],
    faceUpCards: [],
    faceDownCards: [],
    connected: true,
    ready: false,
    timeoutWarnings: 0,
  };

  gameState.players.set(socket.id, player);

  // Update game state
  await redis.set(`game:${gameState.id}`, JSON.stringify(gameState));
  activeGames.set(gameState.id, gameState);

  // Join socket room
  socket.join(`game:${gameState.id}`);
  socket.data.gameId = gameState.id;

  // Notify all players
  io.to(`game:${gameState.id}`).emit('game:state', gameState);
  io.to(`game:${gameState.id}`).emit('player:joined', socket.id);
}

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
