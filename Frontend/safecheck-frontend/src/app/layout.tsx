import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SafeCheck.ai — Thẩm định Thành phần Y dược & Mỹ phẩm",
  description:
    "Nền tảng AI minh bạch bảng thành phần INCI và sàng lọc rủi ro cơ địa cá nhân.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        style={{ fontFamily: "'Times New Roman', Times, serif" }}
        className="antialiased selection:bg-teal-500/20 selection:text-teal-800"
      >
        {children}
      </body>
    </html>
  );
}
