import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RequestService } from "@/lib/services/request.service";
import { z } from "zod";

const createRequestSchema = z.object({
  resourceType: z.enum(["WATER", "FOOD", "TRANSPORT", "SHELTER", "OTHER"]),
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000),
  quantity: z.string().min(1, "Quantity specification is required"),
  peopleAffected: z.number().int().min(1, "At least 1 person must be affected"),
  urgency: z.enum(["NORMAL", "HIGH", "CRITICAL"]),
  address: z.string().min(3, "Delivery/Request address is required"),
  latitude: z.number(),
  longitude: z.number(),
  imageUrl: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Login required to submit request" } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validated = createRequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: validated.error.errors[0]?.message || "Validation failed",
            details: validated.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    // Check for duplicate pending requests by same user for same resource
    const duplicate = await prisma.emergencyRequest.findFirst({
      where: {
        requesterId: user.id,
        resourceType: validated.data.resourceType,
        status: { in: ["PENDING", "VERIFIED", "MATCHING"] },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DUPLICATE_ACTIVE_REQUEST",
            message: `You already have an active request for ${validated.data.resourceType}. You can track or update your existing request.`,
          },
        },
        { status: 409 }
      );
    }

    const newRequest = await RequestService.createRequest(
      {
        requesterId: user.id,
        ...validated.data,
      },
      user.name
    );

    return NextResponse.json(
      {
        success: true,
        data: { request: newRequest },
        message: "Emergency request submitted successfully. Priority calculated.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create request error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: error.message || "Failed to create emergency request" },
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const user = await getCurrentUser(req);

    const status = searchParams.get("status");
    const resource = searchParams.get("resource");
    const priority = searchParams.get("priority");
    const myRequests = searchParams.get("myRequests") === "true";
    const search = searchParams.get("search");
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "50", 10));
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (myRequests) {
      if (!user) {
        return NextResponse.json(
          { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
          { status: 401 }
        );
      }
      where.requesterId = user.id;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (resource && resource !== "ALL") {
      where.resourceType = resource;
    }

    if (priority && priority !== "ALL") {
      where.priorityLevel = priority;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { address: { contains: search } },
      ];
    }

    const [total, requests] = await Promise.all([
      prisma.emergencyRequest.count({ where }),
      prisma.emergencyRequest.findMany({
        where,
        include: {
          requester: {
            select: { id: true, name: true, email: true, phone: true },
          },
          assignments: {
            where: { status: { in: ["ASSIGNED", "IN_PROGRESS", "DELIVERED", "CONFIRMED"] } },
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
              volunteer: {
                select: { id: true, name: true, email: true, phone: true },
              },
            },
          },
        },
        orderBy: [
          { priorityScore: "desc" },
          { createdAt: "desc" },
        ],
        skip,
        take: limit,
      }),
    ]);

    const formattedRequests = requests.map((req) => ({
      ...req,
      currentAssignment: req.assignments[0] || null,
    }));

    return NextResponse.json({
      success: true,
      data: {
        requests: formattedRequests,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error("Fetch requests error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
