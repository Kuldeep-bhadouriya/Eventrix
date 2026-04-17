import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDashboardUrl } from "@/lib/utils-shared";

export default async function PostLoginPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  if (!session.user.profileCompleted) {
    redirect("/auth/complete-profile");
  }

  redirect(getDashboardUrl(session.user.role));
}
