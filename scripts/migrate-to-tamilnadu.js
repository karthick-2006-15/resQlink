const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting Tamil Nadu geographic migration for ResQLink...");

  // 1. Update Admins
  await prisma.user.updateMany({
    where: { role: "ADMIN" },
    data: {
      address: "Tamil Nadu State Disaster Management Authority (TNSDMA), Chepauk, Chennai",
      latitude: 13.0645,
      longitude: 80.2801,
    },
  });
  console.log("Updated Admin headquarters to Chennai, TN.");

  // 2. Specific Citizens
  const citizenUpdates = [
    { email: "demo.citizen@example.com", address: "14 Velachery Main Rd, Velachery, Chennai", lat: 12.9791, lng: 80.2206 },
    { email: "david.kim@example.com", address: "42 2nd Ave, Anna Nagar, Chennai", lat: 13.0850, lng: 80.2101 },
    { email: "maria.gonzales@example.com", address: "88 Luz Church Rd, Mylapore, Chennai", lat: 13.0368, lng: 80.2676 },
    { email: "robert.chang@example.com", address: "25 Cross Cut Rd, Gandhipuram, Coimbatore", lat: 11.0168, lng: 76.9558 },
    { email: "aisha.patel@example.com", address: "12 Goripalayam Main Rd, Madurai", lat: 9.9252, lng: 78.1198 },
  ];

  for (const c of citizenUpdates) {
    await prisma.user.updateMany({
      where: { email: c.email },
      data: { address: c.address, latitude: c.lat, longitude: c.lng },
    });
  }
  console.log("Updated primary citizen profiles.");

  // 3. Volunteer Locations Across Tamil Nadu
  const volunteerLocations = [
    { address: "Kathipara Junction, Guindy, Chennai", lat: 13.0067, lng: 80.2021 },
    { address: "105 Usman Road, T. Nagar, Chennai", lat: 13.0418, lng: 80.2341 },
    { address: "77 GST Road, Tambaram, Chennai", lat: 12.9249, lng: 80.1000 },
    { address: "Sardar Patel Rd, Adyar, Chennai", lat: 13.0012, lng: 80.2565 },
    { address: "OMR IT Expressway, Sholinganallur, Chennai", lat: 12.9010, lng: 80.2279 },
    { address: "DB Road, RS Puram, Coimbatore", lat: 11.0089, lng: 76.9426 },
    { address: "Amma Mandapam Rd, Srirangam, Trichy", lat: 10.8622, lng: 78.6948 },
    { address: "80 Feet Rd, Anna Nagar, Madurai", lat: 9.9197, lng: 78.1460 },
    { address: "Sub-Jail Rd, Cuddalore Old Town", lat: 11.7480, lng: 79.7714 },
    { address: "Junction Main Rd, Suramangalam, Salem", lat: 11.6643, lng: 78.1460 },
    { address: "Trivandrum Rd, Palayamkottai, Tirunelveli", lat: 8.7139, lng: 77.7567 },
    { address: "Beach Rd, Tuticorin Port, Thoothukudi", lat: 8.7642, lng: 78.1348 },
    { address: "Katpadi Main Rd, Vellore", lat: 12.9165, lng: 79.1325 },
    { address: "Poonamallee High Rd, Kilpauk, Chennai", lat: 13.0789, lng: 80.2456 },
  ];

  const volunteers = await prisma.user.findMany({
    where: { role: "VOLUNTEER" },
    include: { volunteerProfile: true },
  });

  for (let i = 0; i < volunteers.length; i++) {
    const loc = volunteerLocations[i % volunteerLocations.length];
    await prisma.user.update({
      where: { id: volunteers[i].id },
      data: { address: loc.address, latitude: loc.lat, longitude: loc.lng },
    });
    if (volunteers[i].volunteerProfile) {
      await prisma.volunteerProfile.update({
        where: { id: volunteers[i].volunteerProfile.id },
        data: { address: loc.address, latitude: loc.lat, longitude: loc.lng },
      });
    }
  }
  console.log(`Updated ${volunteers.length} volunteer stations across Tamil Nadu.`);

  // 4. Tamil Nadu Hotspot Request Coordinates
  const tnHotspots = [
    { city: "Chennai (Velachery)", address: "14 Velachery Main Rd, Chennai", lat: 12.9791, lng: 80.2206 },
    { city: "Chennai (Anna Nagar)", address: "42 2nd Ave, Anna Nagar, Chennai", lat: 13.0850, lng: 80.2101 },
    { city: "Chennai (Mylapore)", address: "88 Luz Church Rd, Mylapore, Chennai", lat: 13.0368, lng: 80.2676 },
    { city: "Chennai (T. Nagar)", address: "105 Usman Road, T. Nagar, Chennai", lat: 13.0418, lng: 80.2341 },
    { city: "Chennai (Tambaram)", address: "77 GST Road, Tambaram, Chennai", lat: 12.9249, lng: 80.1000 },
    { city: "Chennai (Guindy)", address: "Kathipara Junction Area, Guindy, Chennai", lat: 13.0067, lng: 80.2021 },
    { city: "Chennai (Porur)", address: "Mount Poonamallee Rd, Porur, Chennai", lat: 13.0382, lng: 80.1565 },
    { city: "Chennai (OMR)", address: "OMR IT Corridor, Sholinganallur, Chennai", lat: 12.9010, lng: 80.2279 },
    { city: "Chennai (Perambur)", address: "Perambur Barracks Rd, Chennai", lat: 13.1075, lng: 80.2334 },
    { city: "Chennai (Ambattur)", address: "Ambattur Industrial Estate, Chennai", lat: 13.1143, lng: 80.1548 },
    { city: "Coimbatore (Gandhipuram)", address: "Cross Cut Rd, Gandhipuram, Coimbatore", lat: 11.0168, lng: 76.9558 },
    { city: "Coimbatore (RS Puram)", address: "DB Road, RS Puram, Coimbatore", lat: 11.0089, lng: 76.9426 },
    { city: "Madurai (Goripalayam)", address: "Goripalayam Junction, Madurai", lat: 9.9252, lng: 78.1198 },
    { city: "Madurai (Anna Nagar)", address: "80 Feet Rd, Anna Nagar, Madurai", lat: 9.9197, lng: 78.1460 },
    { city: "Tiruchirappalli (Srirangam)", address: "Amma Mandapam Rd, Srirangam, Trichy", lat: 10.8622, lng: 78.6948 },
    { city: "Tiruchirappalli (Thillai Nagar)", address: "Main Rd, Thillai Nagar, Trichy", lat: 10.8271, lng: 78.6890 },
    { city: "Salem (Suramangalam)", address: "Junction Main Rd, Suramangalam, Salem", lat: 11.6643, lng: 78.1460 },
    { city: "Cuddalore (Old Town)", address: "Sub-Jail Rd, Cuddalore Old Town", lat: 11.7480, lng: 79.7714 },
    { city: "Tirunelveli (Palayamkottai)", address: "Trivandrum Rd, Palayamkottai, Tirunelveli", lat: 8.7139, lng: 77.7567 },
    { city: "Thoothukudi (Port)", address: "Beach Rd, Tuticorin Port, Thoothukudi", lat: 8.7642, lng: 78.1348 },
    { city: "Vellore (Katpadi)", address: "Katpadi Main Rd, Vellore", lat: 12.9165, lng: 79.1325 },
  ];

  const allRequests = await prisma.emergencyRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  for (let i = 0; i < allRequests.length; i++) {
    const spot = tnHotspots[i % tnHotspots.length];
    // Add small jitter for realistic scatter
    const latJitter = ((i * 13) % 20 - 10) * 0.001;
    const lngJitter = ((i * 17) % 20 - 10) * 0.001;

    await prisma.emergencyRequest.update({
      where: { id: allRequests[i].id },
      data: {
        address: spot.address,
        latitude: spot.lat + latJitter,
        longitude: spot.lng + lngJitter,
      },
    });
  }
  console.log(`Updated ${allRequests.length} emergency requests to Tamil Nadu coordinates!`);

  console.log("Migration to Tamil Nadu completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
