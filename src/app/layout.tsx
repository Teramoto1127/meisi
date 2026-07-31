import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "meisi | 電子名刺",
  description: "作成から交換までアプリ内で完結する電子名刺サービス",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
