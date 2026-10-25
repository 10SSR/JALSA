import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'JALSA | AI Event Co-Pilot & Decision Engine',
  description:
    'Intelligent event planner co-pilot for Indian weddings and celebrations. Deterministic rules engine backed by GenAI personalization.',
  keywords: ['wedding planner', 'event management', 'indian wedding', 'budget planner', 'jalsa'],
  authors: [{ name: 'Jalsa Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#941437',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col font-sans">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <div className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
