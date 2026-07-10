import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const supporter = sqliteTable("supporter", {
  // 1. Internal Relations
  // id: text("id")
  //   .primaryKey()
  //   .$defaultFn(() => sql`(uuid())`), // Internal Unique ID
  email: text("email").primaryKey(), // Backup identification mapping
  // 2. Billing Provider References
  provider: text("provider", { enum: ["kofi", "stripe", "manual"] }).notNull(),
  providerCustomerId: text("provider_customer_id"), // Stripe Customer ID or Ko-fi Email/Username
  providerSubscriptionId: text("provider_subscription_id").unique(), // Stripe Sub ID or Ko-fi Transaction ID

  // 3. Core Tier Details
  tierName: text("tier_name").notNull(), // e.g., "Premium Tier", "Trial Tier"
  status: text("status", {
    enum: ["active", "trialing", "past_due", "canceled", "expired"],
  })
    .notNull()
    .default("active"),

  // 4. Access Window (Your backend reads these to grant access!)
  currentPeriodStart: integer("current_period_start", {
    mode: "timestamp",
  }).notNull(),
  currentPeriodEnd: integer("current_period_end", {
    mode: "timestamp",
  }).notNull(), // Access ends here

  // 5. Metadata / Automation Flags
  cancelAtPeriodEnd: integer("cancel_at_period_end", { mode: "boolean" })
    .notNull()
    .default(false), // Did they hit cancel early?

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
});
