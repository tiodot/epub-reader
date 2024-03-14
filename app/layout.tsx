import type { Metadata, Viewport } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Epub reader",
  description: "Online Epub reader, can search and download from github",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
