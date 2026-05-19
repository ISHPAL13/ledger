import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import "@/app/globals.css";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${APP_NAME} | AI-powered GST invoice automation`,
  description: APP_TAGLINE,
  metadataBase: new URL("https://ledger.talosinnovations.com")
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" }}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
