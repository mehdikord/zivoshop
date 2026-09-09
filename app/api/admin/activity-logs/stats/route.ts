import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";

export async function GET() {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [totalLogs, todayLogs, adminLogs, userLogs, thisWeekLogs] = await Promise.all([
    prisma.activityLog.count(),
    prisma.activityLog.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.activityLog.count({ where: { userType: "admin" } }),
    prisma.activityLog.count({ where: { userType: "user" } }),
    prisma.activityLog.count({ where: { createdAt: { gte: weekAgo } } }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      totalLogs,
      todayLogs,
      adminLogs,
      userLogs,
      thisWeekLogs,
    },
  });
}
