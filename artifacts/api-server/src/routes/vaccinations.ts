import { Router, type IRouter } from "express";
import { db, vaccinationsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/vaccinations", async (req, res): Promise<void> => {
  const vaccinations = await db.select().from(vaccinationsTable).orderBy(desc(vaccinationsTable.createdAt));
  res.json(vaccinations);
});

router.post("/vaccinations", requireAdmin, async (req, res): Promise<void> => {
  const { disease, vaccineName, description, dosesRequired, eligibility, availability, area } = req.body;

  if (!disease || !vaccineName || !description || !eligibility || !availability || !area) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  const [vaccination] = await db.insert(vaccinationsTable).values({
    disease,
    vaccineName,
    description,
    dosesRequired: dosesRequired ?? 1,
    eligibility,
    availability,
    area,
  }).returning();

  res.status(201).json(vaccination);
});

router.put("/vaccinations/:id", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const { disease, vaccineName, description, dosesRequired, eligibility, availability, area } = req.body;

  const [vaccination] = await db.update(vaccinationsTable)
    .set({ disease, vaccineName, description, dosesRequired, eligibility, availability, area })
    .where(eq(vaccinationsTable.id, id))
    .returning();

  if (!vaccination) {
    res.status(404).json({ error: "Vaccination not found" });
    return;
  }

  res.json(vaccination);
});

router.delete("/vaccinations/:id", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  await db.delete(vaccinationsTable).where(eq(vaccinationsTable.id, id));
  res.json({ message: "Vaccination info deleted" });
});

export default router;
