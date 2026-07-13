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
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <span className="inline-block text-7xl font-extrabold bg-gradient-to-r from-primary to-blue-400/60 bg-clip-text text-transparent animate-pulse-slow select-none leading-none">
            Zokul
          </span>
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
