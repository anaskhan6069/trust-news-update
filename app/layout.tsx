import type { Metadata } from "next";
import "@/app/globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: {
    default: "Trust News",
    template: "%s | Trust News"
  },
  description: "A community-powered news platform with reviewed submissions.",
  icons: {
    icon: "/logo.svg"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
