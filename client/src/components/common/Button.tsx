import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'ghost';
  className?: string;
  disabled?: boolean;
}

export default function Button({ children, onClick, variant = 'primary', className = '', disabled }: ButtonProps) {
  const base = 'px-4 py-2 rounded-xl font-medium transition-all active:scale-[0.98] disabled:opacity-40';
  const styles = variant === 'primary'
    ? 'bg-primary text-white hover:bg-primary-dark'
    : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5';
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
}