import type { Metadata } from "next";
import "./globals.css";
import "./styles.css";

import { Libre_Franklin } from 'next/font/google'

const libre_franklin = Libre_Franklin({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-libre_franklin',
})

export const metadata: Metadata = {
  title: "MitiMiti",
  description: "Trabajo Práctico - FIUBA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={libre_franklin.variable}>
        {children}
      </body>
    </html>
  );
}
