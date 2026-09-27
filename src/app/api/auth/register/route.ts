import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["CITIZEN", "VOLUNTEER"]).default("CITIZEN"),
  phone: z.string().optional(),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  // Volunteer specific fields
  capabilities: z.array(z.string()).optional(),
  serviceRadiusKm: z.number().optional(),
  vehicleType: z.string().optional(),
  bio: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = registerSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: validated.error.errors[0]?.message || "Invalid input data",
            details: validated.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      password,
      role,
      phone,
      address,
      latitude,
      longitude,
      capabilities,
      serviceRadiusKm,
      vehicleType,
      bio,
    } = validated.data;

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EMAIL_ALREADY_EXISTS",
            message: "An account with this email address already exists.",
          },
        },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    // Create user and profile if volunteer
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
          role,
          phone: phone || null,
          address: address || null,
          latitude: latitude || 37.7749,
          longitude: longitude || -122.4194,
        },
      });

      if (role === "VOLUNTEER") {
        await tx.volunteerProfile.create({
          data: {
            userId: newUser.id,
            isVerified: false, // Must be verified by admin
            isAvailable: true,
            serviceRadiusKm: serviceRadiusKm || 10,
            capabilities: JSON.stringify(capabilities || ["WATER", "FOOD"]),
            latitude: latitude || 37.7749,
            longitude: longitude || -122.4194,
            address: address || null,
            vehicleType: vehicleType || "Car",
            bio: bio || null,
          },
        });

        // Notify admins of new pending volunteer
        await tx.notification.createMany({
          data: (await tx.user.findMany({ where: { role: "ADMIN" } })).map((adm) => ({
            userId: adm.id,
            title: "New Volunteer Awaiting Verification",
            message: `${name} has registered as a volunteer. Review profile to grant response access.`,
            type: "INFO",
            link: "/admin/volunteers",
          })),
        });
      }

      return newUser;
    });

    const token = await signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "CITIZEN" | "VOLUNTEER" | "ADMIN",
    });

    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          token,
        },
        message: "Account registered successfully",
      },
      { status: 201 }
    );

    // Set auth cookie
    response.cookies.set("resqlink_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error.message || "An unexpected error occurred during registration",
        },
      },
      { status: 500 }
    );
  }
}
