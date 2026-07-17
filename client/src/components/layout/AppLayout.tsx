import { ReactNode } from 'react';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen flex flex-col safe-area-top bg-[#EAF1F8] dark:bg-gray-900">
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
