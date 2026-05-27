'use client';

import { SessionProvider } from 'next-auth/react';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';

import { store } from '@/store/store';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ThemeProvider as CustomThemeProvider } from '@/hooks/useTheme';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <CustomThemeProvider>
        <ThemeProvider>
          <SessionProvider>
            {children}
            <Toaster 
              position="bottom-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#333',
                  color: '#fff',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                },
                success: {
                  iconTheme: {
                    primary: '#39FF14',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </SessionProvider>
        </ThemeProvider>
      </CustomThemeProvider>
    </Provider>
  );
}
