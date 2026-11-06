import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AUDITORA",
  description: "Smart Accounting",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#080808', color: '#FFFFFF', fontFamily: 'sans-serif', margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
