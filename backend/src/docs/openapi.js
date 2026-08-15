export const openApiSummary = {
  openapi: "3.0.0",
  info: { title: "Institutional Carbon MRV API", version: "0.1.0" },
  servers: [{ url: "/api/v1" }],
  paths: {
    "/auth/register": { post: { summary: "Register an organization admin" } },
    "/auth/login": { post: { summary: "Login and receive JWT" } },
    "/activity-logs": { get: { summary: "Paginated organization-scoped activity logs" }, post: { summary: "Create activity log and emission record" } },
    "/activity-logs/upload-csv": { post: { summary: "Bulk upload activity logs from CSV" } },
    "/emissions/dashboard": { get: { summary: "Time, department, and scope totals" } },
    "/emissions/audit-trail": { get: { summary: "Hash-chained MRV emission records" } },
    "/emission-factors": { get: { summary: "List versioned factors" }, post: { summary: "Create admin-editable factor" } },
    "/reports": { get: { summary: "List generated reports" }, post: { summary: "Generate PDF report" } },
    "/recommendations/generate": { post: { summary: "Generate ROI-ranked recommendations" } },
    "/simulator/what-if": { post: { summary: "Compute projected emission delta" } },
    "/benchmarks/peer-comparison": { get: { summary: "Per-capita comparison against anonymized peers" } },
    "/leaderboard": { get: { summary: "Department leaderboard with badges" } },
    "/assistant/query": { post: { summary: "Ask natural-language questions about emissions data" } }
  }
};
