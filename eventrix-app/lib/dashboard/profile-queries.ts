import { prisma } from "@/lib/db";
import type { UserProfile } from "@/types/profile";

function isDatabaseAvailable() {
  return Boolean(process.env.DATABASE_URL);
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!isDatabaseAvailable()) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      emailVerified: true,
      phone: true,
      collegeRollNumber: true,
      semester: true,
      department: true,
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar ?? null,
    emailVerified: Boolean(user.emailVerified),
    phone: user.phone ?? null,
    collegeRollNumber: user.collegeRollNumber ?? null,
    semester: user.semester ?? null,
    department: user.department ?? null,
  };
}
