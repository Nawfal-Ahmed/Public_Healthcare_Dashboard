import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const vaccinationsTable = pgTable("vaccinations", {
  id: serial("id").primaryKey(),
  disease: text("disease").notNull(),
  vaccineName: text("vaccine_name").notNull(),
  description: text("description").notNull(),
  dosesRequired: integer("doses_required").notNull().default(1),
  eligibility: text("eligibility").notNull(),
  availability: text("availability").notNull(),
  area: text("area").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertVaccinationSchema = createInsertSchema(vaccinationsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertVaccination = z.infer<typeof insertVaccinationSchema>;
export type Vaccination = typeof vaccinationsTable.$inferSelect;
