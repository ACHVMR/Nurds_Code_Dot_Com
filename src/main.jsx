import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import { V0ChatGPTProvider } from './context/V0ChatGPTProvider';
import { GlobalChatProvider } from './components/GlobalChatProvider';
import ErrorBoundary from './components/ErrorBoundary';
import FloatingChatButton from './components/FloatingChatButton';
import ChatSidePanel from './components/ChatSidePanel';
import App from './App';
import './styles/index.css';
import './styles/chat.css';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

console.log('🚀 Initializing Nurds Code Platform...');
console.log('Clerk Key:', clerkPubKey ? '✅ Present' : '❌ Missing');
console.log('Clerk Key Value:', clerkPubKey);
console.log('Root element:', document.getElementById('root'));

// Wrapper component to conditionally render ACHEEVY components
function AppWithAuth() {
  const { isSignedIn } = useAuth();

  return (
    <>
      <App />
      {/* Only show ACHEEVY (FloatingChatButton & ChatSidePanel) when user is signed in */}
      {isSignedIn && (
        <>
          <FloatingChatButton />
          <ChatSidePanel />
        </>
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ClerkProvider 
        publishableKey={clerkPubKey} 
        afterSignInUrl="/auth/onboarding" 
        afterSignUpUrl="/auth/onboarding"
      >
        <GlobalChatProvider>
          <V0ChatGPTProvider>
            <BrowserRouter>
              <AppWithAuth />
            </BrowserRouter>
          </V0ChatGPTProvider>
        </GlobalChatProvider>
      </ClerkProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
                                                                                                                                                                                                        