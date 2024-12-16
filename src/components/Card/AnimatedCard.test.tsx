import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AnimatedCard from './AnimatedCard';
import { Card, Suit, Rank, CardLocation } from '../../types/card-types';

describe('AnimatedCard', () => {
  const mockCard: Card = {
    id: '1',
    suit: Suit.SPADES,
    rank: Rank.ACE,
    location: CardLocation.HAND,
    faceUp: true,
    position: 0
  };

  const mockPosition = {
    x: 0,
    y: 0,
    rotation: 0,
    scale: 1
  };

  it('renders card with correct position', () => {
    render(
      <AnimatedCard
        card={mockCard}
        position={mockPosition}
        testId="animated-card"
      />
    );
    
    const element = screen.getByTestId('animated-card');
    expect(element).toBeInTheDocument();
  });

  it('handles card selection when selectable', () => {
    const onSelect = vi.fn();
    render(
      <AnimatedCard
        card={mockCard}
        position={mockPosition}
        isSelectable={true}
        onSelect={onSelect}
        testId="animated-card"
      />
    );

    const element = screen.getByTestId('animated-card');
    fireEvent.click(element);
    expect(onSelect).toHaveBeenCalledWith(mockCard);
  });

  it('does not handle selection when disabled', () => {
    const onSelect = vi.fn();
    render(
      <AnimatedCard
        card={mockCard}
        position={mockPosition}
        isSelectable={true}
        isDisabled={true}
        onSelect={onSelect}
        testId="animated-card"
      />
    );

    const element = screen.getByTestId('animated-card');
    fireEvent.click(element);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('applies selected styles when selected', () => {
    render(
      <AnimatedCard
        card={mockCard}
        position={mockPosition}
        isSelected={true}
        testId="animated-card"
      />
    );

    const element = screen.getByTestId('animated-card');
    expect(element).toHaveClass('ring-2', 'ring-blue-500');
  });
});