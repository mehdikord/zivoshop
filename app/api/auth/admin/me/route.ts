import { verifyAdminToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/api-response";

export async function GET() {
  const payload = await verifyAdminToken();
  if (!payload) {
    return apiError("Unauthorized", 401);
  }

  const admin = await prisma.admin.findUnique({
    where: { id: BigInt(payload.id) },
    select: {
      id: true,
      name: true,
      mobile: true,
      email: true,
      isActive: true,
      createdAt: true,
    },
  });

  if (!admin) {
    return apiError("Admin not found", 404);
  }

  return apiSuccess({
    ...admin,
    id: admin.id.toString(),
  });
}
