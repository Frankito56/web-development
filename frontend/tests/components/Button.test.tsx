import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button Component - Happy Paths', () => {
  it('renders button with child text and triggers onClick handler', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Borrow Book</Button>);

    const button = screen.getByRole('button', { name: /borrow book/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('respects disabled state and prevents click handler invocation', () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled Action
      </Button>
    );

    const button = screen.getByRole('button', { name: /disabled action/i });
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders loading spinner and disables button when isLoading is true', () => {
    render(<Button isLoading>Processing</Button>);

    const button = screen.getByRole('button', { name: /processing/i });
    expect(button).toBeDisabled();
    expect(button.querySelector('.unilib-btn__spinner')).toBeInTheDocument();
  });
});
