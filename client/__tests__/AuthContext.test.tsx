import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import api from '../src/services/api';

vi.mock('../src/services/api');

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function TestComponent() {
    const { user, loading, login } = useAuth();
    if (loading) return <div>loading</div>;
    if (!user) return <div>not logged in</div>;
    return <div>logged in as {user.name}</div>;
  }

  it('should show loading initially, then not logged in', async () => {
    (api.get as any).mockResolvedValueOnce({ data: { user: null } });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('not logged in')).toBeInTheDocument();
    });
  });

  it('should set user after successful login', async () => {
    (api.get as any).mockResolvedValueOnce({ data: { user: null } });
    const mockUser = { id: '1', email: 'test@test.com', name: 'Test', createdAt: '2024-01-01' };
    (api.post as any).mockResolvedValueOnce({ data: { user: mockUser } });

    let loginFn: typeof useAuth extends () => infer R ? R['login'] : never;
    function LoginTest() {
      const { user, loading, login } = useAuth();
      loginFn = login;
      if (loading) return <div>loading</div>;
      if (!user) return <div>not logged in</div>;
      return <div>logged in as {user.name}</div>;
    }

    render(
      <AuthProvider>
        <LoginTest />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('not logged in')).toBeInTheDocument();
    });

    await loginFn!('test@test.com', 'pass');

    await waitFor(() => {
      expect(screen.getByText('logged in as Test')).toBeInTheDocument();
    });
  });
});
