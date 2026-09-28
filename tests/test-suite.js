const assert = require("assert");
const bcrypt = require("bcryptjs");

// Haversine distance calculator
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Priority calculation with wait-time aging factor
function calculatePriority(input) {
  const { urgency, peopleAffected, resourceType, waitHours = 0 } = input;
  let urgencyScore = 15;
  if (urgency === "CRITICAL") urgencyScore = 40;
  else if (urgency === "HIGH") urgencyScore = 28;

  let peopleScore = 5;
  if (peopleAffected >= 20) peopleScore = 30;
  else if (peopleAffected >= 10) peopleScore = 24;
  else if (peopleAffected >= 5) peopleScore = 18;
  else if (peopleAffected >= 2) peopleScore = 10;

  let resourceScore = 10;
  if (resourceType === "WATER") resourceScore = 20;
  else if (resourceType === "SHELTER") resourceScore = 18;
  else if (resourceType === "FOOD") resourceScore = 15;
  else if (resourceType === "TRANSPORT") resourceScore = 12;
  else resourceScore = 8;

  const waitScore = Math.min(10, Math.floor(Math.max(0, waitHours) * 2.5));

  const totalRaw = urgencyScore + peopleScore + resourceScore + waitScore;
  const priorityScore = Math.min(100, Math.max(10, totalRaw));

  let priorityLevel = "NORMAL";
  if (priorityScore >= 75 || urgency === "CRITICAL") {
    priorityLevel = "CRITICAL";
  } else if (priorityScore >= 45 || urgency === "HIGH") {
    priorityLevel = "HIGH";
  }

  return { priorityScore, priorityLevel, breakdown: { urgencyScore, peopleScore, resourceScore, waitScore } };
}

// Matching Filter & Rank
function filterAndRankCandidates(request, volunteers) {
  const candidates = [];
  for (const vol of volunteers) {
    if (!vol.isVerified) continue;
    if (!vol.isAvailable) continue;
    if (!vol.capabilities.includes(request.resourceType)) continue;

    const distance = calculateHaversineDistance(
      request.latitude,
      request.longitude,
      vol.latitude,
      vol.longitude
    );

    if (distance > vol.serviceRadiusKm) continue;

    const distRatio = Math.max(0, 1 - distance / vol.serviceRadiusKm);
    const score = Math.round(distRatio * 40 + 25 + 20 + 10);
    candidates.push({ volunteer: vol, distance, score });
  }

  return candidates.sort((a, b) => b.score - a.score || a.distance - b.distance);
}

// Valid transitions
const VALID_TRANSITIONS = {
  PENDING: ["VERIFIED", "REJECTED", "CANCELLED"],
  VERIFIED: ["MATCHING", "ASSIGNED", "CANCELLED"],
  MATCHING: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["IN_PROGRESS", "CANCELLED", "MATCHING"],
  IN_PROGRESS: ["DELIVERED", "CANCELLED"],
  DELIVERED: ["CONFIRMED", "CLOSED", "IN_PROGRESS"],
  CONFIRMED: ["CLOSED"],
  CLOSED: [],
  REJECTED: [],
  CANCELLED: [],
};

function isValidTransition(from, to) {
  return (VALID_TRANSITIONS[from] || []).includes(to);
}

async function runTests() {
  console.log("=== RUNNING RESQLINK UNIT & INTEGRATION SUITE ===");

  // 1. Priority Engine Tests
  console.log("\n[TEST 1] Priority Engine Calculation");
  const norm = calculatePriority({ urgency: "NORMAL", peopleAffected: 1, resourceType: "OTHER" });
  assert.strictEqual(norm.priorityLevel, "NORMAL");
  console.log("  ✓ Normal request classified correctly:", norm);

  const high = calculatePriority({ urgency: "HIGH", peopleAffected: 4, resourceType: "FOOD" });
  assert.strictEqual(high.priorityLevel, "HIGH");
  console.log("  ✓ High request classified correctly:", high);

  const crit = calculatePriority({ urgency: "CRITICAL", peopleAffected: 8, resourceType: "WATER" });
  assert.strictEqual(crit.priorityLevel, "CRITICAL");
  console.log("  ✓ Critical request classified correctly:", crit);

  // 2. Matching Engine Filter Tests
  console.log("\n[TEST 2] Matching Engine Filters");
  const testReq = {
    resourceType: "WATER",
    latitude: 13.0827,
    longitude: 80.2707,
  };

  const sampleVolunteers = [
    { id: "1", name: "Eligible Near", isVerified: true, isAvailable: true, capabilities: ["WATER"], latitude: 13.085, longitude: 80.272, serviceRadiusKm: 5 },
    { id: "2", name: "Unverified", isVerified: false, isAvailable: true, capabilities: ["WATER"], latitude: 13.085, longitude: 80.272, serviceRadiusKm: 5 },
    { id: "3", name: "Unavailable", isVerified: true, isAvailable: false, capabilities: ["WATER"], latitude: 13.085, longitude: 80.272, serviceRadiusKm: 5 },
    { id: "4", name: "Wrong Resource", isVerified: true, isAvailable: true, capabilities: ["TRANSPORT"], latitude: 13.085, longitude: 80.272, serviceRadiusKm: 5 },
    { id: "5", name: "Out of Radius", isVerified: true, isAvailable: true, capabilities: ["WATER"], latitude: 13.95, longitude: 80.80, serviceRadiusKm: 5 },
  ];

  const matched = filterAndRankCandidates(testReq, sampleVolunteers);
  assert.strictEqual(matched.length, 1);
  assert.strictEqual(matched[0].volunteer.name, "Eligible Near");
  console.log("  ✓ Candidate filtering passed: Exactly 1 valid candidate matched, 4 ineligible discarded");

  // 3. State Machine Transition Tests
  console.log("\n[TEST 3] Request Lifecycle Transitions");
  assert.strictEqual(isValidTransition("PENDING", "VERIFIED"), true);
  assert.strictEqual(isValidTransition("VERIFIED", "ASSIGNED"), true);
  assert.strictEqual(isValidTransition("ASSIGNED", "IN_PROGRESS"), true);
  assert.strictEqual(isValidTransition("IN_PROGRESS", "DELIVERED"), true);
  assert.strictEqual(isValidTransition("DELIVERED", "CONFIRMED"), true);
  assert.strictEqual(isValidTransition("CONFIRMED", "CLOSED"), true);
  // Invalid jumps blocked
  assert.strictEqual(isValidTransition("PENDING", "CLOSED"), false);
  assert.strictEqual(isValidTransition("ASSIGNED", "CONFIRMED"), false);
  assert.strictEqual(isValidTransition("CLOSED", "PENDING"), false);
  assert.strictEqual(isValidTransition("DELIVERED", "ASSIGNED"), false);
  console.log("  ✓ State machine rules enforced: Valid transitions allowed, invalid jumps blocked");

  // 4. Password Hashing Security Test
  console.log("\n[TEST 4] Password Hashing & Auth Verification");
  const hashed = await bcrypt.hash("demoSecret123", 10);
  assert.strictEqual(await bcrypt.compare("demoSecret123", hashed), true);
  assert.strictEqual(await bcrypt.compare("wrongSecret", hashed), false);
  console.log("  ✓ Bcrypt password hashing and validation verified");

  // 5. Geolocation Calculation Accuracy
  console.log("\n[TEST 5] Haversine Distance Geolocation Engine");
  // Chennai (13.0827, 80.2707) to Tambaram (12.9249, 80.1000) is approx 24-25 km
  const dist = calculateHaversineDistance(13.0827, 80.2707, 12.9249, 80.1000);
  assert.ok(dist >= 23 && dist <= 27, `Distance ${dist}km should be between 23 and 27 km`);
  // Same coordinate should yield 0 km
  const sameDist = calculateHaversineDistance(13.0827, 80.2707, 13.0827, 80.2707);
  assert.strictEqual(sameDist, 0);
  console.log(`  ✓ Haversine distance validated (Chennai to Tambaram: ${dist} km, Zero-distance: ${sameDist} km)`);

  // 6. Starvation Prevention Aging Factor
  console.log("\n[TEST 6] Priority Wait-Time Aging & Starvation Prevention");
  const freshRequest = calculatePriority({ urgency: "NORMAL", peopleAffected: 2, resourceType: "FOOD", waitHours: 0 });
  const agedRequest = calculatePriority({ urgency: "NORMAL", peopleAffected: 2, resourceType: "FOOD", waitHours: 4 });
  assert.ok(agedRequest.priorityScore > freshRequest.priorityScore, "Aged request must receive aging bonus");
  assert.strictEqual(agedRequest.breakdown.waitScore, 10, "4 hours aging must cap at max 10 pts");
  console.log(`  ✓ Aging factor confirmed: 0h wait score=${freshRequest.priorityScore} -> 4h aged score=${agedRequest.priorityScore} (+${agedRequest.breakdown.waitScore} pts)`);

  // 7. Ranking Tiebreaker by Distance
  console.log("\n[TEST 7] Candidate Ranking Order and Distance Tiebreaking");
  const candidatesList = [
    { id: "v1", name: "Farther Volunteer", isVerified: true, isAvailable: true, capabilities: ["WATER"], latitude: 13.090, longitude: 80.280, serviceRadiusKm: 10 },
    { id: "v2", name: "Closer Volunteer", isVerified: true, isAvailable: true, capabilities: ["WATER"], latitude: 13.083, longitude: 80.271, serviceRadiusKm: 10 },
  ];
  const ranked = filterAndRankCandidates(testReq, candidatesList);
  assert.strictEqual(ranked[0].volunteer.name, "Closer Volunteer");
  console.log(`  ✓ Closest candidate prioritized first: ${ranked[0].volunteer.name} (${ranked[0].distance} km) over ${ranked[1].volunteer.name} (${ranked[1].distance} km)`);

  console.log("\n==============================================");
  console.log("  ALL TESTS PASSED SUCCESSFULLY! (7/7 test suites)");
  console.log("==============================================\n");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
