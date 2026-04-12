import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma.js";
import { Role } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set");
}
const JWT_SECRET_STR: string = JWT_SECRET;

export async function registerUser(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  institution: string,
  country: string,
  role: Role,
) {
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) throw new Error("EMAIL_ALREADY_EXISTS");

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
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

  return user;
}

export async function loginUser(email: string, password: string) {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (!user) throw new Error("INVALID_CREDENTIALS");

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new Error("INVALID_CREDENTIALS");

  const token = jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    JWT_SECRET_STR,
    { expiresIn: "7d" },
  );

  return {
    token,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      institution: user.institution,
      country: user.country,
      role: user.role,
      createdAt: user.createdAt,
    },
  };
}
