import { useState, FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function InviteForm() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const { joinByInvite, loading } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await joinByInvite(code);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid invite code');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Zokul</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Введите код доступа</p>
      </div>
      {error && <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded-lg text-sm">{error}</div>}
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Код доступа"
        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
        autoFocus
      />
      <button
        type="submit"
        disabled={loading || !code.trim()}
        className="w-full p-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
      >
        {loading ? 'Вход...' : 'Войти в мессенджер'}
      </button>
    </form>
  );
}
