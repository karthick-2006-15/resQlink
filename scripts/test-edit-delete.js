const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  console.log("Testing Citizen Edit and Delete functionality in Prisma...");

  // Find a citizen
  const citizen = await prisma.user.findFirst({ where: { role: "CITIZEN" } });
  if (!citizen) throw new Error("No citizen found");

  // 1. Create a temporary request
  const testReq = await prisma.emergencyRequest.create({
    data: {
      requesterId: citizen.id,
      resourceType: "WATER",
      title: "Test Edit Delete Water Request",
      description: "Original description: Water needed for test verification",
      quantity: "5 gallons",
      peopleAffected: 2,
      urgency: "NORMAL",
      priorityScore: 28,
      priorityLevel: "NORMAL",
      status: "PENDING",
      address: "123 Test St, Chennai",
      latitude: 13.0827,
      longitude: 80.2707,
    },
  });
  console.log("Created test request:", testReq.id, testReq.title);

  // 2. Test Editing the request
  const updatedReq = await prisma.emergencyRequest.update({
    where: { id: testReq.id },
    data: {
      title: "Updated Test Water & Rations",
      quantity: "20 gallons",
      peopleAffected: 6,
      urgency: "HIGH",
      priorityScore: 65,
      priorityLevel: "HIGH",
    },
  });
  console.log("Edited test request:", updatedReq.id, {
    title: updatedReq.title,
    quantity: updatedReq.quantity,
    peopleAffected: updatedReq.peopleAffected,
    priorityLevel: updatedReq.priorityLevel,
  });

  // 3. Test Deleting the request
  await prisma.emergencyRequest.delete({
    where: { id: testReq.id },
  });
  const deletedCheck = await prisma.emergencyRequest.findUnique({
    where: { id: testReq.id },
  });
  console.log("Deletion verified:", deletedCheck === null ? "SUCCESS (Record cleanly removed)" : "FAILED");

  await prisma.$disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
