"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { WebGLShader } from "@/components/ui/web-gl-shader";

const profileCompletionSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  college: z.string().min(2, "College name is required"),
  yearOfStudy: z.string().min(1, "Year of study is required"),
  department: z.string().optional(),
});

type ProfileCompletionFormData = z.infer<typeof profileCompletionSchema>;

export default function CompleteProfilePage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileCompletionFormData>({
    resolver: zodResolver(profileCompletionSchema),
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  const onSubmit = async (data: ProfileCompletionFormData) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update profile");
      }

      // Update session to reflect profile completion
      await update();

      // Redirect to events page
      router.push("/events");
    } catch (error: any) {
      setErrorMessage(error.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden p-4">
      <WebGLShader />

      <Card
        className="max-w-md hover-lift shadow-2xl relative z-10 opacity-100 w-full mx-auto border-transparent"
        style={{
          background: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(40px) saturate(250%)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow:
            "0 32px 80px rgba(0, 0, 0, 0.3), 0 16px 64px rgba(255, 255, 255, 0.1), inset 0 3px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(255, 255, 255, 0.2)",
        }}
      >
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold font-sans text-white">Complete Your Profile</CardTitle>
          <CardDescription className="text-white/80 font-sans">
            Help us personalize your experience by providing a few more details
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error message */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 text-sm">
              {errorMessage}
            </div>
          )}

          {/* Profile completion form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-white font-sans">
                Phone Number <span className="text-red-400">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 9876543210"
                autoComplete="tel"
                className="border-white/40 bg-white/10 placeholder:text-white/50 text-white py-3 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-white/15 transition-all duration-200"
                disabled={isLoading}
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-sm text-red-400">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="college" className="text-sm font-medium text-white font-sans">
                College/University <span className="text-red-400">*</span>
              </Label>
              <Input
                id="college"
                type="text"
                placeholder="Your College Name"
                autoComplete="organization"
                className="border-white/40 bg-white/10 placeholder:text-white/50 text-white py-3 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-white/15 transition-all duration-200"
                disabled={isLoading}
                {...register("college")}
              />
              {errors.college && (
                <p className="text-sm text-red-400">{errors.college.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearOfStudy" className="text-sm font-medium text-white font-sans">
                Year of Study <span className="text-red-400">*</span>
              </Label>
              <select
                id="yearOfStudy"
                className="w-full border-white/40 bg-white/10 text-white py-3 px-3 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-white/15 transition-all duration-200"
                disabled={isLoading}
                {...register("yearOfStudy")}
              >
                <option value="" className="bg-gray-900">Select Year</option>
                <option value="1st Year" className="bg-gray-900">1st Year</option>
                <option value="2nd Year" className="bg-gray-900">2nd Year</option>
                <option value="3rd Year" className="bg-gray-900">3rd Year</option>
                <option value="4th Year" className="bg-gray-900">4th Year</option>
                <option value="Graduate" className="bg-gray-900">Graduate</option>
                <option value="Postgraduate" className="bg-gray-900">Postgraduate</option>
              </select>
              {errors.yearOfStudy && (
                <p className="text-sm text-red-400">{errors.yearOfStudy.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="text-sm font-medium text-white font-sans">
                Department/Major
              </Label>
              <Input
                id="department"
                type="text"
                placeholder="Computer Science, etc."
                className="border-white/40 bg-white/10 placeholder:text-white/50 text-white py-3 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-white/15 transition-all duration-200"
                disabled={isLoading}
                {...register("department")}
              />
              {errors.department && (
                <p className="text-sm text-red-400">{errors.department.message}</p>
              )}
            </div>

            <LiquidButton
              type="submit"
              className="w-full text-white border rounded-full font-sans font-bold text-base"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Complete Profile"}
            </LiquidButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
