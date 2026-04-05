import { Router, type IRouter } from "express";
import Metric from "../models/Metric";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/metrics/diseases", async (req, res): Promise<void> => {
  const diseases = await Metric.distinct("disease");
  res.json(diseases);
});

router.get("/metrics/summary", async (req, res): Promise<void> => {
  const diseases = await Metric.distinct("disease");

  const summaries = await Promise.all(
    diseases.map(async (disease: string) => {
      const rows = await Metric.find({ disease }).sort({ date: -1 });

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

  const filter: Record<string, unknown> = {};
  if (typeof disease === "string" && disease) filter.disease = disease;
  if (typeof metric === "string" && metric) filter.metric = metric;

  const metrics = await Metric.find(filter).sort({ date: -1 });
  res.json(metrics);
});

router.post("/metrics", requireAdmin, async (req, res): Promise<void> => {
  const { disease, metric, value, date, region } = req.body;

  if (!disease || !metric || value === undefined || !date || !region) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  const metricRow = await Metric.create({
    disease,
    metric,
    value: parseFloat(value),
    date,
    region,
  });

  res.status(201).json(metricRow);
});

router.put("/metrics/:id", requireAdmin, async (req, res): Promise<void> => {
  const { id } = req.params;
  const { disease, metric, value, date, region } = req.body;

  const metricRow = await Metric.findByIdAndUpdate(
    id,
    { disease, metric, value: parseFloat(value), date, region },
    { new: true },
  );

  if (!metricRow) {
    res.status(404).json({ error: "Metric not found" });
    return;
  }

  res.json(metricRow);
});

router.delete("/metrics/:id", requireAdmin, async (req, res): Promise<void> => {
  const { id } = req.params;
  await Metric.findByIdAndDelete(id);
  res.json({ message: "Metric deleted" });
});

export default router;
