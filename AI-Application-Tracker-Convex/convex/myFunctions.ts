import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";

// Write your Convex functions in any file inside this directory (`convex`).
// See https://docs.convex.dev/functions for more.

// Mutation to add or update a job application

// Flattened arguments for upsertJobApplication mutation
export const upsertJobApplication = mutation({
  args: {
    email: v.string(), // Email of the user
    company: v.string(), // Company name
    role: v.string(), // Job role
    status: v.string(), // Status of the application
    jobDescriptionLink: v.optional(v.string()), // Optional job description link
    applicationDate: v.string(), // Date of application
    dueDate: v.optional(v.string()), // Optional due date
    lastActionDate: v.optional(v.string()), // Optional last action date
  },
  handler: async (ctx, args) => {
    const {
      email,
      company,
      role,
      status,
      jobDescriptionLink,
      applicationDate,
      dueDate,
      lastActionDate,
    } = args;

    // Check if a job application already exists for the user, company, and role
    const existingDoc = await ctx.db.query("job_applications")
      .filter(q => q.eq(q.field('email'), email))
      .filter(q => q.eq(q.field('company'), company))
      //.filter(q => q.eq(q.field('role'), role)) Remove filter from row
      .first();

    if (existingDoc) {
      // If the document exists, update it
      await ctx.db.patch(existingDoc._id, {
        status,
        jobDescriptionLink,
        dueDate,
        lastActionDate,
      });
    } else {
      // Insert a new document if it doesn't exist
      await ctx.db.insert("job_applications", {
        email,
        company,
        role,
        status,
        jobDescriptionLink: jobDescriptionLink ?? "",
        applicationDate,
        dueDate,
        lastActionDate,
      });
    }
  },
});

export const getApplications = query({
  // Validators for arguments.
  args: {
    email: v.string(),
  },

  // Query implementation.
  handler: async (ctx, args) => {
    console.log(args.email);
    const doc = await ctx.db
      .query("job_applications")
      .filter((q: any) => q.eq(q.field("email"), args.email))
      .collect();
    console.log(doc);
    return doc;
  },
});

// Mutation to delete a job application based on primary key (email, company, title)
export const deleteJobApplication = mutation({
  args: {
    email: v.string(), // Email of the user
    company: v.string(), // Company name
    role: v.string(), // Job role
    status: v.string(), // Status of the application
    jobDescriptionLink: v.optional(v.string()), // Optional job description link
    applicationDate: v.string(), // Date of application
    dueDate: v.optional(v.string()), // Optional due date
    lastActionDate: v.optional(v.string()), // Optional last action date
  },
  handler: async (ctx, args) => {
    const {
      email,
      company,
      role,
      status,
      jobDescriptionLink,
      applicationDate,
      dueDate,
      lastActionDate,
    } = args;

    // Check if a job application already exists for the user, company, and role
    const existingJob = await ctx.db
      .query("job_applications")
      .filter((q) => q.eq(q.field("email"), email))
      .filter((q) => q.eq(q.field("company"), company))
      .filter((q) => q.eq(q.field("role"), role))
      .first();

    if (existingJob) {
      await ctx.db.delete(existingJob._id);
    }
  },
});
