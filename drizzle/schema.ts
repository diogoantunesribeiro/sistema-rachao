import { sql } from "drizzle-orm";
import { integer, pgTable, text } from "drizzle-orm/pg-core";
import {
  createSharesTable,
  ownableColumns,
} from "@agent-native/core/db/schema";

export const events = pgTable("rachaon_events", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  eventDate: text("event_date").notNull(),
  totalSpentCents: integer("total_spent_cents").notNull().default(0),
  status: text("status").notNull().default("open"),
  registeredParticipants: integer("registered_participants").notNull().default(1),
  guestParticipants: integer("guest_participants").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`now()`),
  updatedAt: text("updated_at").notNull().default(sql`now()`),
  ...ownableColumns(),
});

export const eventShares = createSharesTable("rachaon_event_shares");
