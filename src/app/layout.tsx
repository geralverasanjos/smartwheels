import type {Metadata} from 'next';
import './globals.css';
import { AppContextProvider } from '@/contexts/app-context';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'SmartWheels',
  description: 'SmartWheels: Táxi Inteligente, conectando você globalmente.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AppContextProvider>
          {children}
          <Toaster />
        </AppContextProvider>
      </body>
    </html>
  );
}
