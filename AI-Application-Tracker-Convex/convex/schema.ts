// NOTE: You can remove this file. Declaring the shape
// of the database is entirely optional in Convex.
// See https://docs.convex.dev/database/schemas.

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  job_applications: defineTable({
    email: v.string(), // User email (part of the key)
    company: v.string(), // Company (part of the key)
    role: v.string(), // Job role (part of the key)
    status: v.string(), // Other fields (value)
    jobDescriptionLink: v.string(),
    applicationDate: v.string(),
    dueDate: v.optional(v.string()), // Optional field
    lastActionDate: v.optional(v.string()), // Optional field
  }),
});
