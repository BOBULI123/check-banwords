import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "电商违禁词检测工具 - 一键排查违规风险",
  description:
    "免费电商违禁词检测工具，支持淘宝、拼多多、抖音、小红书平台，AI智能识别极限词、敏感词、虚假宣传，一键替换合规文案",
  keywords: "违禁词检测,电商违规词,淘宝违禁词,拼多多敏感词,抖音极限词,小红书违规词,广告法违禁词",
  verification: {
    google: "-oevWsa1EfZk1bg3tyxpcwvvHjLJL2_v8tkEfMDbieU",
    other: {
      "baidu-site-verification": "codeva-5I9Gx86XIi",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
