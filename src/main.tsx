import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './globals.css';
import App from './App.tsx';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { WebSocketProvider } from './providers/WebSocketProvider.tsx';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <QueryClientProvider client={queryClient}>
                <WebSocketProvider url="ws://localhost:8080">
                    <Toaster richColors position="top-right" />

                    <App />
                </WebSocketProvider>
            </QueryClientProvider>
        </BrowserRouter>
    </StrictMode>,
);
