import type { Meta, StoryObj } from '@storybook/react';
import Card from './Card';
import { Suit, Rank, CardLocation } from '../../types/card-types';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    selectable: { control: 'boolean' },
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' },
    highlight: { control: 'boolean' },
    onClick: { action: 'clicked' },
    onHover: { action: 'hovered' },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

const baseCard = {
  id: '1',
  location: CardLocation.HAND,
  position: 0,
};

export const Default: Story = {
  args: {
    card: {
      ...baseCard,
      suit: Suit.SPADES,
      rank: Rank.ACE,
      faceUp: true,
    }
  },
};

export const FaceDown: Story = {
  args: {
    card: {
      ...baseCard,
      suit: Suit.SPADES,
      rank: Rank.ACE,
      faceUp: false,
    }
  },
};

export const Selectable: Story = {
  args: {
    card: {
      ...baseCard,
      suit: Suit.SPADES,
      rank: Rank.ACE,
      faceUp: true,
    },
    selectable: true,
  },
};

export const Selected: Story = {
  args: {
    card: {
      ...baseCard,
      suit: Suit.SPADES,
      rank: Rank.ACE,
      faceUp: true,
    },
    selectable: true,
    selected: true,
  },
};

export const Disabled: Story = {
  args: {
    card: {
      ...baseCard,
      suit: Suit.SPADES,
      rank: Rank.ACE,
      faceUp: true,
    },
    selectable: true,
    disabled: true,
  },
};

export const Highlighted: Story = {
  args: {
    card: {
      ...baseCard,
      suit: Suit.SPADES,
      rank: Rank.ACE,
      faceUp: true,
    },
    highlight: true,
  },
};

export const RedCard: Story = {
  args: {
    card: {
      ...baseCard,
      suit: Suit.HEARTS,
      rank: Rank.KING,
      faceUp: true,
    }
  },
};