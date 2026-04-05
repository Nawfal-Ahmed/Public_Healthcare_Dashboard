import { Router, type IRouter } from "express";
import { db, alertsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/alerts", async (req, res): Promise<void> => {
  const alerts = await db.select().from(alertsTable).orderBy(desc(alertsTable.createdAt));
  res.json(alerts);
});

router.post("/alerts", requireAdmin, async (req, res): Promise<void> => {
  const { title, message, severity, isActive } = req.body;

  if (!title || !message || !severity) {
    res.status(400).json({ error: "Title, message, and severity are required" });
    return;
  }

  const [alert] = await db.insert(alertsTable).values({
    title,
    message,
    severity,
    isActive: isActive !== false,
  }).returning();

  res.status(201).json(alert);
});

router.put("/alerts/:id", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const { title, message, severity, isActive } = req.body;

  const [alert] = await db.update(alertsTable)
    .set({ title, message, severity, isActive: isActive !== false })
    .where(eq(alertsTable.id, id))
    .returning();

  if (!alert) {
    res.status(404).json({ error: "Alert not found" });
    return;
  }

  res.json(alert);
});

router.delete("/alerts/:id", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  await db.delete(alertsTable).where(eq(alertsTable.id, id));
  res.json({ message: "Alert deleted" });
});

export default router;
