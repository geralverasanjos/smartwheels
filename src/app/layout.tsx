import type {Metadata} from 'next';
import './globals.css';
import { AppContextProvider } from '@/contexts/app-context';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from 'next-themes';

export const metadata: Metadata = {
  title: 'SmartWheels',
  description: 'SmartWheels: Táxi Inteligente, conectando você globalmente.',
  manifest: '/manifest.json',
  icons: {
    apple: "/assets/icons/icon-192x192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#22c55e" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 'system';
                if (theme === 'system') {
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  document.documentElement.classList.toggle('dark', prefersDark);
                } else {
                  document.documentElement.classList.toggle('dark', theme === 'dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="font-body antialiased">
        <AppContextProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Toaster />
          </ThemeProvider>
        </AppContextProvider>
      </body>
    </html>
  );
}
