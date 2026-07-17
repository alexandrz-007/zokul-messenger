import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import HomePage from './components/HomePage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-surface">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="inline-block text-5xl font-bold text-primary select-none leading-none tracking-tight">
            Zokul
          </span>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Secure messenger</p>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
        <Routes>
          <Route path="/login" element={<PublicRoute><AuthLayout><LoginForm /></AuthLayout></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><AuthLayout><RegisterForm /></AuthLayout></PublicRoute>} />
          <Route path="/*" element={
            <ProtectedRoute>
              <SocketProvider><HomePage /></SocketProvider>
            </ProtectedRoute>
          } />
        </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
