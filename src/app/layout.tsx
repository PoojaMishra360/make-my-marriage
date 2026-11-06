import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Saath | Plan your wedding, together",
  description: "A thoughtful shared space for your wedding celebrations, family, guests, and the details in between."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
