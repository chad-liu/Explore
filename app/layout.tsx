import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '探究題目小幫手',
  description: '讓 AI 陪你一步步找到最適合的探究問題',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}
