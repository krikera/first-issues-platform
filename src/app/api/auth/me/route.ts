import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/auth";
import { handleApiError, AuthenticationError, ValidationError } from "@/lib/error-handler";

// GET /api/auth/me — get profile
export async function GET(request: Request) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) throw new AuthenticationError();

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) throw new AuthenticationError("User not found or account is deactivated");

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        full_name: user.fullName,
        avatar_url: user.avatarUrl,
        bio: user.bio,
        is_verified: user.isVerified,
        created_at: user.createdAt.toISOString(),
        last_login: user.lastLogin?.toISOString() || null,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/auth/me — update profile
export async function PUT(request: Request) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) throw new AuthenticationError();

    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser || !existingUser.isActive) {
      throw new AuthenticationError("User not found or account is deactivated");
    }

    const body = await request.json();
    const { full_name, bio, avatar_url } = body;

    // Validate field lengths
    if (full_name && full_name.length > 100) {
      throw new ValidationError("Full name must be less than 100 characters");
    }
    if (bio && bio.length > 500) {
      throw new ValidationError("Bio must be less than 500 characters");
    }
    if (avatar_url) {
      if (typeof avatar_url !== "string" || avatar_url.length > 500) {
        throw new ValidationError("Invalid avatar URL format");
      }
      try {
        const parsed = new URL(avatar_url);
        if (!["http:", "https:"].includes(parsed.protocol)) {
          throw new ValidationError("Avatar URL must use http or https");
        }
      } catch {
        if (!avatar_url.startsWith("/")) {
          throw new ValidationError("Invalid avatar URL");
        }
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(full_name !== undefined ? { fullName: full_name } : {}),
        ...(bio !== undefined ? { bio } : {}),
        ...(avatar_url !== undefined ? { avatarUrl: avatar_url } : {}),
      },
    });

    return NextResponse.json({
      user: {
        id: updated.id,
        email: updated.email,
        username: updated.username,
        full_name: updated.fullName,
        avatar_url: updated.avatarUrl,
        bio: updated.bio,
        is_verified: updated.isVerified,
        created_at: updated.createdAt.toISOString(),
        last_login: updated.lastLogin?.toISOString() || null,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
