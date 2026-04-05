import { pgTable, text, serial, timestamp, real, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const metricsTable = pgTable("disease_metrics", {
  id: serial("id").primaryKey(),
  disease: text("disease").notNull(),
  metric: text("metric", { enum: ["hospitalized", "recovered", "death_rate"] }).notNull(),
  value: real("value").notNull(),
  date: date("date", { mode: "string" }).notNull(),
  region: text("region").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMetricSchema = createInsertSchema(metricsTable).omit({ id: true, createdAt: true });
export type InsertMetric = z.infer<typeof insertMetricSchema>;
export type DiseaseMetric = typeof metricsTable.$inferSelect;
