// src/main.tsx
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { fetchCsrfToken } from './lib/apiClient';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 必要ならオプション設定
    },
  },
});

function InitializeApp() {
  useEffect(() => {
    console.log("Initializing app, fetching CSRF token...");
    fetchCsrfToken()
        .then(() => {
            console.log("CSRF token fetched successfully.");
        })
        .catch(error => {
            console.error("Failed to fetch CSRF token:", error);
        });
  }, []);

  return <App />;
}

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
           {/* <HelmetProvider> */} {/* ★ コメントアウト ★ */}
             <InitializeApp />
           {/* </HelmetProvider> */} {/* ★ コメントアウト ★ */}
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </React.StrictMode>,
  );
} else {
  console.error('Failed to find the root element');
}