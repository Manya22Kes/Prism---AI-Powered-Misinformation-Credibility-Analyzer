import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useThemeStore } from './store/themeStore';

// Layout & Scene
import GlobalLayout from './components/layout/GlobalLayout';
import { CinematicLayer } from './components/canvas/CinematicLayer';
import { AnimatedRoutes } from './AnimatedRoutes';

import { useSettingsStore } from './store/settingsStore';

import { ErrorBoundary } from './components/shared/ErrorBoundary';

// Create a client with performance-optimized caching options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes fresh cache
      gcTime: 1000 * 60 * 15, // 15 minutes garbage collection
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

function App() {
  const { theme } = useThemeStore();
  const initializeSettings = useSettingsStore((state) => state.initialize);

  useEffect(() => {
    initializeSettings();
  }, [initializeSettings]);

  // Apply theme to html root
  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
  }, [theme]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <CinematicLayer />
          <GlobalLayout>
            <AnimatedRoutes />
          </GlobalLayout>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
