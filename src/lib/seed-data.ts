import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

export async function runDatabaseSeed(prisma: PrismaClient) {
  console.log("Seeding ResQLink database...");

  // Clear existing records to ensure fresh demo state
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.deliveryDispute.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.emergencyRequest.deleteMany();
  await prisma.volunteerProfile.deleteMany();
  await prisma.user.deleteMany();

  const defaultPassword = await bcrypt.hash("password123", 10);

  // 1. Create Admins
  const admin1 = await prisma.user.create({
    data: {
      name: "Marcus Vance (Ops Lead)",
      email: "demo.admin@example.com",
      password: defaultPassword,
      role: "ADMIN",
      phone: "+1 (555) 901-2001",
      address: "Emergency Operations Center, Mission St, SF",
      latitude: 37.7749,
      longitude: -122.4194,
    },
  });

  const admin2 = await prisma.user.create({
    data: {
      name: "Elena Rostova (Incident Commander)",
      email: "elena.commander@example.com",
      password: defaultPassword,
      role: "ADMIN",
      phone: "+1 (555) 901-2002",
      address: "Disaster Coordination HQ, San Francisco",
      latitude: 37.7833,
      longitude: -122.4167,
    },
  });

  // 2. Create Citizens
  const citizenUsers = [
    {
      name: "Sarah Jenkins",
      email: "demo.citizen@example.com",
      phone: "+1 (555) 234-5678",
      address: "742 Montgomery St, Financial District, SF",
      latitude: 37.7952,
      longitude: -122.4029,
    },
    {
      name: "David Kim",
      email: "david.kim@example.com",
      phone: "+1 (555) 345-6789",
      address: "1850 Folsom St, Mission District, SF",
      latitude: 37.7675,
      longitude: -122.4158,
    },
    {
      name: "Maria Gonzales",
      email: "maria.gonzales@example.com",
      phone: "+1 (555) 456-7890",
      address: "420 Castro St, Castro, SF",
      latitude: 37.7609,
      longitude: -122.435,
    },
    {
      name: "Robert Chang",
      email: "robert.chang@example.com",
      phone: "+1 (555) 567-8901",
      address: "1250 9th Ave, Inner Sunset, SF",
      latitude: 37.7648,
      longitude: -122.4662,
    },
    {
      name: "Aisha Patel",
      email: "aisha.patel@example.com",
      phone: "+1 (555) 678-9012",
      address: "2100 Chestnut St, Marina District, SF",
      latitude: 37.8005,
      longitude: -122.4371,
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

  // 3. Create Volunteers (14 Volunteers with diverse capabilities and locations)
  const volunteerUsers = [
    {
      name: "Alex Rivera",
      email: "demo.volunteer@example.com",
      phone: "+1 (555) 789-0123",
      address: "500 Howard St, SOMA, SF",
      latitude: 37.7885,
      longitude: -122.3995,
      capabilities: ["WATER", "FOOD", "TRANSPORT"],
      radius: 12.0,
      verified: true,
      available: true,
      completed: 18,
      rating: 4.9,
      vehicle: "SUV 4x4",
      bio: "Equipped with high-capacity cargo vehicle and rapid water purification packs.",
    },
    {
      name: "Jordan Lee",
      email: "jordan.lee@example.com",
      phone: "+1 (555) 890-1234",
      address: "1200 Market St, Civic Center, SF",
      latitude: 37.7785,
      longitude: -122.4168,
      capabilities: ["WATER", "FOOD"],
      radius: 8.0,
      verified: true,
      available: true,
      completed: 12,
      rating: 4.8,
      vehicle: "Cargo Van",
      bio: "Experienced food bank courier and emergency bulk water distributor.",
    },
    {
      name: "Carlos Mendez",
      email: "carlos.mendez@example.com",
      phone: "+1 (555) 901-2345",
      address: "2500 Mission St, Mission, SF",
      latitude: 37.7584,
      longitude: -122.4191,
      capabilities: ["SHELTER", "FOOD", "OTHER"],
      radius: 15.0,
      verified: true,
      available: true,
      completed: 24,
      rating: 5.0,
      vehicle: "Truck",
      bio: "Disaster shelter setup specialist with heavy-duty tarps and emergency cots.",
    },
    {
      name: "Maya Lin",
      email: "maya.lin@example.com",
      phone: "+1 (555) 012-3456",
      address: "700 Haight St, Lower Haight, SF",
      latitude: 37.7719,
      longitude: -122.4312,
      capabilities: ["TRANSPORT", "WATER"],
      radius: 10.0,
      verified: true,
      available: true,
      completed: 9,
      rating: 4.7,
      vehicle: "Electric Minivan",
      bio: "Specializes in vulnerable elderly transport and emergency relocations.",
    },
    {
      name: "Brian O'Connor",
      email: "brian.oconnor@example.com",
      phone: "+1 (555) 123-4560",
      address: "3300 Geary Blvd, Richmond, SF",
      latitude: 37.7816,
      longitude: -122.4547,
      capabilities: ["WATER", "FOOD", "SHELTER"],
      radius: 14.0,
      verified: true,
      available: true,
      completed: 15,
      rating: 4.9,
      vehicle: "Pickup Truck",
      bio: "Coast Guard veteran, certified in logistics and disaster rescue response.",
    },
    {
      name: "Samantha Wright",
      email: "samantha.wright@example.com",
      phone: "+1 (555) 234-5671",
      address: "1500 Bay St, Marina, SF",
      latitude: 37.8042,
      longitude: -122.4285,
      capabilities: ["FOOD", "WATER"],
      radius: 6.0,
      verified: true,
      available: true,
      completed: 7,
      rating: 4.8,
      vehicle: "Hatchback",
      bio: "Neighborhood emergency pantry lead and certified CERT volunteer.",
    },
    {
      name: "Derrick Hayes",
      email: "derrick.hayes@example.com",
      phone: "+1 (555) 345-6782",
      address: "400 Potrero Ave, Potrero Hill, SF",
      latitude: 37.7645,
      longitude: -122.4068,
      capabilities: ["TRANSPORT", "OTHER"],
      radius: 20.0,
      verified: true,
      available: true,
      completed: 11,
      rating: 4.6,
      vehicle: "Heavy Duty Flatbed",
      bio: "Equipped to transport emergency generators, blankets, and dry shelter supplies.",
    },
    {
      name: "Grace Hopper-Wong",
      email: "grace.hw@example.com",
      phone: "+1 (555) 456-7893",
      address: "850 Columbus Ave, North Beach, SF",
      latitude: 37.8021,
      longitude: -122.4115,
      capabilities: ["WATER", "SHELTER", "OTHER"],
      radius: 10.0,
      verified: true,
      available: true,
      completed: 6,
      rating: 5.0,
      vehicle: "Station Wagon",
      bio: "Community organizer with rapid response shelter distribution capacity.",
    },
    {
      name: "Liam Murphy",
      email: "liam.murphy@example.com",
      phone: "+1 (555) 567-8904",
      address: "1000 Ocean Ave, Ingleside, SF",
      latitude: 37.7231,
      longitude: -122.4532,
      capabilities: ["WATER", "FOOD"],
      radius: 12.0,
      verified: true,
      available: true,
      completed: 14,
      rating: 4.9,
      vehicle: "SUV",
      bio: "Experienced winter storm responder with bottled water distribution stocks.",
    },
    {
      name: "Zoe Kravitz-Miller",
      email: "zoe.km@example.com",
      phone: "+1 (555) 678-9015",
      address: "300 16th St, Mission Bay, SF",
      latitude: 37.7684,
      longitude: -122.3912,
      capabilities: ["TRANSPORT", "WATER", "FOOD"],
      radius: 15.0,
      verified: true,
      available: true,
      completed: 8,
      rating: 4.7,
      vehicle: "Van",
      bio: "Fleet coordinator ready for urgent residential evacuations and deliveries.",
    },
    // Volunteers awaiting verification
    {
      name: "Tara Vance",
      email: "tara.vance@example.com",
      phone: "+1 (555) 789-0126",
      address: "650 California St, Nob Hill, SF",
      latitude: 37.7925,
      longitude: -122.4065,
      capabilities: ["WATER", "FOOD"],
      radius: 5.0,
      verified: false, // Pending verification
      available: true,
      completed: 0,
      rating: 5.0,
      vehicle: "Sedan",
      bio: "New volunteer applicant. Red Cross certified first responder.",
    },
    {
      name: "Kevin Sterling",
      email: "kevin.sterling@example.com",
      phone: "+1 (555) 890-1237",
      address: "1400 4th St, Mission Bay, SF",
      latitude: 37.7712,
      longitude: -122.3895,
      capabilities: ["SHELTER", "TRANSPORT"],
      radius: 10.0,
      verified: false, // Pending verification
      available: true,
      completed: 0,
      rating: 5.0,
      vehicle: "Van",
      bio: "Applicant offering 12-passenger van for emergency relocations.",
    },
    {
      name: "Hannah Abbott",
      email: "hannah.abbott@example.com",
      phone: "+1 (555) 901-2348",
      address: "1900 Irving St, Sunset, SF",
      latitude: 37.7634,
      longitude: -122.4789,
      capabilities: ["WATER", "FOOD", "OTHER"],
      radius: 10.0,
      verified: true,
      available: true,
      completed: 5,
      rating: 4.9,
      vehicle: "SUV",
      bio: "Equipped for rapid water deliveries.",
    },
    {
      name: "Lucas Scott",
      email: "lucas.scott@example.com",
      phone: "+1 (555) 012-3459",
      address: "2200 Fillmore St, Pacific Heights, SF",
      latitude: 37.7901,
      longitude: -122.4345,
      capabilities: ["TRANSPORT", "SHELTER"],
      radius: 12.0,
      verified: true,
      available: true,
      completed: 4,
      rating: 4.8,
      vehicle: "Crossover",
      bio: "Available for nighttime transit and shelter gear dispatch.",
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

  // 4. Create ~83 Resolved / Historical Requests (to populate the exact hackathon metrics)
  console.log("Generating resolved historical requests...");
  const pastResources = ["WATER", "FOOD", "TRANSPORT", "SHELTER", "OTHER"];
  const pastTitles = [
    "Clean drinking water containers for family of 4",
    "Emergency canned food & baby formula batch",
    "Urgent non-emergency transport to high ground",
    "Tarps and dry blankets for flooded garage shelter",
    "Emergency potable water gallon jugs for seniors",
    "Bulk rice, beans, and high-protein ready meals",
    "Disaster evacuation assistance for disabled resident",
    "Emergency space heaters and waterproof tarpaulins",
  ];

  for (let i = 0; i < 83; i++) {
    const resType = pastResources[i % pastResources.length];
    const citizen = createdCitizens[i % createdCitizens.length];
    const volunteer = createdVolunteers[i % 10]; // verified volunteers

    // Offsets around SF
    const latOffset = ((i * 17) % 70 - 35) * 0.002;
    const lngOffset = ((i * 23) % 70 - 35) * 0.002;
    const reqLat = 37.7749 + latOffset;
    const reqLng = -122.4194 + lngOffset;

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
        description: `Resolved historical emergency request #${i + 1}. All requested supplies verified and delivered on schedule.`,
        quantity: `${((i % 5) + 1) * 4} units`,
        peopleAffected: ((i % 6) + 1) * 2,
        urgency: i % 4 === 0 ? "HIGH" : "NORMAL",
        priorityScore: 45 + (i % 30),
        priorityLevel: i % 4 === 0 ? "HIGH" : "NORMAL",
        status: "CLOSED",
        address: `${100 + i * 15} Main St, SF Bay Area`,
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

  // 5. Create ~27 Active Requests in various realistic states
  console.log("Generating 27 active emergency requests...");
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
      address: "630 Ellis St, Tenderloin, SF",
      lat: 37.7845,
      lng: -122.4172,
      desc: "Water main shut off after earthquake tremors. 8 elderly residents cannot walk down stairs. Need clean drinking water immediately.",
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
      address: "1420 Folsom St, SOMA, SF",
      lat: 37.7731,
      lng: -122.4124,
      desc: "Ground floor flooded to 2 feet. Family is on emergency staircase awaiting dry temporary shelter supplies.",
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
      address: "3100 24th St, Mission District, SF",
      lat: 37.7525,
      lng: -122.4142,
      desc: "Power outage disabled building elevators. Resident needs transport assistance to community shelter center.",
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
      address: "755 Buena Vista Ave W, Haight, SF",
      lat: 37.7681,
      lng: -122.4412,
      desc: "No potable water in complex. Mother with 6-month-old infant.",
      assignedVolunteer: createdVolunteers[0], // Alex Rivera
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
      address: "480 Potrero Ave, Potrero Hill, SF",
      lat: 37.7638,
      lng: -122.4072,
      desc: "Multiple stranded neighbors gathered on high porch after storm damage.",
      assignedVolunteer: createdVolunteers[1], // Jordan Lee
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
      address: "1620 Lombard St, Marina, SF",
      lat: 37.7998,
      lng: -122.4285,
      desc: "Roof collapsed in storm. Water pouring into bedrooms.",
      assignedVolunteer: createdVolunteers[2], // Carlos Mendez
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
      address: "742 Montgomery St, Financial District, SF",
      lat: 37.7952,
      lng: -122.4029,
      desc: "Supplies delivered by volunteer to the lobby desk. Awaiting citizen confirmation.",
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

  // Generate remaining active requests to reach exactly 27 active requests
  const remainingCount = 27 - activeConfigs.length;
  for (let i = 0; i < remainingCount; i++) {
    const resTypes = ["WATER", "FOOD", "TRANSPORT", "SHELTER", "OTHER"];
    const statuses = ["PENDING", "VERIFIED", "MATCHING", "ASSIGNED"];
    const priorities = ["NORMAL", "HIGH", "CRITICAL"];

    const rType = resTypes[i % resTypes.length];
    const status = statuses[i % statuses.length];
    const priority = priorities[i % priorities.length];
    const citizen = createdCitizens[(i + 2) % createdCitizens.length];

    const latOffset = ((i * 13) % 40 - 20) * 0.003;
    const lngOffset = ((i * 19) % 40 - 20) * 0.003;

    await prisma.emergencyRequest.create({
      data: {
        requesterId: citizen.id,
        resourceType: rType,
        title: `Community Request #${i + 8}: ${rType} distribution required`,
        description: `Active verified community request for ${rType}. Urgent local coordination required.`,
        quantity: `${(i + 2) * 5} units`,
        peopleAffected: (i % 5) + 2,
        urgency: priority,
        priorityScore: priority === "CRITICAL" ? 88 : priority === "HIGH" ? 68 : 42,
        priorityLevel: priority,
        status: status,
        address: `${200 + i * 40} Market St, SF`,
        latitude: 37.7749 + latOffset,
        longitude: -122.4194 + lngOffset,
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
        newValue: "Emergency coordination protocol activated for San Francisco metro district",
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
        newValue: "Accepted Water delivery request for SOMA district",
      },
    ],
  });

  // 7. Create welcome notifications
  for (const c of createdCitizens) {
    await prisma.notification.create({
      data: {
        userId: c.id,
        title: "Welcome to ResQLink",
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
          ? "You are cleared to accept nearby emergency requests. Check your Nearby feed regularly."
          : "Your credentials are being reviewed by the operations team. You will be notified upon verification.",
        type: v.profile.isVerified ? "SUCCESS" : "INFO",
        link: "/volunteer",
      },
    });
  }

  console.log("ResQLink database seeded successfully!");
  console.log(`Created:
    - 2 Admins (demo: demo.admin@example.com)
    - 5 Citizens (demo: demo.citizen@example.com)
    - 14 Volunteers (demo: demo.volunteer@example.com)
    - 27 Active Emergency Requests
    - 83 Resolved Requests
    Password for all demo accounts: password123
  `);
}
