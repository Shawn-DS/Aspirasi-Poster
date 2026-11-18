import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Peluang Kedua · Satu perbualan, satu peluang",
  description: "Sertai perbualan komuniti Taman Harmoni. Sebuah kisah interaktif tentang ihsan terhadap bekas banduan.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 1, userScalable: false, interactiveWidget: "resizes-content", themeColor: "#075e54" };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ms">
      <body>{children}</body>
    </html>
  );
}
