import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  comparePassword,
  signAccessToken,
  signRefreshToken,
} from "@/lib/auth";
import { handleApiError, ValidationError, AuthenticationError } from "@/lib/error-handler";
import { isRateLimited, getClientIp } from "@/lib/rate-limiter";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (isRateLimited(`login:${ip}`, 10, 300)) { // 10 attempts per 5 minutes
      return NextResponse.json({ error: "Too many login attempts" }, { status: 429 });
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      throw new ValidationError("Email and password are required");
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AuthenticationError("Invalid email or password");
    }

    if (!user.isActive) {
      throw new AuthenticationError("Account has been deactivated");
    }

    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      throw new AuthenticationError("Invalid email or password");
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const accessToken = await signAccessToken(user.id);
    const refreshToken = await signRefreshToken(user.id);

    return NextResponse.json({
      message: "Login successful",
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
        last_login: new Date().toISOString(),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
