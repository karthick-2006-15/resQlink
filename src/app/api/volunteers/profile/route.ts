import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateProfileSchema = z.object({
  isAvailable: z.boolean().optional(),
  serviceRadiusKm: z.number().min(1).max(100).optional(),
  capabilities: z.array(z.string()).optional(),
  vehicleType: z.string().optional(),
  bio: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Login required" } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validated = updateProfileSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: validated.error.errors[0]?.message } },
        { status: 400 }
      );
    }

    const data: any = {};
    if (validated.data.isAvailable !== undefined) data.isAvailable = validated.data.isAvailable;
    if (validated.data.serviceRadiusKm !== undefined) data.serviceRadiusKm = validated.data.serviceRadiusKm;
    if (validated.data.capabilities !== undefined) data.capabilities = JSON.stringify(validated.data.capabilities);
    if (validated.data.vehicleType !== undefined) data.vehicleType = validated.data.vehicleType;
    if (validated.data.bio !== undefined) data.bio = validated.data.bio;
    if (validated.data.latitude !== undefined) data.latitude = validated.data.latitude;
    if (validated.data.longitude !== undefined) data.longitude = validated.data.longitude;
    if (validated.data.address !== undefined) data.address = validated.data.address;

    const updatedProfile = await prisma.volunteerProfile.update({
      where: { userId: user.id },
      data,
    });

    return NextResponse.json({
      success: true,
      data: { profile: updatedProfile },
      message: "Volunteer profile updated successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
