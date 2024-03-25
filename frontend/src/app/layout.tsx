import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CustomLayout from "@/components/CustomLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CoinFilp",
  description: "CoinFlip",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CustomLayout>
          <main className=" h-full bg-[#0d131c]">
            {children}
          </main>
        </CustomLayout>
      </body>
    </html>
  );
}
