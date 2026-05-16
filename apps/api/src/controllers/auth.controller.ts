import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { sendPasswordResetEmail } from "../lib/email";

const generateToken = (userId: string, role: string) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );
};

// Register
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters" });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userRole = role === "SELLER" ? "SELLER" : "BUYER";

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: userRole,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    if (userRole === "SELLER") {
      await prisma.seller.create({
        data: {
          userId: user.id,
          storeName: firstName + "'s Store",
        },
      });
    }

    const token = generateToken(user.id, user.role);

    res.status(201).json({
      message: "Account created successfully",
      token,
      user,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ error: "Account is deactivated" });
      return;
    }

    const token = generateToken(user.id, user.role);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get Current User
export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Forgot Password
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      res.json({ message: "If that email exists, a reset link has been sent." });
      return;
    }

    // Delete any existing tokens for this user
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    });

    const resetLink = `${process.env.CLIENT_URL || "http://localhost:3000"}/reset-password/${token}`;

    try {
      await sendPasswordResetEmail(email, user.firstName, resetLink);
    } catch {
      console.log("============================================");
      console.log("Password reset link for", email, ":");
      console.log(resetLink);
      console.log("============================================");
    }

    res.json({
      message: "If that email exists, a reset link has been sent.",
      ...(process.env.NODE_ENV !== "production" && { devLink: resetLink }),
    });
  } catch (error) {
    console.error("ForgotPassword error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Reset Password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      res.status(400).json({ error: "Password is required" });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters" });
      return;
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      res.status(400).json({ error: "Invalid or expired reset token" });
      return;
    }

    if (resetToken.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
      res.status(400).json({ error: "Reset token has expired" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.delete({ where: { id: resetToken.id } }),
    ]);

    res.json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    console.error("ResetPassword error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};