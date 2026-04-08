import type { Metadata } from "next";
import { Noto_Serif_JP } from "next/font/google";
import CursorSlash from "@/components/CursorSlash";
import "./globals.css";

const notoSerifJP = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ZyraOS",
  description:
    "She builds while you watch. Autonomous agent framework for workflows that take days, not minutes.",
  icons: {
    icon: "/zyra.os.jpg",
    apple: "/zyra.os.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={notoSerifJP.variable}>
      <body>
        <CursorSlash />
        {children}
      </body>
    </html>
  );
}
