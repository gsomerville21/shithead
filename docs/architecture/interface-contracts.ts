/**
 * Interface Contracts for Shithead Card Game
 * Defines all system boundaries and communication protocols
 */

/**
 * Game Engine Interfaces
 */
export interface IGameEngine {
  // Game state management
  initializeGame(config: GameConfig): Promise<GameState>;
  processAction(action: GameAction): Promise<ActionResult>;
  validateAction(action: GameAction): ValidationResult;
  getGameState(gameId: string): Promise<GameState>;

  // Event handling
  subscribeToEvents(handler: EventHandler): Subscription;
  unsubscribeFromEvents(subscription: Subscription): void;

  // State recovery
  createSnapshot(): Promise<GameSnapshot>;
  restoreFromSnapshot(snapshot: GameSnapshot): Promise<boolean>;
}

/**
 * Network Layer Interfaces
 */
export interface INetworkManager {
  // Connection management
  connect(config: ConnectionConfig): Promise<Connection>;
  disconnect(): Promise<void>;
  getConnectionState(): ConnectionState;

  // Message handling
  sendMessage(message: GameMessage): Promise<void>;
  receiveMessage(): Promise<GameMessage>;
  
  // State synchronization
  syncState(state: GameState): Promise<void>;
  requestSync(): Promise<GameState>;
}

/**
 * Storage Layer Interfaces 
 */
export interface IStorageManager {
  // State persistence
  saveGameState(state: GameState): Promise<void>;
  loadGameState(gameId: string): Promise<GameState>;
  
  // History management
  saveAction(action: GameAction): Promise<void>;
  getActionHistory(gameId: string): Promise<GameAction[]>;
  
  // Cleanup
  pruneHistory(before: Date): Promise<void>;
  cleanup(): Promise<void>;
}

/**
 * UI Layer Interfaces
 */
export interface IUIManager {
  // Rendering
  renderGameState(state: GameState): void;
  updateDisplay(patch: StatePatch): void;
  
  // User interaction
  handleUserInput(input: UserInput): Promise<void>;
  showFeedback(feedback: UserFeedback): void;
  
  // Animation
  queueAnimation(animation: Animation): void;
  cancelAnimation(animationId: string): void;
}

/**
 * Player Action Contracts
 */
export interface IPlayerAction {
  // Validation
  canExecute(gameState: GameState): boolean;
  getRequirements(): ActionRequirements;
  
  // Execution
  execute(context: ActionContext): Promise<ActionResult>;
  rollback(context: ActionContext): Promise<void>;
}

/**
 * Game Rules Interface
 */
export interface IGameRules {
  // Rule checking
  validateMove(move: GameMove, state: GameState): ValidationResult;
  checkWinCondition(state: GameState): boolean;
  
  // Special cases
  handleSpecialCard(card: Card, state: GameState): GameState;
  resolveConflict(conflict: RuleConflict): Resolution;
}

/**
 * Event System Contracts
 */
export interface IEventSystem {
  // Event management
  emit(event: GameEvent): void;
  on(eventType: string, handler: EventHandler): Subscription;
  off(subscription: Subscription): void;
  
  // Event processing
  processEvent(event: GameEvent): Promise<void>;
  filterEvents(filter: EventFilter): GameEvent[];
}

/**
 * State Management Contracts
 */
export interface IStateManager {
  // State operations
  getState(): GameState;
  updateState(patch: StatePatch): void;
  resetState(): void;
  
  // History
  pushState(state: GameState): void;
  popState(): GameState | null;
  getHistory(): GameState[];
}

/**
 * Error Handling Contracts
 */
export interface IErrorHandler {
  // Error processing
  handleError(error: GameError): ErrorResolution;
  logError(error: GameError): void;
  
  // Recovery
  attemptRecovery(error: GameError): Promise<boolean>;
  getErrorState(): ErrorState;
}

/**
 * Analytics Interface
 */
export interface IAnalytics {
  // Tracking
  trackEvent(event: AnalyticsEvent): void;
  trackMetric(metric: MetricData): void;
  
  // Reporting
  generateReport(criteria: ReportCriteria): Report;
  exportData(format: ExportFormat): ExportedData;
}

/**
 * Testing Interface
 */
export interface ITestHarness {
  // Test setup
  setupTestEnvironment(config: TestConfig): Promise<void>;
  teardownTestEnvironment(): Promise<void>;
  
  // Test execution
  runTest(test: TestCase): Promise<TestResult>;
  verifyState(expectedState: GameState): boolean;
}

/**
 * Configuration Interface
 */
export interface IConfigManager {
  // Config management
  loadConfig(path: string): Promise<GameConfig>;
  saveConfig(config: GameConfig): Promise<void>;
  validateConfig(config: GameConfig): ValidationResult;
  
  // Dynamic config
  updateConfig(patch: ConfigPatch): Promise<void>;
  watchConfig(handler: ConfigHandler): Subscription;
}

/**
 * Authorization Interface
 */
export interface IAuthManager {
  // Auth operations
  checkPermission(action: GameAction): boolean;
  validateUser(userId: string): Promise<boolean>;
  
  // Session management
  createSession(user: User): Session;
  validateSession(session: Session): boolean;
}

/**
 * Performance Monitoring Interface
 */
export interface IPerformanceMonitor {
  // Monitoring
  startTracking(metric: string): void;
  stopTracking(metric: string): MetricResult;
  
  // Analysis
  analyzePerformance(): PerformanceReport;
  optimizationSuggestions(): Suggestions;
}

/**
 * Type Guards
 */
export function isValidGameState(state: any): state is GameState {
  // Implementation
}

export function isValidGameAction(action: any): action is GameAction {
  // Implementation
}

export function isValidGameEvent(event: any): event is GameEvent {
  // Implementation
}

/**
 * Utility Types
 */
export type Subscription = {
  id: string;
  unsubscribe: () => void;
};

export type ValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

export type ActionResult = {
  success: boolean;
  newState: GameState;
  events: GameEvent[];
  error?: GameError;
};