# Card System Validation Rules

## Basic Card Play Rules

1. Card Value Hierarchy
   - Cards must be played with equal or higher value than the current top card
   - Exception: 2s can be played on any card
   - Exception: 8s adopt the value of the card they're played on

2. Multiple Card Rules
   - Multiple cards of the same rank can be played together
   - When playing multiple cards, all must be of the same rank
   - Playing four of a kind burns the pile

3. Location-Based Rules
   - Cards in hand must be played before face-up cards
   - Face-up cards must be played before face-down cards
   - Face-down cards are played blind (without seeing them first)

## Special Card Effects

### Two (2)
- Can be played on any card regardless of value
- Resets the pile value to 2
- Next player only needs to play 3 or higher

### Eight (8)
- Acts as a transparent card
- Takes on the value of the card it was played on
- Next player must play based on the previous card's value

### Jack (J)
- Regular value of 11
- Skips the next player's turn
- In 2-player games, the current player goes again

### Four of a Kind
- Playing four cards of the same rank burns the pile
- After a burn, the current player can play any card
- Burned cards are removed from play for the round

## Move Validation Process

1. Pre-Move Validation
   - Check if it's the player's turn
   - Verify cards are in the correct location
   - Ensure cards belong to the player
   - Confirm cards can be legally played together

2. Value Validation
   - Compare card value(s) with top card
   - Apply special card rules if applicable
   - Check for four-of-a-kind combinations

3. Location Validation
   - Verify play order (hand → face-up → face-down)
   - Handle blind play of face-down cards
   - Manage pile pickup when no valid play exists

## Error Cases

1. Invalid Move Types
   - Playing cards out of sequence
   - Playing cards from wrong location
   - Playing non-owned cards
   - Playing invalid card combinations

2. Special Card Errors
   - Incorrect application of special effects
   - Invalid multi-card combinations
   - Improper sequence after special cards

3. Recovery Procedures
   - Move reversal protocol
   - State restoration process
   - Error notification requirements