import { ReactNode } from 'react';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen flex flex-col safe-area-top">
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
