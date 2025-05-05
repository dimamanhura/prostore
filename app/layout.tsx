import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { APP_DESCRIPTION, APP_NAME, SERVER_URL } from '@/lib/constants';
import { ThemeProvider } from "next-themes"; 
import { Toaster } from "@/components/ui/sonner";
import "@/assets/styles/globals.css";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: `%s | Prostore`,
    default: APP_NAME, 
  },
  description: APP_DESCRIPTION,
  metadataBase: new URL(SERVER_URL),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          disableTransitionOnChange
          defaultTheme="light"
          enableSystem
          attribute={'class'}
        >
          {children}
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
};
