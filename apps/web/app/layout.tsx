import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIRPLANE",
  description: "Interactive experiences shared through a link."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
