import { Router, type IRouter } from "express";
import Vaccination from "../models/Vaccination";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/vaccinations", async (req, res): Promise<void> => {
  const vaccinations = await Vaccination.find().sort({ createdAt: -1 });
  res.json(vaccinations);
});

router.post("/vaccinations", requireAdmin, async (req, res): Promise<void> => {
  const { disease, vaccineName, description, dosesRequired, eligibility, availability, area } = req.body;

  if (!disease || !vaccineName || !description || !eligibility || !availability || !area) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  const vaccination = await Vaccination.create({
    disease,
    vaccineName,
    description,
    dosesRequired: dosesRequired ?? 1,
    eligibility,
    availability,
    area,
  });

  res.status(201).json(vaccination);
});

router.put("/vaccinations/:id", requireAdmin, async (req, res): Promise<void> => {
  const { id } = req.params;
  const { disease, vaccineName, description, dosesRequired, eligibility, availability, area } = req.body;

  const vaccination = await Vaccination.findByIdAndUpdate(
    id,
    { disease, vaccineName, description, dosesRequired, eligibility, availability, area },
    { new: true },
  );

  if (!vaccination) {
    res.status(404).json({ error: "Vaccination not found" });
    return;
  }

  res.json(vaccination);
});

router.delete("/vaccinations/:id", requireAdmin, async (req, res): Promise<void> => {
  const { id } = req.params;
  await Vaccination.findByIdAndDelete(id);
  res.json({ message: "Vaccination info deleted" });
});

export default router;
