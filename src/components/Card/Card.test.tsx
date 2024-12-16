import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Card from './Card';
import { Card as CardType, Suit, Rank, CardLocation } from '../../types/card-types';

describe('Card Component', () => {
  const mockCard: CardType = {
    id: '1',
    suit: Suit.SPADES,
    rank: Rank.ACE,
    location: CardLocation.HAND,
    faceUp: true,
    position: 0
  };

  it('renders face-up card correctly', () => {
    render(<Card card={mockCard} testId="test-card" />);
    
    expect(screen.getByTestId('test-card')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getAllByText('♠')).toHaveLength(3); // rank + 2 corners
  });

  it('renders face-down card correctly', () => {
    const faceDownCard = { ...mockCard, faceUp: false };
    render(<Card card={faceDownCard} testId="test-card" />);
    
    expect(screen.getByTestId('test-card')).toBeInTheDocument();
    expect(screen.queryByText('A')).not.toBeInTheDocument();
  });

  it('handles click events when selectable', () => {
    const handleClick = vi.fn();
    render(
      <Card
        card={mockCard}
        selectable={true}
        onClick={handleClick}
        testId="test-card"
      />
    );
    
    fireEvent.click(screen.getByTestId('test-card'));
    expect(handleClick).toHaveBeenCalledWith(mockCard);
  });

  it('does not handle click events when disabled', () => {
    const handleClick = vi.fn();
    render(
      <Card
        card={mockCard}
        selectable={true}
        disabled={true}
        onClick={handleClick}
        testId="test-card"
      />
    );
    
    fireEvent.click(screen.getByTestId('test-card'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('handles hover events', () => {
    const handleHover = vi.fn();
    render(
      <Card
        card={mockCard}
        onHover={handleHover}
        testId="test-card"
      />
    );
    
    fireEvent.mouseEnter(screen.getByTestId('test-card'));
    expect(handleHover).toHaveBeenCalledWith(mockCard);
  });

  it('applies selected styles when selected', () => {
    render(
      <Card
        card={mockCard}
        selected={true}
        testId="test-card"
      />
    );
    
    expect(screen.getByTestId('test-card')).toHaveClass('ring-2', 'ring-blue-500');
  });

  it('applies highlight styles when highlighted', () => {
    render(
      <Card
        card={mockCard}
        highlight={true}
        testId="test-card"
      />
    );
    
    expect(screen.getByTestId('test-card')).toHaveClass('ring-2', 'ring-yellow-400');
  });

  it('applies disabled styles when disabled', () => {
    render(
      <Card
        card={mockCard}
        disabled={true}
        testId="test-card"
      />
    );
    
    expect(screen.getByTestId('test-card')).toHaveClass('opacity-50');
  });

  it('renders red suits in red color', () => {
    const redCard: CardType = {
      ...mockCard,
      suit: Suit.HEARTS,
    };

    render(<Card card={redCard} testId="test-card" />);
    const suitElements = screen.getAllByText('♥');
    suitElements.forEach(element => {
      expect(element).toHaveClass('text-red-600');
    });
  });
});