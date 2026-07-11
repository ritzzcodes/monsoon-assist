import './globals.css';

export const metadata = {
  metadataBase: new URL('https://monsoon-ready.vercel.app'),
  title: 'MonsoonReady — AI-Powered Monsoon Preparedness Plans',
  description:
    'Generate personalized monsoon preparedness plans for your family. Get emergency checklists, safety tips, and region-specific guidance powered by AI.',
  openGraph: {
    title: 'MonsoonReady — AI-Powered Monsoon Preparedness Plans',
    description:
      'Generate personalized monsoon preparedness plans for your family. Get emergency checklists, safety tips, and region-specific guidance powered by AI.',
    type: 'website',
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌧️</text></svg>",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
