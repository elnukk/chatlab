import './globals.css';
import { Analytics } from '@vercel/analytics/react';

export const metadata = {
  title: 'Open-Source Chatbot Experiment Platform for Qualtrics',
  description:
    'Embed AI chatbot conversations into Qualtrics surveys. Pass any URL parameter as a template variable in your system prompt. Supports OpenAI and Anthropic. Free and open-source.',
  keywords: [
    'chatbot experiment',
    'qualtrics chatbot',
    'LLM experiment platform',
    'AI research tool',
    'survey chatbot',
    'qualtrics iframe chatbot',
    'openai qualtrics',
    'anthropic qualtrics',
    'chatbot user study',
    'open source experiment platform',
  ],
  openGraph: {
    title: 'Open-Source Chatbot Experiment Platform for Qualtrics',
    description:
      'Embed AI chatbot conversations into Qualtrics surveys. Pass URL parameters as template variables in your system prompt.',
    type: 'website',
    url: 'https://chat2survey.com',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
