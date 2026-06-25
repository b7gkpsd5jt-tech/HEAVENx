import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'HEAVEN X',
  description: 'Read Your Favorite Manhwa Anywhere',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="bg-background text-white antialiased">
        {children}
      </body>
    </html>
  );
}
