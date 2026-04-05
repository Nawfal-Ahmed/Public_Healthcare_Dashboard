import { Router, type IRouter } from "express";
import { db, metricsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/metrics/diseases", async (req, res): Promise<void> => {
  const rows = await db.selectDistinct({ disease: metricsTable.disease }).from(metricsTable);
  res.json(rows.map((r) => r.disease));
});

router.get("/metrics/summary", async (req, res): Promise<void> => {
  const diseases = await db.selectDistinct({ disease: metricsTable.disease }).from(metricsTable);

  const summaries = await Promise.all(
    diseases.map(async ({ disease }) => {
      const rows = await db.select().from(metricsTable)
        .where(eq(metricsTable.disease, disease))
        .orderBy(desc(metricsTable.date));

      const getLatest = (metric: string) => {
        const row = rows.find((r) => r.metric === metric);
        return row ? row.value : null;
      };

      const lastUpdated = rows.length > 0 ? rows[0].createdAt : null;

      return {
        disease,
        hospitalized: getLatest("hospitalized"),
        recovered: getLatest("recovered"),
        death_rate: getLatest("death_rate"),
        lastUpdated,
      };
    }),
  );

  res.json(summaries);
});

router.get("/metrics", async (req, res): Promise<void> => {
  const { disease, metric } = req.query;

  let query = db.select().from(metricsTable).$dynamic();

  if (typeof disease === "string" && disease) {
    query = query.where(eq(metricsTable.disease, disease));
  }

  if (typeof metric === "string" && metric) {
    query = query.where(eq(metricsTable.metric, metric as "hospitalized" | "recovered" | "death_rate"));
  }

  const metrics = await query.orderBy(desc(metricsTable.date));
  res.json(metrics);
});

router.post("/metrics", requireAdmin, async (req, res): Promise<void> => {
  const { disease, metric, value, date, region } = req.body;

  if (!disease || !metric || value === undefined || !date || !region) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  const [metricRow] = await db.insert(metricsTable).values({
    disease,
    metric,
    value: parseFloat(value),
    date,
    region,
  }).returning();

  res.status(201).json(metricRow);
});

router.put("/metrics/:id", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const { disease, metric, value, date, region } = req.body;

  const [metricRow] = await db.update(metricsTable)
    .set({ disease, metric, value: parseFloat(value), date, region })
    .where(eq(metricsTable.id, id))
    .returning();

  if (!metricRow) {
    res.status(404).json({ error: "Metric not found" });
    return;
  }

  res.json(metricRow);
});

router.delete("/metrics/:id", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  await db.delete(metricsTable).where(eq(metricsTable.id, id));
  res.json({ message: "Metric deleted" });
});

export default router;
