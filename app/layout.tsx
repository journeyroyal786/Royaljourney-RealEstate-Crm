import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "ROYAL JOURNEY | Real Estate CRM",
  description: "Royal Journey real estate lead, operations and finance management."
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
