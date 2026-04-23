import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma.js";
import { Role } from "@prisma/client";

function signToken(user: { id: string; email: string; role: Role }) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || "dev_secret",
    { expiresIn: "7d" },
  );
}

export async function register(req: Request, res: Response) {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      institution,
      country,
      role,
    } = req.body as {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      institution?: string;
      country?: string;
      role?: Role;
    };

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !institution ||
      !country ||
      !role
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        password: passwordHash,
        institution: institution.trim(),
        country: country.trim(),
        role,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        institution: true,
        country: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(201).json({ user });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);

    return res.json({
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        institution: user.institution,
        country: user.country,
        role: user.role,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function me(req: Request, res: Response) {
  try {
    const payload = (req as any).user as { sub: string };

    if (!payload?.sub) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        institution: true,
        country: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getReviewers(req: Request, res: Response) {
  try {
    const reviewers = await prisma.user.findMany({
      where: { role: "REVIEWER" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        institution: true,
        country: true,
      },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    });

    return res.json({ reviewers });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
}