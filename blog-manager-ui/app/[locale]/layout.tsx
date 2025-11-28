import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import AdminLayout from "@/components/AdminLayout";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DeepVeir Admin",
  description: "DeepVeir Blog Management System",
};

export default async function RootLayout({
  children,
  params: { locale }
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <AdminLayout>
            {children}
          </AdminLayout>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
