/**
 * Card Logic Tests
 */

[Previous test content, then continuing with...]

describe('Dealing Operations', () => {
  const config = {
    faceDownCards: 3,
    faceUpCards: 3,
    handCards: 3
  };

  test('should deal correct number of cards to players', () => {
    const deck = createDeck();
    const playerCards = dealCards(deck, 2, config);
    
    expect(playerCards.size).toBe(2);
    playerCards.forEach(cards => {
      expect(cards.faceDown.length).toBe(config.faceDownCards);
      expect(cards.faceUp.length).toBe(config.faceUpCards);
      expect(cards.hand.length).toBe(config.handCards);
    });
  });

  test('should set correct card properties', () => {
    const deck = createDeck();
    const playerCards = dealCards(deck, 2, config);
    
    playerCards.forEach((cards, playerId) => {
      cards.faceDown.forEach(card => {
        expect(card.location).toBe(CardLocation.FACE_DOWN);
        expect(card.ownerId).toBe(playerId);
        expect(card.faceUp).toBe(false);
      });
      
      cards.faceUp.forEach(card => {
        expect(card.location).toBe(CardLocation.FACE_UP);
        expect(card.ownerId).toBe(playerId);
        expect(card.faceUp).toBe(true);
      });
      
      cards.hand.forEach(card => {
        expect(card.location).toBe(CardLocation.HAND);
        expect(card.ownerId).toBe(playerId);
        expect(card.faceUp).toBe(true);
      });
    });
  });

  test('should not reuse cards between players', () => {
    const deck = createDeck();
    const playerCards = dealCards(deck, 2, config);
    
    const allCards = new Set<string>();
    playerCards.forEach(cards => {
      [...cards.faceDown, ...cards.faceUp, ...cards.hand].forEach(card => {
        expect(allCards.has(card.id)).toBe(false);
        allCards.add(card.id);
      });
    });
  });
});

describe('Card Movement', () => {
  test('should move card to new location', () => {
    const card = createCard(Suit.HEARTS, Rank.ACE);
    const movedCard = moveCard(card, CardLocation.HAND, 1);
    
    expect(movedCard.location).toBe(CardLocation.HAND);
    expect(movedCard.position).toBe(1);
    expect(movedCard.id).toBe(card.id);
    expect(movedCard.suit).toBe(card.suit);
    expect(movedCard.rank).toBe(card.rank);
  });

  test('should maintain immutability', () => {
    const card = createCard(Suit.HEARTS, Rank.ACE);
    const movedCard = moveCard(card, CardLocation.HAND, 1);
    
    expect(card.location).toBe(CardLocation.DECK);
    expect(card.position).toBe(0);
  });
});

describe('Card Serialization', () => {
  test('should serialize card correctly', () => {
    const card = createCard(Suit.HEARTS, Rank.ACE);
    expect(serializeCard(card)).toBe('AH');
  });

  test('should deserialize card correctly', () => {
    const card = deserializeCard('AH');
    expect(card.suit).toBe(Suit.HEARTS);
    expect(card.rank).toBe(Rank.ACE);
  });

  test('should maintain card properties through serialization', () => {
    const original = createCard(Suit.HEARTS, Rank.ACE);
    const serialized = serializeCard(original);
    const deserialized = deserializeCard(serialized);
    
    expect(deserialized.suit).toBe(original.suit);
    expect(deserialized.rank).toBe(original.rank);
  });
});

// Helper functions for testing
function createTestCards(count: number): Card[] {
  const cards: Card[] = [];
  const deck = createDeck();
  for (let i = 0; i < count; i++) {
    cards.push(deck[i]);
  }
  return cards;
}

function assertValidCard(card: Card) {
  expect(card).toBeDefined();
  expect(card.id).toBeDefined();
  expect(card.suit).toBeDefined();
  expect(card.rank).toBeDefined();
  expect(card.location).toBeDefined();
  expect(typeof card.faceUp).toBe('boolean');
  expect(typeof card.position).toBe('number');
}