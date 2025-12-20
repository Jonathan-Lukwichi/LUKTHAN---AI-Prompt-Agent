import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import ContextPanel from './components/Layout/ContextPanel';
import ChatContainer from './components/Chat/ChatContainer';
import WelcomeHero from './components/Welcome/WelcomeHero';
import LandingPage from './components/Landing/LandingPage';
import { useChatStore } from './stores/chatStore';
import './styles/globals.css';

const queryClient = new QueryClient();

function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [contextPanelOpen, setContextPanelOpen] = useState(false);
  const { messages, clearMessages } = useChatStore();
  const hasMessages = messages.length > 0;

  const handleBackToLanding = () => {
    clearMessages();
    setHasStarted(false);
  };

  if (!hasStarted) {
    return (
      <QueryClientProvider client={queryClient}>
        <AnimatePresence mode="wait">
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
          >
            <LandingPage onStart={() => setHasStarted(true)} />
          </motion.div>
        </AnimatePresence>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 2000,
            style: {
              background: 'rgba(10, 10, 26, 0.95)',
              color: '#fff',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '12px',
              fontSize: '13px',
              padding: '10px 14px',
            },
          }}
        />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AnimatePresence mode="wait">
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="h-screen bg-[#030014] flex flex-col overflow-hidden"
        >
          <Header
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onToggleContextPanel={() => setContextPanelOpen(!contextPanelOpen)}
            sidebarOpen={sidebarOpen}
            contextPanelOpen={contextPanelOpen}
            onBackToLanding={handleBackToLanding}
          />

          <div className="flex-1 flex overflow-hidden">
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
            <main className="flex-1 flex flex-col overflow-hidden bg-[#030014]">
              {hasMessages ? <ChatContainer /> : <WelcomeHero />}
            </main>
            <div className="hidden lg:block">
              <ContextPanel
                isOpen={contextPanelOpen && hasMessages}
                onClose={() => setContextPanelOpen(false)}
              />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2000,
          style: {
            background: 'rgba(10, 10, 26, 0.95)',
            color: '#fff',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '12px',
            fontSize: '13px',
            padding: '10px 14px',
          },
          success: {
            iconTheme: { primary: '#00ff88', secondary: '#fff' },
            style: { border: '1px solid rgba(0, 255, 136, 0.3)' },
          },
          error: {
            iconTheme: { primary: '#ff4466', secondary: '#fff' },
            style: { border: '1px solid rgba(255, 68, 102, 0.3)' },
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
