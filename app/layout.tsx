import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dodgers Daily — Your Morning Briefing",
  description:
    "The top LA Dodgers news stories from MLB.com, ESPN, Dodgers Nation and more — summarized daily with AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
