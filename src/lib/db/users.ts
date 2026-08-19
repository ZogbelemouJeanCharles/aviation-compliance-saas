import "server-only";
import { Prisma, type UserRole } from "@prisma/client";
import { prisma } from "./client";
import { hashPassword } from "@/lib/auth/password";
import { logAuditEntry } from "./audit";

export async function listUsers(companyId: string) {
  return prisma.user.findMany({
    where: { companyId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function createTeammate(
  companyId: string,
  actorUserId: string,
  data: { name: string; email: string; password: string; role: UserRole }
) {
  const passwordHash = await hashPassword(data.password);

  let user;
  try {
    user = await prisma.user.create({
      data: {
        companyId,
        name: data.name,
        email: data.email,
        role: data.role,
        passwordHash,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new Error("A user with this email already exists.");
    }
    throw error;
  }

  await logAuditEntry({
    companyId,
    actorUserId,
    entityType: "USER",
    entityId: user.id,
    action: "TEAMMATE_INVITED",
    details: { email: data.email, role: data.role },
  });

  return user;
}
