import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  signAccessToken,
  signRefreshToken,
  validateEmail,
  validateUsername,
  validatePasswordStrength,
} from "@/lib/auth";
import { handleApiError, ConflictError, ValidationError } from "@/lib/error-handler";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, username, password, full_name } = body;

    // Validate required fields
    if (!email || !username || !password) {
      throw new ValidationError("Email, username, and password are required");
    }

    if (!validateEmail(email)) {
      throw new ValidationError("Invalid email format");
    }

    if (!validateUsername(username)) {
      throw new ValidationError(
        "Username must be 3-50 characters, alphanumeric, underscores, or hyphens"
      );
    }

    if (!validatePasswordStrength(password)) {
      throw new ValidationError(
        "Password must be at least 8 characters with uppercase, lowercase, and digit"
      );
    }

    // Check for existing user
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictError("Email already registered");
      }
      throw new ConflictError("Username already taken");
    }

    // Create user
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        fullName: full_name || null,
      },
    });

    // Generate tokens
    const accessToken = await signAccessToken(user.id);
    const refreshToken = await signRefreshToken(user.id);

    return NextResponse.json(
      {
        message: "Registration successful",
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          full_name: user.fullName,
          avatar_url: user.avatarUrl,
          bio: user.bio,
          is_verified: user.isVerified,
          created_at: user.createdAt.toISOString(),
          last_login: null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
