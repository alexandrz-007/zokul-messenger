import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginForm from '../src/components/auth/LoginForm';
import { AuthProvider } from '../src/contexts/AuthContext';
import api from '../src/services/api';

vi.mock('../src/services/api');

function renderLoginForm() {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    </BrowserRouter>
  );
}

async function waitForReady() {
  await waitFor(() => {
    expect(screen.queryByText('Signing in...')).not.toBeInTheDocument();
  });
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockResolvedValue({ data: { user: null } });
  });

  it('should render form with email and password inputs', async () => {
    renderLoginForm();
    await waitForReady();

    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should show error on failed login', async () => {
    (api.post as any).mockRejectedValueOnce({
      response: { data: { error: 'Invalid credentials' } },
    });

    renderLoginForm();
    await waitForReady();

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'bad@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
});
