import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QAF Support AI (local)",
  description: "WhatsApp support companion for Qubators AI Foundry — running locally.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "Segoe UI, system-ui, sans-serif", margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
