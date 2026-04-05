import { Router, type IRouter } from "express";
import Report from "../models/Report";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/reports", requireAdmin, async (req, res): Promise<void> => {
  const reports = await Report.find().populate("userId", "name email").sort({ createdAt: -1 });
  res.json(reports.map((report) => report.toObject()));
});

router.post("/reports", requireAuth, async (req, res): Promise<void> => {
  const { name, date, phoneNumber, symptoms, location, additionalInfo } = req.body;

  if (!name || !date || !phoneNumber || !symptoms || !location) {
    res.status(400).json({ error: "Name, date, phone number, symptoms, and location are required" });
    return;
  }

  const report = await Report.create({
    name,
    date: new Date(date),
    phoneNumber,
    symptoms,
    location,
    additionalInfo: additionalInfo || "",
    userId: req.session.userId,
  });

  res.status(201).json(report);
});

router.delete("/reports/:id", requireAdmin, async (req, res): Promise<void> => {
  const { id } = req.params;

  await Report.findByIdAndDelete(id);
  res.json({ message: "Report deleted" });
});

export default router;