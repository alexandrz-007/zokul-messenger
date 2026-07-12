import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold text-center">Sign In</h2>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">{error}</div>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark disabled:opacity-50 transition-colors"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
      <p className="text-center text-sm text-gray-500">
        No account? <Link to="/register" className="text-primary">Register</Link>
      </p>
    </form>
  );
}
