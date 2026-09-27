import { prisma } from "../prisma";
import { MatchCandidate, ResourceType } from "@/types";

/**
 * Calculates Great-Circle distance between two points on Earth using the Haversine formula (in kilometers).
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

export class MatchingService {
  /**
   * Finds and ranks eligible, verified community volunteers for a given emergency request.
   */
  public static async findMatchesForRequest(requestId: string): Promise<MatchCandidate[]> {
    const request = await prisma.emergencyRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new Error(`Request ${requestId} not found.`);
    }

    return this.findCandidates({
      latitude: request.latitude,
      longitude: request.longitude,
      resourceType: request.resourceType as ResourceType,
      priorityLevel: request.priorityLevel as "NORMAL" | "HIGH" | "CRITICAL",
    });
  }

  /**
   * Match scoring engine given location and resource specifications.
   */
  public static async findCandidates(params: {
    latitude: number;
    longitude: number;
    resourceType: ResourceType;
    priorityLevel: "NORMAL" | "HIGH" | "CRITICAL";
    maxResults?: number;
  }): Promise<MatchCandidate[]> {
    const { latitude, longitude, resourceType, priorityLevel, maxResults = 10 } = params;

    // Fetch verified, available volunteers with user details and active assignments
    const volunteers = await prisma.volunteerProfile.findMany({
      where: {
        isVerified: true,
        isAvailable: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
            address: true,
            avatar: true,
          },
        },
      },
    });

    // Fetch active assignments counts for each volunteer
    const activeAssignments = await prisma.assignment.groupBy({
      by: ["volunteerId"],
      where: {
        status: { in: ["ASSIGNED", "IN_PROGRESS"] },
      },
      _count: {
        _all: true,
      },
    });

    const activeCountMap = new Map<string, number>();
    for (const a of activeAssignments) {
      activeCountMap.set(a.volunteerId, a._count._all);
    }

    const candidates: MatchCandidate[] = [];

    for (const profile of volunteers) {
      // 1. Check capability match
      let capabilities: ResourceType[] = [];
      try {
        capabilities = JSON.parse(profile.capabilities);
      } catch {
        capabilities = [];
      }

      if (!capabilities.includes(resourceType)) {
        continue; // Does not have resource capability
      }

      // 2. Distance check
      const distanceKm = calculateHaversineDistance(
        latitude,
        longitude,
        profile.latitude,
        profile.longitude
      );

      if (distanceKm > profile.serviceRadiusKm) {
        continue; // Outside service radius
      }

      // 3. Score Breakdown Calculation
      // Distance Score (max 40 pts)
      const distRatio = Math.max(0, 1 - distanceKm / profile.serviceRadiusKm);
      const distanceScore = Math.round(distRatio * 40);

      // Workload Score (max 25 pts)
      const currentActive = activeCountMap.get(profile.userId) || 0;
      let workloadScore = 25;
      if (currentActive === 1) workloadScore = 15;
      else if (currentActive === 2) workloadScore = 8;
      else if (currentActive >= 3) workloadScore = 2;

      // Resource Match Score (max 20 pts)
      const resourceMatchScore = 20;

      // Rating and Experience Score (max 10 pts)
      const ratingScore = Math.min(6, (profile.rating / 5.0) * 6);
      const experienceScore = Math.min(4, profile.completedAssignments * 0.4);
      const availabilityScore = Math.round(ratingScore + experienceScore);

      // Priority bonus (5 pts)
      const priorityBonus = priorityLevel === "CRITICAL" ? 5 : priorityLevel === "HIGH" ? 3 : 0;

      const totalScore = Math.min(
        100,
        distanceScore + workloadScore + resourceMatchScore + availabilityScore + priorityBonus
      );

      candidates.push({
        volunteer: {
          id: profile.id,
          userId: profile.userId,
          isVerified: profile.isVerified,
          isAvailable: profile.isAvailable,
          serviceRadiusKm: profile.serviceRadiusKm,
          capabilities,
          latitude: profile.latitude,
          longitude: profile.longitude,
          address: profile.address,
          completedAssignments: profile.completedAssignments,
          rating: profile.rating,
          bio: profile.bio,
          vehicleType: profile.vehicleType,
          verifiedAt: profile.verifiedAt?.toISOString() || null,
          createdAt: profile.createdAt.toISOString(),
          user: profile.user as any,
        },
        distanceKm,
        matchScore: totalScore,
        scoreBreakdown: {
          distanceScore,
          resourceMatchScore,
          availabilityScore,
          workloadScore,
          priorityBonus,
        },
      });
    }

    // Sort by highest score first, then by closest distance
    candidates.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return a.distanceKm - b.distanceKm;
    });

    return candidates.slice(0, maxResults);
  }
}
