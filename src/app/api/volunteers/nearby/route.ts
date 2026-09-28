import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateHaversineDistance } from "@/lib/services/matching.service";
import { ResourceType } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || (user.role !== "VOLUNTEER" && user.role !== "ADMIN")) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Volunteer access required" } },
        { status: 403 }
      );
    }

    const profile = await prisma.volunteerProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: { code: "PROFILE_NOT_FOUND", message: "Volunteer profile not found" } },
        { status: 404 }
      );
    }

    let capabilities: ResourceType[] = [];
    try {
      capabilities = JSON.parse(profile.capabilities);
    } catch {
      capabilities = ["WATER", "FOOD", "TRANSPORT", "SHELTER", "OTHER"];
    }

    // Find all assignable requests (PENDING or VERIFIED or MATCHING)
    const requests = await prisma.emergencyRequest.findMany({
      where: {
        status: { in: ["PENDING", "VERIFIED", "MATCHING"] },
      },
      include: {
        requester: {
          select: { id: true, name: true, phone: true },
        },
      },
      orderBy: [
        { priorityScore: "desc" },
        { createdAt: "desc" },
      ],
    });

    // Calculate distance and filter by volunteer radius and capabilities
    const nearbyRequests = requests
      .map((req) => {
        const distanceKm = calculateHaversineDistance(
          profile.latitude,
          profile.longitude,
          req.latitude,
          req.longitude
        );

        const hasResourceCapability = capabilities.includes(req.resourceType as ResourceType);
        const isWithinRadius = distanceKm <= profile.serviceRadiusKm;

        return {
          ...req,
          distanceKm,
          isEligible: hasResourceCapability && isWithinRadius && profile.isVerified,
          isWithinRadius,
          hasResourceCapability,
        };
      })
      .filter((r) => r.isWithinRadius || r.priorityLevel === "CRITICAL") // Always show critical requests even if slightly outside
      .sort((a, b) => {
        // Priority first, then distance
        if (b.priorityScore !== a.priorityScore) {
          return b.priorityScore - a.priorityScore;
        }
        return a.distanceKm - b.distanceKm;
      });

    return NextResponse.json({
      success: true,
      data: {
        profile,
        requests: nearbyRequests,
      },
    });
  } catch (error: any) {
    console.error("Fetch nearby requests error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
