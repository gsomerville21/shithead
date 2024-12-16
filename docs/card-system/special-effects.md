# Special Card Effects Documentation

## Effect Priority System

Special effects are processed in the following priority order:
1. Reset (2s) - Highest priority as it changes base game rules
2. Transparent (8s) - Second priority as it affects value interpretation
3. Skip (Jacks) - Third priority as it affects turn order
4. Burn (Four of a kind) - Lowest priority as it occurs after other effects

## Detailed Effect Descriptions

### Reset Effect (2s)
* **Trigger**: Playing any number of 2s
* **Effect**: Sets pile value to 2
* **Next Play**: Any card 3 or higher
* **Stacking**: Multiple 2s can be played together
* **Edge Cases**:
  - Can be played on any card regardless of value
  - Cannot be countered or blocked
  - Not affected by transparent cards

### Transparent Effect (8s)
* **Trigger**: Playing any number of 8s
* **Effect**: Maintains previous card's value
* **Next Play**: Must follow previous card's value
* **Stacking**: 
  - Multiple 8s extend the transparency
  - Chain tracks back to last non-8 card
* **Edge Cases**:
  - On empty pile, acts as value 8
  - After burn, can set new value
  - Can't be transparent to a 2's reset effect

### Skip Effect (Jacks)
* **Trigger**: Playing any number of Jacks
* **Effect**: Skips next player's turn
* **Multiplier**: Each additional Jack adds another skip
* **Special Cases**:
  - In 2-player game, returns to current player
  - Multiple Jacks can skip multiple players
  - Skipped players can't respond or counter
* **Edge Cases**:
  - Must follow normal value rules unless after burn
  - Skip effect processes even if play is burned

### Burn Effect (Four of a Kind)
* **Trigger**: Completing four of same rank
* **Effect**: Removes pile from play
* **Next Play**: Any card allowed
* **Methods**:
  1. Playing all four cards at once
  2. Playing cards to complete set with pile
* **Edge Cases**:
  - Can be achieved across multiple turns
  - Special card effects still trigger before burn
  - Burned cards don't return to play

## Complex Interactions

### Multiple Effect Resolution
1. Check Reset effect first
2. Apply Transparent effect if relevant
3. Process Skip effect
4. Finally check for Burn condition

### Chain Reactions
* Example 1: Playing 2s on 8s
  - Reset takes priority
  - Transparent effect is ignored
  - Next play must be 3 or higher

* Example 2: Four Jacks
  - Skip effects accumulate
  - Burn effect processes
  - Next player is still skipped
  - Following player can play anything

### Edge Case Handling

#### Empty Pile Scenarios
* After burn:
  - Any card playable
  - Special effects still apply
  - New base value established

#### Multiple Special Cards
* Priority system ensures consistent resolution
* Effects process in order even if later effects would change game state
* All applicable effects must be valid at time of play

#### Face-Down Card Interactions
* Special effects apply normally
* Invalid plays must be picked up
* Burn effect can still trigger with pile cards

## Implementation Guidelines

### Effect Validation
1. Check for basic play validity
2. Validate special effect conditions
3. Ensure proper effect ordering
4. Handle state updates atomically

### State Management
* Track active effects
* Maintain effect history
* Handle effect cancellation
* Update game state atomically

### Error Handling
* Invalid effect combinations
* State restoration on failure
* Effect validation errors
* Player notification requirements