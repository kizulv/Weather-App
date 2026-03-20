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
  return (
    <div className="fixed inset-0 bg-[#0f172a] flex items-center justify-center z-50">
      {/* Ambient glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] bg-emerald-500/8 rounded-full blur-[120px]" />
      </div>
      <div className="relative z-10 w-full px-4">
        {children}
      </div>
    </div>
  );
}
