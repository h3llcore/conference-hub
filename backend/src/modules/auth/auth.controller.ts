import type { Request, Response } from "express";
import { loginUser, registerUser } from "./auth.service.js";

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
      role?: "AUTHOR" | "REVIEWER" | "COMMITTEE";
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
      return res.status(400).json({
        message:
          "firstName, lastName, email, password, institution, country, role are required",
      });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "password must be at least 6 characters" });
    }

    const user = await registerUser(
      firstName,
      lastName,
      email,
      password,
      institution,
      country,
      role
    );

    return res.status(201).json({ user });
  } catch (e: any) {
    if (e.message === "EMAIL_ALREADY_EXISTS") {
      return res.status(409).json({ message: "email already exists" });
    }

    return res.status(500).json({ message: "server error" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email and password are required" });
    }

    const result = await loginUser(email, password);
    return res.json(result);
  } catch (e: any) {
    if (e.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({ message: "invalid credentials" });
    }

    return res.status(500).json({ message: "server error" });
  }
}