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

function getUserSelect() {
  return {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    institution: true,
    country: true,
    role: true,
    createdAt: true,
    academicDegree: true,
    academicTitle: true,
    orcid: true,
    orcidVerified: true,
    googleScholarUrl: true,
    bio: true,
  };
}

function normalizeOrcid(value?: string | null) {
  if (!value) return null;

  return value
    .trim()
    .replace("https://orcid.org/", "")
    .replace("http://orcid.org/", "");
}

function isValidOrcid(value: string) {
  return /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/i.test(value);
}

function buildOrcidState(payload: { action: "connect" | "login"; userId?: string }) {
  return jwt.sign(payload, process.env.JWT_SECRET || "dev_secret", {
    expiresIn: "10m",
  });
}

function verifyOrcidState(state: string) {
  return jwt.verify(state, process.env.JWT_SECRET || "dev_secret") as {
    action: "connect" | "login";
    userId?: string;
  };
}

function getOrcidConfig() {
  const clientId = process.env.ORCID_CLIENT_ID;
  const clientSecret = process.env.ORCID_CLIENT_SECRET;
  const redirectUri = process.env.ORCID_REDIRECT_URI;
  const baseUrl = process.env.ORCID_BASE_URL || "https://orcid.org";

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("ORCID environment variables are not configured");
  }

  return {
    clientId,
    clientSecret,
    redirectUri,
    baseUrl: baseUrl.replace(/\/$/, ""),
  };
}

function buildOrcidAuthorizeUrl(action: "connect" | "login", userId?: string) {
  const { clientId, redirectUri, baseUrl } = getOrcidConfig();

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    scope: "/authenticate",
    redirect_uri: redirectUri,
    state: buildOrcidState({ action, userId }),
  });

  return `${baseUrl}/oauth/authorize?${params.toString()}`;
}

async function exchangeOrcidCode(code: string) {
  const { clientId, clientSecret, redirectUri, baseUrl } = getOrcidConfig();

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });

  const response = await fetch(`${baseUrl}/oauth/token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const data = (await response.json()) as {
    access_token?: string;
    token_type?: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string;
    name?: string;
    orcid?: string;
    error?: string;
    error_description?: string;
  };

  if (!response.ok || !data.orcid) {
    throw new Error(data.error_description || data.error || "ORCID authorization failed");
  }

  return data;
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
      academicDegree,
      academicTitle,
      orcid,
      googleScholarUrl,
      bio,
    } = req.body as {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      institution?: string;
      country?: string;
      role?: Role;
      academicDegree?: string;
      academicTitle?: string;
      orcid?: string;
      googleScholarUrl?: string;
      bio?: string;
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

    const normalizedOrcid = normalizeOrcid(orcid);

    if (normalizedOrcid && !isValidOrcid(normalizedOrcid)) {
      return res.status(400).json({
        message: "ORCID must have format 0000-0000-0000-0000",
      });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }

    if (normalizedOrcid) {
      const existingOrcid = await prisma.user.findUnique({
        where: { orcid: normalizedOrcid },
      });

      if (existingOrcid) {
        return res.status(409).json({ message: "ORCID already connected" });
      }
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
        academicDegree: academicDegree?.trim() || null,
        academicTitle: academicTitle?.trim() || null,
        orcid: normalizedOrcid,
        orcidVerified: false,
        googleScholarUrl: googleScholarUrl?.trim() || null,
        bio: bio?.trim() || null,
      },
      select: getUserSelect(),
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

    const safeUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: getUserSelect(),
    });

    return res.json({
      token,
      user: safeUser,
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
      select: getUserSelect(),
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

export async function updateProfile(req: Request, res: Response) {
  try {
    const payload = (req as any).user as { sub: string };

    if (!payload?.sub) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      firstName,
      lastName,
      institution,
      country,
      academicDegree,
      academicTitle,
      orcid,
      googleScholarUrl,
      bio,
    } = req.body as {
      firstName?: string;
      lastName?: string;
      institution?: string;
      country?: string;
      academicDegree?: string;
      academicTitle?: string;
      orcid?: string;
      googleScholarUrl?: string;
      bio?: string;
    };

    if (!firstName || !lastName || !institution || !country) {
      return res.status(400).json({
        message: "First name, last name, institution and country are required",
      });
    }

    const normalizedOrcid = normalizeOrcid(orcid);

    if (normalizedOrcid && !isValidOrcid(normalizedOrcid)) {
      return res.status(400).json({
        message: "ORCID must have format 0000-0000-0000-0000",
      });
    }

    if (normalizedOrcid) {
      const existingOrcid = await prisma.user.findFirst({
        where: {
          orcid: normalizedOrcid,
          NOT: { id: payload.sub },
        },
      });

      if (existingOrcid) {
        return res.status(409).json({ message: "ORCID already connected" });
      }
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        orcid: true,
        orcidVerified: true,
      },
    });

    const user = await prisma.user.update({
      where: { id: payload.sub },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        institution: institution.trim(),
        country: country.trim(),
        academicDegree: academicDegree?.trim() || null,
        academicTitle: academicTitle?.trim() || null,
        orcid: normalizedOrcid,
        orcidVerified:
          normalizedOrcid && currentUser?.orcid === normalizedOrcid
            ? currentUser.orcidVerified
            : false,
        googleScholarUrl: googleScholarUrl?.trim() || null,
        bio: bio?.trim() || null,
      },
      select: getUserSelect(),
    });

    return res.json({ user });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getOrcidConnectUrl(req: Request, res: Response) {
  try {
    const payload = (req as any).user as { sub: string };

    if (!payload?.sub) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const url = buildOrcidAuthorizeUrl("connect", payload.sub);

    return res.json({ url });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({
      message: e.message || "ORCID configuration error",
    });
  }
}

export async function getOrcidLoginUrl(req: Request, res: Response) {
  try {
    const url = buildOrcidAuthorizeUrl("login");

    return res.json({ url });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({
      message: e.message || "ORCID configuration error",
    });
  }
}

export async function orcidCallback(req: Request, res: Response) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  try {
    const { code, state } = req.query as {
      code?: string;
      state?: string;
    };

    if (!code || !state) {
      return res.redirect(`${frontendUrl}/orcid/callback?error=missing_code`);
    }

    const statePayload = verifyOrcidState(state);
    const orcidData = await exchangeOrcidCode(code);
    const orcid = normalizeOrcid(orcidData.orcid);

    if (!orcid) {
      return res.redirect(`${frontendUrl}/orcid/callback?error=orcid_not_found`);
    }

    if (statePayload.action === "connect") {
      if (!statePayload.userId) {
        return res.redirect(`${frontendUrl}/orcid/callback?error=invalid_state`);
      }

      const existingOrcid = await prisma.user.findFirst({
        where: {
          orcid,
          NOT: { id: statePayload.userId },
        },
      });

      if (existingOrcid) {
        return res.redirect(`${frontendUrl}/profile?orcid=already_connected`);
      }

      await prisma.user.update({
        where: { id: statePayload.userId },
        data: {
          orcid,
          orcidVerified: true,
        },
      });

      return res.redirect(`${frontendUrl}/profile?orcid=connected`);
    }

    const user = await prisma.user.findUnique({
      where: { orcid },
    });

    if (!user) {
      return res.redirect(`${frontendUrl}/orcid/callback?error=user_not_found`);
    }

    const token = signToken(user);

    return res.redirect(
      `${frontendUrl}/orcid/callback?token=${encodeURIComponent(token)}`,
    );
  } catch (e) {
    console.error(e);
    return res.redirect(`${frontendUrl}/orcid/callback?error=orcid_failed`);
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
        academicDegree: true,
        academicTitle: true,
        orcid: true,
        orcidVerified: true,
        googleScholarUrl: true,
      },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    });

    return res.json({ reviewers });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
}