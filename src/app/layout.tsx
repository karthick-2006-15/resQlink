import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import "leaflet/dist/leaflet.css";

export const metadata: Metadata = {
  title: "ResQLink — Community Emergency Resource Coordination",
  description: "When help is nearby, make it reachable. Fast, verified non-medical emergency resource coordination platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              borderRadius: "0.75rem",
              fontSize: "0.875rem",
            },
          }}
        />
      </body>
    </html>
  );
}
