import type { Metadata } from "next";
import "./globals.css";
import { ThemeRegistry } from "./ThemeRegistry";

export const metadata: Metadata = {
  title: "Contact Selection Flow",
  description: "Client and contact selection and editing flow",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
