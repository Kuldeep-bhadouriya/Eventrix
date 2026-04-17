import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
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

    const existingUserWithRollNumber = await prisma.user.findFirst({
      where: {
        collegeRollNumber,
        NOT: { id: session.user.id },
      },
      select: { id: true },
    });

    if (existingUserWithRollNumber) {
      return NextResponse.json(
        { error: "This college roll number is already registered" },
        { status: 409 }
      );
    }

    let updatedUser;
    try {
      // Keep DB constraint handling for race conditions (two requests submitting same roll number at once).
      updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          phone,
          collegeRollNumber,
          semester,
          department,
          profileCompleted: true,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002" &&
        Array.isArray(error.meta?.target) &&
        error.meta.target.includes("collegeRollNumber")
      ) {
        return NextResponse.json(
          { error: "This college roll number is already registered" },
          { status: 409 }
        );
      }

      throw error;
    }

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
