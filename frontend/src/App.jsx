import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useThemeStore } from './store/themeStore';

// Layout & Scene
import GlobalLayout from './components/layout/GlobalLayout';
import { CinematicLayer } from './components/canvas/CinematicLayer';
import { AnimatedRoutes } from './AnimatedRoutes';

// Create a client
const queryClient = new QueryClient();

function App() {
  const { theme } = useThemeStore();

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
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <CinematicLayer />
        <GlobalLayout>
          <AnimatedRoutes />
        </GlobalLayout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
