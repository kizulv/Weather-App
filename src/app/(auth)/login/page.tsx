"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { KeyRound, Lock, User } from "lucide-react";
import { APP_ROUTES } from "@/shared/constants/routes";

// Schema đăng nhập
const loginSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
  password: z.string().min(6, { message: "Mật khẩu ít nhất 6 ký tự" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Đăng nhập thất bại");
      }

      toast.success("Đăng nhập thành công!", {
        description: "Đang chuyển hướng...",
      });
      
      router.push(APP_ROUTES.defaults.authenticated);
      router.refresh();
      
    } catch (error: unknown) {
      toast.error("Lỗi đăng nhập", {
        description: error instanceof Error ? error.message : "Đã có lỗi xảy ra",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <Card className="bg-slate-900/40 border border-white/10 text-white rounded-2xl shadow-2xl backdrop-blur-xl">
        <CardHeader className="space-y-1 text-center pb-4 pt-6">
          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/20">
            <KeyRound className="w-5 h-5 text-white/50" />
          </div>
          <CardTitle className="text-base font-semibold text-white tracking-tight">
            PHẠM CÔNG THÀNH
          </CardTitle>
          <CardDescription className="text-sm text-white/50">
            Đăng nhập hệ thống
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm text-white/60">Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <Input 
                  type="email" 
                  placeholder="name@example.com" 
                  className="pl-10 h-10 bg-white/5 border-white/10 text-sm text-white placeholder:text-white/25 focus-visible:ring-0 focus-visible:border-white/25 transition-colors duration-200"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm text-white/60">Mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10 h-10 bg-white/5 border-white/10 text-sm text-white placeholder:text-white/25 focus-visible:ring-0 focus-visible:border-white/25 transition-colors duration-200"
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-10 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-md shadow-lg shadow-blue-600/20 transition-colors duration-200 mt-6"
              disabled={isLoading}
            >
              {isLoading ? "Đang xác thực..." : "Đăng nhập"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
