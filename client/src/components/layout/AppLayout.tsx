import { ReactNode } from 'react';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen flex flex-col safe-area-top bg-white dark:bg-surface text-gray-900 dark:text-gray-100">
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}