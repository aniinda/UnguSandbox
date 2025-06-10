import { pgTable, serial, text, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const processingJobs = pgTable('processing_jobs', {
  id: serial('id').primaryKey(),
  jobType: text('job_type').notNull(),
  fileName: text('file_name').notNull(),
  mediaOwner: text('media_owner').notNull(),
  status: text('status').notNull().default('pending'),
  progress: integer('progress').default(0),
  totalChunks: integer('total_chunks').default(0),
  processedChunks: integer('processed_chunks').default(0),
  resultData: jsonb('result_data'),
  errorMessage: text('error_message'),
  extractionNotes: text('extraction_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const ratecardEntries = pgTable('ratecard_entries', {
  id: serial('id').primaryKey(),
  jobId: integer('job_id').references(() => processingJobs.id),
  originalFileName: text('original_file_name').notNull(),
  sourcePage: integer('source_page'),
  mediaType: text('media_type'),
  mediaFormat: text('media_format'),
  placementName: text('placement_name'),
  dimensions: text('dimensions'),
  costMedia4weeks: text('cost_media_4weeks'),
  productionCost: text('production_cost'),
  totalCost: text('total_cost'),
  notes: text('notes'),
  confidence: text('confidence').default('medium'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const insertProcessingJobSchema = createInsertSchema(processingJobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRatecardEntrySchema = createInsertSchema(ratecardEntries).omit({
  id: true,
  createdAt: true,
});

export type ProcessingJob = typeof processingJobs.$inferSelect;
export type NewProcessingJob = z.infer<typeof insertProcessingJobSchema>;
export type RatecardEntry = typeof ratecardEntries.$inferSelect;
export type NewRatecardEntry = z.infer<typeof insertRatecardEntrySchema>;
