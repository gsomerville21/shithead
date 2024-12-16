# Game Flow Documentation

## State Machine Overview

The game flow is managed by a state machine with the following primary states:

1. SETUP
2. SWAP
3. PLAY
4. TURN_END
5. ROUND_END
6. GAME_END

### State Descriptions

#### SETUP State
- Initial game state
- Deck is shuffled
- Cards are dealt:
  * 3 face-down cards per player
  * 3 face-up cards per player
  * 3 hand cards per player
- Players cannot view face-down cards
- Transitions to SWAP when all cards are dealt

#### SWAP State
- Players can swap hand cards with face-up cards
- No time limit for swaps
- Players must confirm ready to proceed
- All players must confirm ready to transition to PLAY
- No card viewing or swapping after confirmation

#### PLAY State
Sub-states:
1. WAITING_FOR_PLAY
   - Current player must act within timeout
   - Valid actions: play cards or pick up pile
   
2. PROCESSING_PLAY
   - Validates played cards
   - Checks special effects
   - Updates game state
   
3. PROCESSING_EFFECTS
   - Applies special card effects
   - Updates player order if needed
   - Handles pile burns
   
4. PICKING_UP_PILE
   - Adds pile to player's hand
   - Resets pile state
   - Ends current turn
   
5. PLAYING_FACE_DOWN
   - Player must play face-down card
   - No viewing before play
   - Invalid plays result in pickup

#### TURN_END State
- Processes turn completion
- Deals new cards if deck available
- Checks win conditions
- Determines next player
- Handles disconnections
- Transitions back to PLAY or to ROUND_END

#### ROUND_END State
- Calculates round results
- Updates player scores
- Resets game state for next round
- Transitions to SETUP or GAME_END

#### GAME_END State
- Final state
- Calculates final scores
- Determines winner
- No further transitions

## State Transitions

### Legal Transitions

1. SETUP → SWAP
   - Trigger: All cards dealt
   - Requirements: None
   - Actions: Enable card swapping

2. SWAP → PLAY
   - Trigger: All players ready
   - Requirements: All players confirmed
   - Actions: Lock card positions

3. PLAY → TURN_END
   - Trigger: Valid play completed
   - Requirements: Play validated
   - Actions: Process turn effects

4. TURN_END → PLAY
   - Trigger: Turn processing complete
   - Requirements: Game not ended
   - Actions: Setup next turn

5. TURN_END → ROUND_END
   - Trigger: Win condition met
   - Requirements: Player cleared all cards
   - Actions: Process round end

6. ROUND_END → SETUP
   - Trigger: New round starting
   - Requirements: Game not ended
   - Actions: Reset for new round

7. ROUND_END → GAME_END
   - Trigger: Game complete
   - Requirements: Final round finished
   - Actions: Process game end

### Error Handling

1. Timeout Handling
   - Auto-pickup pile on timeout
   - Increment warning counter
   - Bot substitution if needed

2. Disconnection Handling
   - Pause game if in SWAP
   - Auto-pickup if in PLAY
   - Bot substitution after timeout

3. Invalid Action Handling
   - Reject illegal state transitions
   - Revert partial state changes
   - Notify affected players

## Event System

### Event Types

1. Game Flow Events
   - GAME_STARTED
   - PLAYER_TURN
   - ROUND_COMPLETE
   - GAME_COMPLETE

2. Action Events
   - CARDS_PLAYED
   - SPECIAL_EFFECT
   - PILE_PICKED_UP

3. Error Events
   - PLAYER_TIMEOUT
   - INVALID_PLAY
   - DISCONNECTION

### Event Handling

1. Event Generation
   - Created on state transitions
   - Include relevant state data
   - Timestamp all events

2. Event Distribution
   - Sent to all active players
   - Filtered based on visibility
   - Queued for disconnected players

3. Event Processing
   - Update client states
   - Trigger animations
   - Update UI elements

## State Validation

### Action Validation
1. Check current state allows action
2. Verify player turn
3. Validate action data
4. Check game rules
5. Verify timing constraints

### State Consistency
1. Validate card locations
2. Check player order
3. Verify pile state
4. Ensure hand sizes
5. Check special effects

### Recovery Procedures
1. State rollback capability
2. Event replay mechanism
3. Consistency check points
4. Auto-correction rules
5. Manual intervention protocol