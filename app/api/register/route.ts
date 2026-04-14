import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

import prisma from "@/lib/prismadb";

const VALID_ROLES = ["TOURIST", "GUIDE"];

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, password, role } = body;

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      hashedPassword,
      role: VALID_ROLES.includes(role) ? role : "TOURIST",
    },
  });

  return NextResponse.json(user);
}
