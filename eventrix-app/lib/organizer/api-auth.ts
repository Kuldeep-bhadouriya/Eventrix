import { getServerSession } from "next-auth";
import { UserRole } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { AuthenticationError, AuthorizationError } from "@/lib/api";
import { checkPermission } from "@/lib/rbac";

export async function requireOrganizerApiSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new AuthenticationError("Authentication required");
  }

  if (!checkPermission(session.user.role, UserRole.ORGANIZER)) {
    throw new AuthorizationError("Organizer access required");
  }

  return session;
}
