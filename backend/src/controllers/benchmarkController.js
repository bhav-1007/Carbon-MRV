import { Benchmark } from "../models/Benchmark.js";
import { EmissionRecord } from "../models/EmissionRecord.js";
import { Organization } from "../models/Organization.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const peerComparison = asyncHandler(async (req, res) => {
  const org = await Organization.findById(req.organizationId);
  const total = await EmissionRecord.aggregate([
    { $match: { organizationId: org._id } },
    { $group: { _id: null, total: { $sum: "$tCO2e" } } }
  ]);
  const population = Math.max((org.studentCount || 0) + (org.employeeCount || 0), 1);
  const ownPerCapita = (total[0]?.total || 0) / population;
  const peers = await Benchmark.find({ type: org.type, region: org.region }).sort({ annualTCO2e: 1 }).limit(10);

  res.json({
    own: { name: org.name, perCapitaTCO2e: Number(ownPerCapita.toFixed(3)) },
    peers: peers.map((peer) => ({
      name: peer.anonymizedName,
      perCapitaTCO2e: Number((peer.annualTCO2e / peer.population).toFixed(3))
    }))
  });
});
