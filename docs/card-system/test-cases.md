# Card System Test Cases

## Type System Tests

### Card Creation Tests
1. Test valid card creation with all suits and ranks
2. Verify unique ID generation for each card
3. Test card location assignment
4. Verify owner assignment and changes

### Enum Validation Tests
1. Verify all suits are correctly defined
2. Verify all ranks are correctly defined
3. Test card location enum completeness
4. Verify special effects enum coverage

## Card Value Tests

### Basic Comparison Tests
1. Test regular card value comparisons
2. Verify ace high rule implementation
3. Test card equality comparisons
4. Verify suit independence in comparisons

### Special Card Tests
1. Test Two (2) reset functionality
   - Verify playable on any card
   - Test reset of pile value
   - Verify next play requirements

2. Test Eight (8) transparency
   - Verify value inheritance
   - Test chain of multiple eights
   - Verify correct next play requirements

3. Test Jack (J) skip effect
   - Verify turn skipping in multiplayer
   - Test two-player special case
   - Verify turn order after skip

4. Test Four-of-a-Kind
   - Verify pile burning
   - Test partial four-of-a-kind plays
   - Verify next play freedom

## Move Validation Tests

### Legal Move Tests
1. Test valid single card plays
2. Test valid multiple card plays
3. Verify location-based play rules
4. Test special card combinations

### Illegal Move Tests
1. Test lower value card rejection
2. Test invalid card combinations
3. Verify location rule enforcement
4. Test non-owned card rejection

### Edge Case Tests
1. Test empty pile plays
2. Verify deck depletion handling
3. Test face-down card blind play
4. Verify pile pickup scenarios

## Integration Tests

### Game Flow Tests
1. Test turn progression
2. Verify move history tracking
3. Test game state transitions
4. Verify win conditions

### Multi-Card Tests
1. Test multiple card combinations
2. Verify split play strategies
3. Test burning mechanics
4. Verify card counting

### Error Handling Tests
1. Test invalid move recovery
2. Verify state restoration
3. Test error notifications
4. Verify timeout handling

## Performance Tests

### Card Operation Tests
1. Measure card creation speed
2. Test comparison performance
3. Verify validation speed
4. Test state update performance

### Memory Tests
1. Verify memory usage
2. Test garbage collection
3. Measure state size
4. Test serialization performance