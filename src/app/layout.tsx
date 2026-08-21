import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../index.css";
import "../App.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "POS — Rental PS & Warkop",
  description: "Aplikasi POS untuk Rental PlayStation dan Warkop — berjalan offline di browser",
  icons: {
    icon: "/image_1.webp",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${inter.variable} antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
