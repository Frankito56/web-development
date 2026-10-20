import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from '@/features/books/components/SearchBar';

describe('SearchBar Component - Happy Paths', () => {
  it('renders input with default placeholder and initial value', () => {
    const handleChange = vi.fn();
    render(<SearchBar value="Algorithms" onChange={handleChange} />);

    const input = screen.getByRole('searchbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('Algorithms');
  });

  it('calls onChange with updated text when user types', () => {
    const handleChange = vi.fn();
    render(<SearchBar value="" onChange={handleChange} />);

    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'Distributed Systems' } });

    expect(handleChange).toHaveBeenCalledWith('Distributed Systems');
  });

  it('renders clear button when value is non-empty and clears input on click', () => {
    const handleChange = vi.fn();
    render(<SearchBar value="Machine Learning" onChange={handleChange} />);

    const clearBtn = screen.getByRole('button', { name: /clear search/i });
    expect(clearBtn).toBeInTheDocument();

    fireEvent.click(clearBtn);
    expect(handleChange).toHaveBeenCalledWith('');
  });
});
