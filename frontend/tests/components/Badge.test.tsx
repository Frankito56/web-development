import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/Badge';

describe('Badge Component - Happy Paths', () => {
  it('renders the badge label correctly', () => {
    render(<Badge variant="available">Available in Library</Badge>);
    expect(screen.getByText('Available in Library')).toBeInTheDocument();
  });

  it('applies the appropriate variant modifier class', () => {
    const { container: availableContainer } = render(
      <Badge variant="available">In Stock</Badge>
    );
    expect(availableContainer.querySelector('.unilib-badge--available')).toBeInTheDocument();

    const { container: dangerContainer } = render(
      <Badge variant="danger">Overdue</Badge>
    );
    expect(dangerContainer.querySelector('.unilib-badge--danger')).toBeInTheDocument();
  });

  it('renders status dot by default and hides when withDot is false', () => {
    const { container: withDotContainer } = render(<Badge>With Dot</Badge>);
    expect(withDotContainer.querySelector('.unilib-badge__dot')).toBeInTheDocument();

    const { container: noDotContainer } = render(
      <Badge withDot={false}>Without Dot</Badge>
    );
    expect(noDotContainer.querySelector('.unilib-badge__dot')).not.toBeInTheDocument();
  });
});
