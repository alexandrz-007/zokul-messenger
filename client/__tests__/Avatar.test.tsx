import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Avatar from '../src/components/common/Avatar';

describe('Avatar', () => {
  it('renders initials when url is not provided', () => {
    render(<Avatar name="Test User" />);
    expect(screen.getByText('TU')).toBeTruthy();
  });

  it('renders initials for group (url explicitly undefined)', () => {
    render(<Avatar name="My Group" url={undefined} />);
    expect(screen.getByText('MG')).toBeTruthy();
  });

  it('renders image when url is provided', () => {
    render(<Avatar name="Test User" url="/uploads/test.webp" />);
    const img = screen.getByRole('img');
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toBe('/uploads/test.webp');
  });
});