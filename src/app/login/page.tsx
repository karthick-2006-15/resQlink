"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { ShieldAlert, Eye, EyeOff, Lock, Mail, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Welcome back, ${data.data.user.name}!`);
        const role = data.data.user.role;
        if (role === "ADMIN") router.push("/admin");
        else if (role === "VOLUNTEER") router.push("/volunteer");
        else router.push("/citizen");
        router.refresh();
      } else {
        toast.error(data.error.message || "Invalid email or password");
      }
    } catch (err: any) {
      toast.error("Login failed: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password123");
    toast.info(`Filled credentials for ${demoEmail}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/90 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/25">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Sign In to ResQLink
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Access your emergency response console
            </p>
          </div>

          {/* Quick Demo Credentials Card */}
          <div className="mb-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Hackathon Judge 1-Click Fill:</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("demo.citizen@example.com")}
                className="py-1.5 px-2 rounded-lg bg-white border border-amber-200 hover:border-amber-400 text-[11px] font-bold text-slate-700 hover:text-blue-600 transition-colors shadow-sm"
              >
                Citizen
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("demo.volunteer@example.com")}
                className="py-1.5 px-2 rounded-lg bg-white border border-amber-200 hover:border-amber-400 text-[11px] font-bold text-slate-700 hover:text-blue-600 transition-colors shadow-sm"
              >
                Volunteer
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("demo.admin@example.com")}
                className="py-1.5 px-2 rounded-lg bg-white border border-amber-200 hover:border-amber-400 text-[11px] font-bold text-slate-700 hover:text-blue-600 transition-colors shadow-sm"
              >
                Admin
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-2.5"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-bold text-blue-600 hover:underline">
                Register as Citizen or Volunteer
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
