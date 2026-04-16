import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { profileCompletionSchema } from "@/lib/validation-schemas";
import { enforceMutationGuards } from "@/lib/security/request-guards";

export async function POST(request: NextRequest) {
  try {
    const guardResponse = await enforceMutationGuards(request, { rateLimit: "moderate" });
    if (guardResponse) return guardResponse;

    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate with Zod schema
    const validationResult = profileCompletionSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { phone, collegeRollNumber, semester, department } = validationResult.data;

    // Update user profile with new fields
    // Note: If TypeScript shows an error here, restart the TS server - Prisma client has been regenerated
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        phone,
        collegeRollNumber,
        semester,
        department,
        profileCompleted: true,
      },
    });

    return NextResponse.json({
      message: "Profile completed successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        profileCompleted: updatedUser.profileCompleted,
      },
    });
  } catch (error) {
    console.error("Profile completion error:", error);
    return NextResponse.json(
      { error: "Failed to complete profile" },
      { status: 500 }
    );
  }
}
