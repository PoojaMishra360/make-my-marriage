import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Saath | Wedding planning together",
  description: "A shared place for families to plan an Indian wedding."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
