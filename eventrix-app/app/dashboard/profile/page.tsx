import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { Metadata } from "next";

import { authOptions } from "@/lib/auth";
import { getUserProfile } from "@/lib/dashboard/profile-queries";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { ProfileForm } from "@/components/dashboard/profile/ProfileForm";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login?callbackUrl=%2Fdashboard%2Fprofile");

  const profile = await getUserProfile(session.user.id);

  if (!profile) {
    return (
      <div className="space-y-4">
        <DashboardPageHeader
          eyebrow="Account"
          title="Profile"
          description="Manage your personal details and notification preferences."
        />
        <EmptyState
          title="Profile unavailable"
          description="Database is not configured, or profile could not be loaded."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DashboardPageHeader
        eyebrow="Account"
        title="Profile"
        description="Keep your account details up to date and control how you receive updates."
      />

      <ProfileForm profile={profile} />
    </div>
  );
}
