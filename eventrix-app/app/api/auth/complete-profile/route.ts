import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { phone, college, yearOfStudy, department } = body;

    // Validate required fields
    if (!phone || !college || !yearOfStudy) {
      return NextResponse.json(
        { error: "Phone, college, and year of study are required" },
        { status: 400 }
      );
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        phone,
        college,
        yearOfStudy,
        department: department || null,
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
