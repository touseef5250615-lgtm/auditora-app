import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AUDITORA",
  description: "Smart Accounting. Accurate Auditing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#080808', color: '#FFFFFF', margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
