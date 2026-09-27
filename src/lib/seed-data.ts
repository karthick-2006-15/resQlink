import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

export const TN_HOTSPOTS = [
  { city: "Chennai (Velachery)", address: "14 Velachery Main Rd, Velachery, Chennai", lat: 12.9791, lng: 80.2206 },
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

export async function runDatabaseSeed(prisma: PrismaClient) {
  console.log("Seeding ResQLink database with Tamil Nadu operational data...");

  // Clear existing records to ensure fresh demo state
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.deliveryDispute.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.emergencyRequest.deleteMany();
  await prisma.volunteerProfile.deleteMany();
  await prisma.user.deleteMany();

  const defaultPassword = await bcrypt.hash("password123", 10);

  // 1. Create Admins (Headquartered at TNSDMA Chennai)
  const admin1 = await prisma.user.create({
    data: {
      name: "Marcus Vance (Ops Lead)",
      email: "demo.admin@example.com",
      password: defaultPassword,
      role: "ADMIN",
      phone: "+91 94441 20001",
      address: "Tamil Nadu State Disaster Management Authority (TNSDMA), Chepauk, Chennai",
      latitude: 13.0645,
      longitude: 80.2801,
    },
  });

  const admin2 = await prisma.user.create({
    data: {
      name: "Elena Rostova (Incident Commander)",
      email: "elena.commander@example.com",
      password: defaultPassword,
      role: "ADMIN",
      phone: "+91 94441 20002",
      address: "Disaster Coordination Center, Ezhilagam, Chepauk, Chennai",
      latitude: 13.0652,
      longitude: 80.2810,
    },
  });

  // 2. Create Citizens across Tamil Nadu
  const citizenUsers = [
    {
      name: "Sarah Jenkins",
      email: "demo.citizen@example.com",
      phone: "+91 98401 23456",
      address: "14 Velachery Main Rd, Velachery, Chennai",
      latitude: 12.9791,
      longitude: 80.2206,
    },
    {
      name: "David Kim",
      email: "david.kim@example.com",
      phone: "+91 98402 34567",
      address: "42 2nd Ave, Anna Nagar, Chennai",
      latitude: 13.0850,
      longitude: 80.2101,
    },
    {
      name: "Maria Gonzales",
      email: "maria.gonzales@example.com",
      phone: "+91 98403 45678",
      address: "88 Luz Church Rd, Mylapore, Chennai",
      latitude: 13.0368,
      longitude: 80.2676,
    },
    {
      name: "Robert Chang",
      email: "robert.chang@example.com",
      phone: "+91 98404 56789",
      address: "25 Cross Cut Rd, Gandhipuram, Coimbatore",
      latitude: 11.0168,
      longitude: 76.9558,
    },
    {
      name: "Aisha Patel",
      email: "aisha.patel@example.com",
      phone: "+91 98405 67890",
      address: "12 Goripalayam Main Rd, Madurai",
      latitude: 9.9252,
      longitude: 78.1198,
    },
  ];

  const createdCitizens = [];
  for (const c of citizenUsers) {
    const user = await prisma.user.create({
      data: {
        ...c,
        password: defaultPassword,
        role: "CITIZEN",
      },
    });
    createdCitizens.push(user);
  }

  // 3. Create 14 Volunteers deployed across key Tamil Nadu response sectors
  const volunteerUsers = [
    {
      name: "Alex Rivera",
      email: "demo.volunteer@example.com",
      phone: "+91 97901 01234",
      address: "Kathipara Junction, Guindy, Chennai",
      latitude: 13.0067,
      longitude: 80.2021,
      capabilities: ["WATER", "FOOD", "TRANSPORT"],
      radius: 15.0,
      verified: true,
      available: true,
      completed: 18,
      rating: 4.9,
      vehicle: "SUV 4x4",
      bio: "Equipped with high-capacity cargo vehicle and rapid water purification packs for urban flood relief.",
    },
    {
      name: "Jordan Lee",
      email: "jordan.lee@example.com",
      phone: "+91 97902 12345",
      address: "105 Usman Road, T. Nagar, Chennai",
      latitude: 13.0418,
      longitude: 80.2341,
      capabilities: ["WATER", "FOOD"],
      radius: 10.0,
      verified: true,
      available: true,
      completed: 12,
      rating: 4.8,
      vehicle: "Cargo Van",
      bio: "Community food courier and emergency bulk water distributor across Central Chennai.",
    },
    {
      name: "Carlos Mendez",
      email: "carlos.mendez@example.com",
      phone: "+91 97903 23456",
      address: "77 GST Road, Tambaram, Chennai",
      latitude: 12.9249,
      longitude: 80.1000,
      capabilities: ["SHELTER", "FOOD", "OTHER"],
      radius: 20.0,
      verified: true,
      available: true,
      completed: 24,
      rating: 5.0,
      vehicle: "Truck",
      bio: "Disaster shelter setup specialist with heavy-duty tarps and emergency cots along South Chennai corridor.",
    },
    {
      name: "Maya Lin",
      email: "maya.lin@example.com",
      phone: "+91 97904 34567",
      address: "Sardar Patel Rd, Adyar, Chennai",
      latitude: 13.0012,
      longitude: 80.2565,
      capabilities: ["TRANSPORT", "WATER"],
      radius: 12.0,
      verified: true,
      available: true,
      completed: 9,
      rating: 4.7,
      vehicle: "Electric Minivan",
      bio: "Specializes in vulnerable elderly transport and emergency relocations near coastal zones.",
    },
    {
      name: "Brian O'Connor",
      email: "brian.oconnor@example.com",
      phone: "+91 97905 45678",
      address: "OMR IT Expressway, Sholinganallur, Chennai",
      latitude: 12.9010,
      longitude: 80.2279,
      capabilities: ["WATER", "FOOD", "SHELTER"],
      radius: 18.0,
      verified: true,
      available: true,
      completed: 15,
      rating: 4.9,
      vehicle: "Pickup Truck",
      bio: "High-clearance 4WD vehicle for low-lying inundated pockets in OMR and Perungudi.",
    },
    {
      name: "Samantha Wright",
      email: "samantha.wright@example.com",
      phone: "+91 97906 56789",
      address: "DB Road, RS Puram, Coimbatore",
      latitude: 11.0089,
      longitude: 76.9426,
      capabilities: ["WATER", "FOOD"],
      radius: 15.0,
      verified: true,
      available: true,
      completed: 11,
      rating: 4.8,
      vehicle: "Crossover",
      bio: "Western Tamil Nadu response coordinator with emergency food reserves and first aid kits.",
    },
    {
      name: "Derrick Hayes",
      email: "derrick.hayes@example.com",
      phone: "+91 97907 67890",
      address: "Amma Mandapam Rd, Srirangam, Trichy",
      latitude: 10.8622,
      longitude: 78.6948,
      capabilities: ["SHELTER", "OTHER"],
      radius: 20.0,
      verified: true,
      available: true,
      completed: 7,
      rating: 4.6,
      vehicle: "Utility Van",
      bio: "Cauvery delta riverbank emergency volunteer with tarps, sandbags, and emergency lighting.",
    },
    {
      name: "Grace Hopper-Wong",
      email: "grace.hw@example.com",
      phone: "+91 97908 78901",
      address: "80 Feet Rd, Anna Nagar, Madurai",
      latitude: 9.9197,
      longitude: 78.1460,
      capabilities: ["FOOD", "WATER", "TRANSPORT"],
      radius: 16.0,
      verified: true,
      available: true,
      completed: 21,
      rating: 5.0,
      vehicle: "Mini Truck",
      bio: "Southern district logistics coordinator for bulk non-perishable rations.",
    },
    {
      name: "Liam Murphy",
      email: "liam.murphy@example.com",
      phone: "+91 97909 89012",
      address: "Sub-Jail Rd, Cuddalore Old Town",
      latitude: 11.7480,
      longitude: 79.7714,
      capabilities: ["TRANSPORT", "WATER"],
      radius: 25.0,
      verified: true,
      available: true,
      completed: 14,
      rating: 4.9,
      vehicle: "4WD Pickup",
      bio: "Coastal cyclone rapid responder with inflatable raft and high-water vehicle.",
    },
    {
      name: "Zoe Kravitz-Miller",
      email: "zoe.km@example.com",
      phone: "+91 97910 90123",
      address: "Junction Main Rd, Suramangalam, Salem",
      latitude: 11.6643,
      longitude: 78.1460,
      capabilities: ["TRANSPORT", "WATER", "FOOD"],
      radius: 18.0,
      verified: true,
      available: true,
      completed: 8,
      rating: 4.7,
      vehicle: "Van",
      bio: "Central hill region coordinator ready for rapid transport and essential kit distribution.",
    },
    // Volunteers awaiting verification
    {
      name: "Tara Vance",
      email: "tara.vance@example.com",
      phone: "+91 97911 01234",
      address: "Katpadi Main Rd, Vellore",
      latitude: 12.9165,
      longitude: 79.1325,
      capabilities: ["WATER", "FOOD"],
      radius: 10.0,
      verified: false,
      available: true,
      completed: 0,
      rating: 5.0,
      vehicle: "Sedan",
      bio: "Applicant from Vellore district with basic emergency logistics supplies.",
    },
    {
      name: "Kevin Sterling",
      email: "kevin.sterling@example.com",
      phone: "+91 97912 12345",
      address: "Trivandrum Rd, Palayamkottai, Tirunelveli",
      latitude: 8.7139,
      longitude: 77.7567,
      capabilities: ["SHELTER", "TRANSPORT"],
      radius: 15.0,
      verified: false,
      available: true,
      completed: 0,
      rating: 5.0,
      vehicle: "Van",
      bio: "Applicant offering 12-passenger van for emergency relocations in Tirunelveli.",
    },
    {
      name: "Hannah Abbott",
      email: "hannah.abbott@example.com",
      phone: "+91 97913 23456",
      address: "Beach Rd, Tuticorin Port, Thoothukudi",
      latitude: 8.7642,
      longitude: 78.1348,
      capabilities: ["WATER", "FOOD", "OTHER"],
      radius: 12.0,
      verified: true,
      available: true,
      completed: 5,
      rating: 4.9,
      vehicle: "SUV",
      bio: "Port district volunteer with potable water tank and dry rations.",
    },
    {
      name: "Lucas Scott",
      email: "lucas.scott@example.com",
      phone: "+91 97914 34567",
      address: "Poonamallee High Rd, Kilpauk, Chennai",
      latitude: 13.0789,
      longitude: 80.2456,
      capabilities: ["TRANSPORT", "SHELTER"],
      radius: 14.0,
      verified: true,
      available: true,
      completed: 4,
      rating: 4.8,
      vehicle: "Crossover",
      bio: "Available for Central Chennai night transit and waterproof shelter kit transport.",
    },
  ];

  const createdVolunteers = [];
  for (const v of volunteerUsers) {
    const user = await prisma.user.create({
      data: {
        name: v.name,
        email: v.email,
        password: defaultPassword,
        role: "VOLUNTEER",
        phone: v.phone,
        address: v.address,
        latitude: v.latitude,
        longitude: v.longitude,
      },
    });

    const profile = await prisma.volunteerProfile.create({
      data: {
        userId: user.id,
        isVerified: v.verified,
        isAvailable: v.available,
        serviceRadiusKm: v.radius,
        capabilities: JSON.stringify(v.capabilities),
        latitude: v.latitude,
        longitude: v.longitude,
        address: v.address,
        completedAssignments: v.completed,
        rating: v.rating,
        bio: v.bio,
        vehicleType: v.vehicle,
        verifiedAt: v.verified ? new Date() : null,
      },
    });

    createdVolunteers.push({ user, profile });
  }

  // 4. Create ~83 Resolved / Historical Requests across Tamil Nadu
  console.log("Generating resolved historical requests in Tamil Nadu...");
  const pastResources = ["WATER", "FOOD", "TRANSPORT", "SHELTER", "OTHER"];
  const pastTitles = [
    "Clean drinking water containers for isolated household",
    "Emergency canned food & baby formula batch",
    "Urgent non-emergency transport to high ground",
    "Tarps and dry blankets for inundated ground floor",
    "Emergency potable water gallon jugs for seniors",
    "Bulk rice, lentils, and high-protein ready meals",
    "Disaster evacuation assistance for disabled resident",
    "Emergency torches, dry clothes, and waterproof tarpaulins",
  ];

  for (let i = 0; i < 83; i++) {
    const resType = pastResources[i % pastResources.length];
    const citizen = createdCitizens[i % createdCitizens.length];
    const volunteer = createdVolunteers[i % 10]; // verified volunteers

    // Distribute across Tamil Nadu hotspots with slight geographical jitter
    const spot = TN_HOTSPOTS[i % TN_HOTSPOTS.length];
    const jitterLat = ((i * 13) % 20 - 10) * 0.0012;
    const jitterLng = ((i * 17) % 20 - 10) * 0.0012;
    const reqLat = parseFloat((spot.lat + jitterLat).toFixed(4));
    const reqLng = parseFloat((spot.lng + jitterLng).toFixed(4));
    const address = `${spot.address}, Tamil Nadu`;

    const daysAgo = Math.floor(i / 10) + 1;
    const createdAt = new Date(Date.now() - (daysAgo * 24 + (i % 24)) * 3600 * 1000);
    const assignedAt = new Date(createdAt.getTime() + 14 * 60 * 1000); // ~14 min response
    const deliveredAt = new Date(assignedAt.getTime() + 28 * 60 * 1000);
    const closedAt = new Date(deliveredAt.getTime() + 8 * 60 * 1000);

    const req = await prisma.emergencyRequest.create({
      data: {
        requesterId: citizen.id,
        resourceType: resType,
        title: pastTitles[i % pastTitles.length],
        description: `Resolved emergency request #${i + 1} at ${spot.city}. All requested supplies verified and delivered on schedule.`,
        quantity: `${((i % 5) + 1) * 4} units`,
        peopleAffected: ((i % 6) + 1) * 2,
        urgency: i % 4 === 0 ? "HIGH" : "NORMAL",
        priorityScore: 45 + (i % 30),
        priorityLevel: i % 4 === 0 ? "HIGH" : "NORMAL",
        status: "CLOSED",
        address,
        latitude: reqLat,
        longitude: reqLng,
        verifiedByAdminId: admin1.id,
        verifiedAt: assignedAt,
        assignedAt,
        deliveredAt,
        confirmedAt: closedAt,
        closedAt,
        createdAt,
      },
    });

    await prisma.assignment.create({
      data: {
        requestId: req.id,
        volunteerId: volunteer.user.id,
        status: "CONFIRMED",
        acceptedAt: assignedAt,
        startedAt: new Date(assignedAt.getTime() + 5 * 60 * 1000),
        deliveredAt,
        completedAt: closedAt,
      },
    });
  }

  // 5. Create ~27 Active Requests across Tamil Nadu
  console.log("Generating 27 active emergency requests in Tamil Nadu...");
  const activeConfigs = [
    // CRITICAL PENDING / VERIFIED
    {
      title: "Drinking water urgent shortage - 8 seniors trapped",
      resource: "WATER",
      quantity: "25 gallons (5x 5gal bottles)",
      people: 8,
      urgency: "CRITICAL",
      score: 95,
      level: "CRITICAL",
      status: "PENDING",
      address: "14 Velachery Main Rd, Velachery, Chennai",
      lat: 12.9791,
      lng: 80.2206,
      desc: "Severe water logging after torrential rain. 8 elderly residents on 1st floor cannot walk down stairs. Need clean drinking water immediately.",
      citizenRequester: createdCitizens[0], // Sarah Jenkins
    },
    {
      title: "Flash flooding shelter needed for family with infant",
      resource: "SHELTER",
      quantity: "Emergency tent & 4 thermal blankets",
      people: 4,
      urgency: "CRITICAL",
      score: 92,
      level: "CRITICAL",
      status: "VERIFIED",
      address: "42 2nd Ave, Anna Nagar, Chennai",
      lat: 13.0850,
      lng: 80.2101,
      desc: "Ground floor flooded to 2.5 feet. Family is on emergency staircase awaiting dry temporary shelter and blankets.",
      citizenRequester: createdCitizens[1], // David Kim
    },
    {
      title: "Emergency evacuation transport for wheelchair user",
      resource: "TRANSPORT",
      quantity: "Wheelchair-accessible transport",
      people: 2,
      urgency: "CRITICAL",
      score: 90,
      level: "CRITICAL",
      status: "VERIFIED",
      address: "88 Luz Church Rd, Mylapore, Chennai",
      lat: 13.0368,
      lng: 80.2676,
      desc: "Power outage and rising water level. Resident needs wheelchair-accessible transit assistance to community relief center.",
      citizenRequester: createdCitizens[2], // Maria Gonzales
    },
    // IN PROGRESS ASSIGNMENTS
    {
      title: "Fresh water packets & baby formula",
      resource: "WATER",
      quantity: "12 water packets + 2 formula tins",
      people: 3,
      urgency: "HIGH",
      score: 78,
      level: "HIGH",
      status: "IN_PROGRESS",
      address: "Mount Poonamallee Rd, Porur, Chennai",
      lat: 13.0382,
      lng: 80.1565,
      desc: "No potable water in apartment block. Mother with 6-month-old infant urgently needs purified water and formula.",
      assignedVolunteer: createdVolunteers[0], // Alex Rivera
      citizenRequester: createdCitizens[0], // Sarah Jenkins
    },
    {
      title: "Hot meals & non-perishable rations",
      resource: "FOOD",
      quantity: "15 hot meal packs",
      people: 7,
      urgency: "HIGH",
      score: 72,
      level: "HIGH",
      status: "IN_PROGRESS",
      address: "Kathipara Junction Area, Guindy, Chennai",
      lat: 13.0067,
      lng: 80.2021,
      desc: "Multiple stranded neighbors gathered on high porch after storm damage. Gas connection cut off.",
      assignedVolunteer: createdVolunteers[1], // Jordan Lee
      citizenRequester: createdCitizens[1], // David Kim
    },
    // ASSIGNED
    {
      title: "Emergency tarps & plastic sheeting for leaking roof",
      resource: "SHELTER",
      quantity: "3 heavy-duty 20x20 tarps",
      people: 5,
      urgency: "HIGH",
      score: 70,
      level: "HIGH",
      status: "ASSIGNED",
      address: "OMR IT Corridor, Sholinganallur, Chennai",
      lat: 12.9010,
      lng: 80.2279,
      desc: "Roof damaged during severe gale winds. Rainwater pouring into living areas and bedrooms.",
      assignedVolunteer: createdVolunteers[2], // Carlos Mendez
      citizenRequester: createdCitizens[2], // Maria Gonzales
    },
    // DELIVERED - Waiting Citizen Confirmation
    {
      title: "Drinking water filtration tablets and 10gal water",
      resource: "WATER",
      quantity: "10 gallons + purification pack",
      people: 4,
      urgency: "HIGH",
      score: 75,
      level: "HIGH",
      status: "DELIVERED",
      address: "14 Velachery Main Rd, Velachery, Chennai",
      lat: 12.9791,
      lng: 80.2206,
      desc: "Supplies delivered by volunteer to the community guard point. Awaiting citizen confirmation.",
      assignedVolunteer: createdVolunteers[0], // Alex Rivera
      citizenRequester: createdCitizens[0], // Sarah Jenkins
    },
  ];

  for (const cfg of activeConfigs) {
    const requester = cfg.citizenRequester || createdCitizens[1];
    const req = await prisma.emergencyRequest.create({
      data: {
        requesterId: requester.id,
        resourceType: cfg.resource,
        title: cfg.title,
        description: cfg.desc,
        quantity: cfg.quantity,
        peopleAffected: cfg.people,
        urgency: cfg.urgency,
        priorityScore: cfg.score,
        priorityLevel: cfg.level,
        status: cfg.status,
        address: cfg.address,
        latitude: cfg.lat,
        longitude: cfg.lng,
        verifiedByAdminId: cfg.status !== "PENDING" ? admin1.id : null,
        verifiedAt: cfg.status !== "PENDING" ? new Date() : null,
        assignedAt:
          cfg.status === "ASSIGNED" ||
          cfg.status === "IN_PROGRESS" ||
          cfg.status === "DELIVERED"
            ? new Date()
            : null,
        deliveredAt: cfg.status === "DELIVERED" ? new Date() : null,
      },
    });

    if (cfg.assignedVolunteer) {
      await prisma.assignment.create({
        data: {
          requestId: req.id,
          volunteerId: cfg.assignedVolunteer.user.id,
          status: cfg.status === "DELIVERED" ? "DELIVERED" : cfg.status === "IN_PROGRESS" ? "IN_PROGRESS" : "ASSIGNED",
          acceptedAt: new Date(Date.now() - 30 * 60 * 1000),
          startedAt: cfg.status === "IN_PROGRESS" || cfg.status === "DELIVERED" ? new Date(Date.now() - 20 * 60 * 1000) : null,
          deliveredAt: cfg.status === "DELIVERED" ? new Date(Date.now() - 5 * 60 * 1000) : null,
        },
      });
    }
  }

  // Generate remaining active requests across Tamil Nadu to reach exactly 27 active requests
  const remainingCount = 27 - activeConfigs.length;
  for (let i = 0; i < remainingCount; i++) {
    const resTypes = ["WATER", "FOOD", "TRANSPORT", "SHELTER", "OTHER"];
    const statuses = ["PENDING", "VERIFIED", "MATCHING", "ASSIGNED"];
    const priorities = ["NORMAL", "HIGH", "CRITICAL"];

    const rType = resTypes[i % resTypes.length];
    const status = statuses[i % statuses.length];
    const priority = priorities[i % priorities.length];
    const citizen = createdCitizens[(i + 2) % createdCitizens.length];

    const spot = TN_HOTSPOTS[(i + 7) % TN_HOTSPOTS.length];
    const jitterLat = ((i * 11) % 20 - 10) * 0.001;
    const jitterLng = ((i * 13) % 20 - 10) * 0.001;
    const reqLat = parseFloat((spot.lat + jitterLat).toFixed(4));
    const reqLng = parseFloat((spot.lng + jitterLng).toFixed(4));

    await prisma.emergencyRequest.create({
      data: {
        requesterId: citizen.id,
        resourceType: rType,
        title: `${spot.city}: Urgent ${rType} distribution required`,
        description: `Active verified community request for ${rType} in ${spot.city}. Priority neighborhood dispatch active.`,
        quantity: `${(i + 2) * 5} units`,
        peopleAffected: (i % 5) + 2,
        urgency: priority,
        priorityScore: priority === "CRITICAL" ? 88 : priority === "HIGH" ? 68 : 42,
        priorityLevel: priority,
        status: status,
        address: `${spot.address}, Tamil Nadu`,
        latitude: reqLat,
        longitude: reqLng,
        verifiedByAdminId: status !== "PENDING" ? admin1.id : null,
        verifiedAt: status !== "PENDING" ? new Date() : null,
      },
    });
  }

  // 6. Create realistic audit logs
  await prisma.auditLog.createMany({
    data: [
      {
        actorId: admin1.id,
        actorName: admin1.name,
        actorRole: "ADMIN",
        action: "SYSTEM_INITIALIZED",
        entity: "System",
        entityId: "SYS-INIT",
        newValue: "Emergency coordination protocol activated for Tamil Nadu regional disaster command grid",
      },
      {
        actorId: admin1.id,
        actorName: admin1.name,
        actorRole: "ADMIN",
        action: "VOLUNTEER_VERIFIED",
        entity: "VolunteerProfile",
        entityId: createdVolunteers[0].profile.id,
        newValue: "VERIFIED",
      },
      {
        actorId: createdVolunteers[0].user.id,
        actorName: createdVolunteers[0].user.name,
        actorRole: "VOLUNTEER",
        action: "VOLUNTEER_ACCEPTED",
        entity: "Assignment",
        entityId: "ASSIGN-01",
        newValue: "Accepted Water delivery request for Velachery, Chennai district",
      },
    ],
  });

  // 7. Create welcome notifications
  for (const c of createdCitizens) {
    await prisma.notification.create({
      data: {
        userId: c.id,
        title: "Welcome to ResQLink Tamil Nadu",
        message: "When help is nearby, make it reachable. Tap 'Request Emergency Help' whenever urgent assistance is required.",
        type: "INFO",
        link: "/citizen",
      },
    });
  }

  for (const v of createdVolunteers) {
    await prisma.notification.create({
      data: {
        userId: v.user.id,
        title: v.profile.isVerified ? "Responder Status: Active & Verified" : "Verification In Review",
        message: v.profile.isVerified
          ? "You are cleared to accept nearby emergency requests in your Tamil Nadu district. Check your Nearby feed regularly."
          : "Your credentials are being reviewed by the operations team. You will be notified upon verification.",
        type: v.profile.isVerified ? "SUCCESS" : "INFO",
        link: "/volunteer",
      },
    });
  }

  console.log("ResQLink database seeded successfully with Tamil Nadu operational data!");
  console.log(`Created:
    - 2 Admins (demo: demo.admin@example.com)
    - 5 Citizens (demo: demo.citizen@example.com)
    - 14 Volunteers (demo: demo.volunteer@example.com)
    - 27 Active Emergency Requests
    - 83 Resolved Requests
    Password for all demo accounts: password123
  `);
}
