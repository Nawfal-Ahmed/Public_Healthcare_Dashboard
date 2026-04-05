import { Router, type IRouter } from "express";
import Alert from "../models/Alert";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/alerts", async (req, res): Promise<void> => {
  const alerts = await Alert.find().sort({ createdAt: -1 });
  res.json(alerts.map((alert) => alert.toObject()));
});

router.post("/alerts", requireAdmin, async (req, res): Promise<void> => {
  const { title, message, severity, isActive } = req.body;

  if (!title || !message || !severity) {
    res.status(400).json({ error: "Title, message, and severity are required" });
    return;
  }

  const alert = await Alert.create({
    title,
    message,
    severity,
    isActive: isActive !== false,
  });

  res.status(201).json(alert);
});

router.put("/alerts/:id", requireAdmin, async (req, res): Promise<void> => {
  const { id } = req.params;
  const { title, message, severity, isActive } = req.body;

  const alert = await Alert.findByIdAndUpdate(
    id,
    { title, message, severity, isActive: isActive !== false },
    { new: true },
  );

  if (!alert) {
    res.status(404).json({ error: "Alert not found" });
    return;
  }

  res.json(alert);
});

router.delete("/alerts/:id", requireAdmin, async (req, res): Promise<void> => {
  const { id } = req.params;
  await Alert.findByIdAndDelete(id);
  res.json({ message: "Alert deleted" });
});

export default router;
