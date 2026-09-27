export type Role = "CITIZEN" | "VOLUNTEER" | "ADMIN";

export type ResourceType = "WATER" | "FOOD" | "TRANSPORT" | "SHELTER" | "OTHER";

export type UrgencyLevel = "NORMAL" | "HIGH" | "CRITICAL";
export type RequestUrgency = UrgencyLevel;

export type PriorityLevel = "NORMAL" | "HIGH" | "CRITICAL";

export type RequestStatus =
  | "PENDING"
  | "VERIFIED"
  | "MATCHING"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "DELIVERED"
  | "CONFIRMED"
  | "CLOSED"
  | "REJECTED"
  | "CANCELLED";

export type AssignmentStatus =
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "DELIVERED"
  | "CONFIRMED"
  | "CANCELLED";

export type DisputeStatus = "PENDING" | "RESOLVED" | "DISMISSED";

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
  address?: string | null;
  avatar?: string | null;
}

export interface VolunteerProfileData {
  id: string;
  userId: string;
  isVerified: boolean;
  isAvailable: boolean;
  serviceRadiusKm: number;
  capabilities: ResourceType[];
  latitude: number;
  longitude: number;
  address?: string | null;
  completedAssignments: number;
  rating: number;
  bio?: string | null;
  vehicleType?: string | null;
  verifiedAt?: string | null;
  createdAt: string;
  user?: UserSummary;
}

export interface EmergencyRequestData {
  id: string;
  requesterId: string;
  resourceType: ResourceType;
  title: string;
  description: string;
  quantity: string;
  peopleAffected: number;
  urgency: UrgencyLevel;
  priorityScore: number;
  priorityLevel: PriorityLevel;
  status: RequestStatus;
  address: string;
  latitude: number;
  longitude: number;
  imageUrl?: string | null;
  verifiedByAdminId?: string | null;
  verifiedAt?: string | null;
  assignedAt?: string | null;
  deliveredAt?: string | null;
  confirmedAt?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  requester?: UserSummary;
  assignments?: AssignmentData[];
  currentAssignment?: AssignmentData;
  distanceKm?: number; // Calculated on-the-fly for volunteer
}

export interface AssignmentData {
  id: string;
  requestId: string;
  volunteerId: string;
  status: AssignmentStatus;
  notes?: string | null;
  acceptedAt: string;
  startedAt?: string | null;
  deliveredAt?: string | null;
  completedAt?: string | null;
  request?: EmergencyRequestData;
  volunteer?: UserSummary & { volunteerProfile?: VolunteerProfileData | null };
}

export interface NotificationData {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "URGENT";
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}

export interface AuditLogData {
  id: string;
  actorId?: string | null;
  actorName: string;
  actorRole: string;
  action: string;
  entity: string;
  entityId: string;
  oldValue?: string | null;
  newValue?: string | null;
  ipAddress?: string | null;
  timestamp: string;
}

export interface MatchCandidate {
  volunteer: VolunteerProfileData & { user: UserSummary };
  distanceKm: number;
  matchScore: number;
  scoreBreakdown: {
    distanceScore: number;
    resourceMatchScore: number;
    availabilityScore: number;
    workloadScore: number;
    priorityBonus: number;
  };
}

export type ApiResponse<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: { code: string; message: string; details?: unknown } };
