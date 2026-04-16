"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { WebGLShader } from "@/components/ui/web-gl-shader";
import { profileCompletionSchema, ProfileCompletionFormData } from "@/lib/validation-schemas";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { status, update } = useSession();
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

      // Force a session update trigger so middleware gets fresh profileCompleted state.
      await update({ profileCompleted: true });

      // Redirect to home page
      router.push("/");
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred");
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
              <Label htmlFor="collegeRollNumber" className="text-sm font-medium text-white font-sans">
                College Roll Number <span className="text-red-400">*</span>
              </Label>
              <Input
                id="collegeRollNumber"
                type="text"
                placeholder="0905CS241148"
                className="border-white/40 bg-white/10 placeholder:text-white/50 text-white py-3 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-white/15 transition-all duration-200"
                disabled={isLoading}
                {...register("collegeRollNumber")}
              />
              {errors.collegeRollNumber && (
                <p className="text-sm text-red-400">{errors.collegeRollNumber.message}</p>
              )}
              <p className="text-xs text-white/60">Format: 0905 + Department Code + Year + Roll Number</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="semester" className="text-sm font-medium text-white font-sans">
                Semester <span className="text-red-400">*</span>
              </Label>
              <select
                id="semester"
                className="w-full border-white/40 bg-white/10 text-white py-3 px-3 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-white/15 transition-all duration-200"
                disabled={isLoading}
                {...register("semester")}
              >
                <option value="" className="bg-gray-900">Select Semester</option>
                <option value="1" className="bg-gray-900">Semester 1</option>
                <option value="2" className="bg-gray-900">Semester 2</option>
                <option value="3" className="bg-gray-900">Semester 3</option>
                <option value="4" className="bg-gray-900">Semester 4</option>
                <option value="5" className="bg-gray-900">Semester 5</option>
                <option value="6" className="bg-gray-900">Semester 6</option>
                <option value="7" className="bg-gray-900">Semester 7</option>
                <option value="8" className="bg-gray-900">Semester 8</option>
              </select>
              {errors.semester && (
                <p className="text-sm text-red-400">{errors.semester.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="text-sm font-medium text-white font-sans">
                Department <span className="text-red-400">*</span>
              </Label>
              <select
                id="department"
                className="w-full border-white/40 bg-white/10 text-white py-3 px-3 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-white/15 transition-all duration-200"
                disabled={isLoading}
                {...register("department")}
              >
                <option value="" className="bg-gray-900">Select Department</option>
                <option value="Mechanical Engineering" className="bg-gray-900">Mechanical Engineering</option>
                <option value="Civil Engineering" className="bg-gray-900">Civil Engineering</option>
                <option value="Electrical Engineering" className="bg-gray-900">Electrical Engineering</option>
                <option value="Computer Science" className="bg-gray-900">Computer Science</option>
                <option value="Cyber Security" className="bg-gray-900">Cyber Security</option>
                <option value="AI/ML" className="bg-gray-900">AI/ML</option>
                <option value="Data Science" className="bg-gray-900">Data Science</option>
                <option value="Information Technology" className="bg-gray-900">Information Technology</option>
                <option value="IoT" className="bg-gray-900">IoT</option>
              </select>
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
