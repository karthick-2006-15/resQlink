import { PriorityLevel, UrgencyLevel, ResourceType } from "@/types";

export interface PriorityCalculationInput {
  urgency: UrgencyLevel;
  peopleAffected: number;
  resourceType: ResourceType;
  createdAt?: Date;
}

export interface PriorityCalculationResult {
  priorityScore: number;
  priorityLevel: PriorityLevel;
  breakdown: {
    urgencyScore: number;
    peopleScore: number;
    resourceScore: number;
    waitScore: number;
  };
}

/**
 * Priority Scoring Engine
 * Computes an objective urgency score between 0 and 100 based on:
 * - Urgency rating (Critical, High, Normal)
 * - Number of vulnerable people affected
 * - Resource criticality (Water & Shelter lead disaster survivability)
 * - Elapsed wait time (aging factor to prevent request starvation)
 */
export class PriorityService {
  public static calculate(input: PriorityCalculationInput): PriorityCalculationResult {
    const { urgency, peopleAffected, resourceType, createdAt } = input;

    // 1. Urgency Base Score (max 40 pts)
    let urgencyScore = 15;
    if (urgency === "CRITICAL") urgencyScore = 40;
    else if (urgency === "HIGH") urgencyScore = 28;
    else urgencyScore = 15;

    // 2. People Affected Score (max 30 pts)
    let peopleScore = 5;
    if (peopleAffected >= 20) peopleScore = 30;
    else if (peopleAffected >= 10) peopleScore = 24;
    else if (peopleAffected >= 5) peopleScore = 18;
    else if (peopleAffected >= 2) peopleScore = 10;
    else peopleScore = 5;

    // 3. Resource Criticality Score (max 20 pts)
    let resourceScore = 10;
    switch (resourceType) {
      case "WATER":
        resourceScore = 20; // Critical for immediate survival
        break;
      case "SHELTER":
        resourceScore = 18; // Exposure risk
        break;
      case "FOOD":
        resourceScore = 15; // Sustenance
        break;
      case "TRANSPORT":
        resourceScore = 12; // Evacuation / mobility
        break;
      case "OTHER":
      default:
        resourceScore = 8;
        break;
    }

    // 4. Wait Time Aging Factor (max 10 pts)
    // Adds bonus points every hour request remains unaddressed
    let waitScore = 0;
    if (createdAt) {
      const waitHours = Math.max(0, (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60));
      waitScore = Math.min(10, Math.floor(waitHours * 2.5));
    }

    const totalRaw = urgencyScore + peopleScore + resourceScore + waitScore;
    const priorityScore = Math.min(100, Math.max(10, totalRaw));

    let priorityLevel: PriorityLevel = "NORMAL";
    if (priorityScore >= 75 || urgency === "CRITICAL") {
      priorityLevel = "CRITICAL";
    } else if (priorityScore >= 45 || urgency === "HIGH") {
      priorityLevel = "HIGH";
    } else {
      priorityLevel = "NORMAL";
    }

    return {
      priorityScore,
      priorityLevel,
      breakdown: {
        urgencyScore,
        peopleScore,
        resourceScore,
        waitScore,
      },
    };
  }
}
