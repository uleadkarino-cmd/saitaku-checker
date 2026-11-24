import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.SITE_ORIGIN || 'http://localhost:3000',
  ),
  title: 'テスト',
  description:
    '公募要領に沿って、補助金申請書類の不足や不備をやさしく確認できます。',
  openGraph: {
    title: 'テスト',
    description:
      '公募要領に沿って、補助金申請書類の不足や不備をやさしく確認できます。',
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary',
    title: 'テスト',
    description:
      '公募要領に沿って、補助金申請書類の不足や不備をやさしく確認できます。',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
