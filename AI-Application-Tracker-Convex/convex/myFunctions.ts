import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";

// Write your Convex functions in any file inside this directory (`convex`).
// See https://docs.convex.dev/functions for more.

// Mutation to add or update a job application

export const upsertJobApplication = mutation({
  // Validators for arguments.
  args: {
    email:v.string(),
    company:v.string(),
    role:v.string(),
    application:v.any()
  },

  // Query implementation.
  handler: async (ctx, args) => {

      const existingDoc = await ctx.db.query("job_applications")
    .filter((q: any) => q.eq(q.field("email"), args.email))
    .filter((q: any) => q.eq(q.field("company"), args.company))
    .filter((q: any) => q.eq(q.field("role"), args.role))
    .first();
    //// Read the database as many times as you need here.
    //// See https://docs.convex.dev/database/reading-data.
    if (existingDoc) {
      // Document exists, so update it
      await ctx.db.patch(existingDoc._id, {
        status: args.application.status,
        jobDescriptionLink: args.application.jobDescriptionLink,
        applicationDate: args.application.applicationDate,
        dueDate: args.application.dueDate,
        lastActionDate: args.application.lastActionDate
      });
    } else {
      // Insert a new document if it doesn't exist
      await ctx.db.insert("job_applications", {
        email: args.email,
        company: args.company,
        role: args.role,
        status: args.application.status,
        jobDescriptionLink: args.application.jobDescriptionLink,
        applicationDate: args.application.applicationDate,
        dueDate: args.application.dueDate,
        lastActionDate: args.application.lastActionDate
      });
    }
  },
});

/*
export const upsertJobApplication = mutation(async ({ db }: {db:any}, { email, company, role, application } : { email:string, company:string, role:string, application:any}) => {
  // Check if a document with the same email, company, and role already exists
  const existingDoc = await db.query("job_applications")
    .filter((q: any) => q.eq(q.field("email"), email))
    .filter((q: any) => q.eq(q.field("company"), company))
    .filter((q: any) => q.eq(q.field("role"), role))
    .first();

  if (existingDoc) {
    // Document exists, so update it
    await db.patch(existingDoc._id, {
      status: application.status,
      jobDescriptionLink: application.jobDescriptionLink,
      applicationDate: application.applicationDate,
      dueDate: application.dueDate,
      lastActionDate: application.lastActionDate
    });
  } else {
    // Insert a new document if it doesn't exist
    await db.insert("job_applications", {
      email,
      company,
      role,
      status: application.status,
      jobDescriptionLink: application.jobDescriptionLink,
      applicationDate: application.applicationDate,
      dueDate: application.dueDate,
      lastActionDate: application.lastActionDate
    });
  }
}); */