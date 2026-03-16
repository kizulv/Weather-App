import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập | Weather Intelligence",
  description: "Đăng nhập hệ thống để nhận API Token truy cập dữ liệu trạm thời tiết.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
