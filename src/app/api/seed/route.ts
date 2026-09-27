import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runDatabaseSeed } from "@/lib/seed-data";

export async function POST() {
  try {
    await runDatabaseSeed(prisma);
    return NextResponse.json({
      success: true,
      message: "Database successfully reset and re-seeded with demo data (27 active, 14 volunteers, 83 resolved).",
    });
  } catch (error: any) {
    console.error("Seed API error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SEED_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}
