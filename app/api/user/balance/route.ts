import { NextResponse } from "next/server";

import prisma from "@/lib/prismadb";
import getCurrentUser from "@/app/actions/get-current-user";

export async function GET() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: { tokenBalance: true },
  });

  return NextResponse.json({ tokenBalance: user?.tokenBalance ?? 0 });
}
