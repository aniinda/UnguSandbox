import { processingJobs, ratecardEntries, type ProcessingJob, type NewProcessingJob, type RatecardEntry, type NewRatecardEntry } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Processing Jobs
  createProcessingJob(job: NewProcessingJob): Promise<ProcessingJob>;
  getProcessingJob(id: number): Promise<ProcessingJob | undefined>;
  getProcessingJobs(limit?: number): Promise<ProcessingJob[]>;
  updateProcessingJob(id: number, updates: Partial<ProcessingJob>): Promise<ProcessingJob>;
  
  // Rate Card Entries
  createRatecardEntry(entry: NewRatecardEntry): Promise<RatecardEntry>;
  getRatecardEntriesByJobId(jobId: number): Promise<RatecardEntry[]>;
  getAllRatecardEntries(): Promise<RatecardEntry[]>;
}

export class DatabaseStorage implements IStorage {
  async createProcessingJob(job: NewProcessingJob): Promise<ProcessingJob> {
    const [result] = await db
      .insert(processingJobs)
      .values(job)
      .returning();
    return result;
  }

  async getProcessingJob(id: number): Promise<ProcessingJob | undefined> {
    const [job] = await db
      .select()
      .from(processingJobs)
      .where(eq(processingJobs.id, id));
    return job;
  }

  async getProcessingJobs(limit = 50): Promise<ProcessingJob[]> {
    return await db
      .select()
      .from(processingJobs)
      .orderBy(desc(processingJobs.createdAt))
      .limit(limit);
  }

  async updateProcessingJob(id: number, updates: Partial<ProcessingJob>): Promise<ProcessingJob> {
    const [result] = await db
      .update(processingJobs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(processingJobs.id, id))
      .returning();
    return result;
  }

  async createRatecardEntry(entry: NewRatecardEntry): Promise<RatecardEntry> {
    const [result] = await db
      .insert(ratecardEntries)
      .values(entry)
      .returning();
    return result;
  }

  async getRatecardEntriesByJobId(jobId: number): Promise<RatecardEntry[]> {
    return await db
      .select()
      .from(ratecardEntries)
      .where(eq(ratecardEntries.jobId, jobId));
  }

  async getAllRatecardEntries(): Promise<RatecardEntry[]> {
    return await db
      .select()
      .from(ratecardEntries)
      .orderBy(desc(ratecardEntries.createdAt));
  }
}

export const storage = new DatabaseStorage();
