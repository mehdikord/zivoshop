import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";
import { ActivityActionLabels, SubjectTypeLabels } from "@/lib/activity-logger";

export async function GET(request: NextRequest) {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") ?? "20")));
  const search = searchParams.get("search") ?? "";
  const userType = searchParams.get("userType") ?? "";
  const action = searchParams.get("action") ?? "";
  const subjectType = searchParams.get("subjectType") ?? "";
  const dateFrom = searchParams.get("dateFrom") ?? "";
  const dateTo = searchParams.get("dateTo") ?? "";
  const sortBy = searchParams.get("sortBy") ?? "createdAt";
  const sortOrder = searchParams.get("sortOrder") ?? "desc";

  const where: Record<string, unknown> = {};

  // Filter by user type
  if (userType && (userType === "admin" || userType === "user")) {
    where.userType = userType;
  }

  // Filter by action
  if (action) {
    where.action = action;
  }

  // Filter by subject type
  if (subjectType) {
    where.subjectType = subjectType;
  }

  // Date range filter
  if (dateFrom || dateTo) {
    const createdAtFilter: Record<string, Date> = {};
    if (dateFrom) createdAtFilter.gte = new Date(dateFrom);
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      createdAtFilter.lte = to;
    }
    where.createdAt = createdAtFilter;
  }

  // Search in action and properties
  if (search) {
    const searchConditions: Record<string, unknown>[] = [
      { action: { contains: search } },
    ];
    // Also search in action labels
    const matchingActions = Object.entries(ActivityActionLabels)
      .filter(([, label]) => label.includes(search))
      .map(([key]) => key);
    if (matchingActions.length > 0) {
      searchConditions.push({ action: { in: matchingActions } });
    }
    where.OR = searchConditions;
  }

  const allowedSort = ["createdAt", "action", "userType"];
  const actualSort = allowedSort.includes(sortBy) ? sortBy : "createdAt";

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { [actualSort]: sortOrder === "asc" ? "asc" : "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.activityLog.count({ where }),
  ]);

  // Batch-resolve admin/user names for the logs in this page
  const adminIds = new Set<string>();
  const userIds = new Set<string>();
  for (const log of logs) {
    if (log.userType === "admin") adminIds.add(log.userId.toString());
    else userIds.add(log.userId.toString());
  }

  const [admins, users] = await Promise.all([
    adminIds.size > 0
      ? prisma.admin.findMany({
          where: { id: { in: [...adminIds].map(BigInt) } },
          select: { id: true, name: true, mobile: true },
        })
      : [],
    userIds.size > 0
      ? prisma.user.findMany({
          where: { id: { in: [...userIds].map(BigInt) } },
          select: { id: true, name: true, mobile: true },
        })
      : [],
  ]);

  const adminMap = new Map(admins.map((a) => [a.id.toString(), { id: a.id.toString(), name: a.name, mobile: a.mobile }]));
  const userMap = new Map(users.map((u) => [u.id.toString(), { id: u.id.toString(), name: u.name, mobile: u.mobile }]));

  return NextResponse.json({
    success: true,
    data: logs.map((log) => {
      const uid = log.userId.toString();
      const actor = log.userType === "admin" ? adminMap.get(uid) : userMap.get(uid);
      return {
        id: log.id.toString(),
        userType: log.userType,
        userId: uid,
        actorName: actor?.name ?? null,
        actorMobile: actor?.mobile ?? null,
        action: log.action,
        actionLabel: ActivityActionLabels[log.action] ?? log.action,
        subjectType: log.subjectType,
        subjectTypeLabel: log.subjectType ? (SubjectTypeLabels[log.subjectType] ?? log.subjectType) : null,
        subjectId: log.subjectId?.toString() ?? null,
        properties: log.properties,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        createdAt: log.createdAt?.toISOString() ?? null,
      };
    }),
    meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  });
}
