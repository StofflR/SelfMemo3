import "./globals.css";
import "@mantine/core/styles.css";
import '@mantine/dates/styles.css'; 
import '@mantine/notifications/styles.css'; 

import type { Metadata } from "next"; 
import { MantineProvider, ColorSchemeScript } from "@mantine/core";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "react-hot-toast";
import { Notifications } from '@mantine/notifications'; 

export const metadata: Metadata = {
  title: "SelfMemo 3.0 - Manage your reminders",
  description: "A simple reminder app to help you manage your reminders.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body className="flex min-h-screen w-full flex-col">
        <MantineProvider defaultColorScheme="light">
          <Notifications position="top-right" />
          
          {children}

          <Toaster position="top-right" />
          <Analytics />
        </MantineProvider>
      </body>
    </html>
  );
}