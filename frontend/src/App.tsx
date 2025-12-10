import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Sidebar from './components/Layout/Sidebar';
import ChatContainer from './components/Chat/ChatContainer';
import WelcomeHero from './components/Welcome/WelcomeHero';
import { useChatStore } from './stores/chatStore';
import './styles/globals.css';

const queryClient = new QueryClient();

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { messages } = useChatStore();
  const hasMessages = messages.length > 0;

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen bg-bg-deep overflow-hidden">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

        {/* Main Content */}
        <main
          className={`flex-1 flex flex-col transition-all duration-300 ${
            sidebarOpen ? 'ml-72' : 'ml-0'
          }`}
        >
          {/* Toggle sidebar button when closed */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="fixed top-4 left-4 z-50 p-2 bg-bg-card rounded-lg border border-neon-cyan/30 hover:border-neon-cyan transition-colors"
              aria-label="Open sidebar"
            >
              <svg
                className="w-6 h-6 text-neon-cyan"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          )}

          {/* Content Area */}
          <div className="flex-1 flex flex-col h-full">
            {hasMessages ? <ChatContainer /> : <WelcomeHero />}
          </div>
        </main>

        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#0A0F1F',
              color: '#F0F6FC',
              border: '1px solid rgba(0, 229, 255, 0.3)',
              borderRadius: '12px',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#F0F6FC',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#F0F6FC',
              },
            },
          }}
        />
      </div>
    </QueryClientProvider>
  );
}

export default App;
