import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { Metadata } from "next";

import { authOptions } from "@/lib/auth";
import { getUserProfile } from "@/lib/dashboard/profile-queries";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { ProfileForm } from "@/components/dashboard/profile/ProfileForm";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login?callbackUrl=%2Fdashboard%2Fprofile");

  const profile = await getUserProfile(session.user.id);

  if (!profile) {
    return (
      <EmptyState
        title="Profile unavailable"
        description="Database is not configured, or profile could not be loaded."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Profile</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Manage your account and preferences.</p>
      </div>

      <ProfileForm profile={profile} />
    </div>
  );
}
