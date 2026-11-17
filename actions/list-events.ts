import { defineAction, defineActionErrors, fail } from "@agent-native/core/action";
import { getRequestUserEmail } from "@agent-native/core/server/request-context";
import { accessFilter } from "@agent-native/core/sharing";
import { desc } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";

const errors = defineActionErrors("not_authenticated");

const eventStatusSchema = z.enum(["open", "settling"]);

const eventSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  eventDate: z.string(),
  totalSpentCents: z.number(),
  status: eventStatusSchema,
  registeredParticipants: z.number(),
  guestParticipants: z.number(),
  role: z.enum(["organizer", "participant"]),
});

export default defineAction({
  description: "List events the caller owns or can access, newest first.",
  errors,
  schema: z.object({
    limit: z.number().int().min(1).max(100).default(50).describe("Maximum number of events to return"),
  }),
  outputSchema: z.array(eventSummarySchema),
  http: { method: "GET" },
  readOnly: true,
  run: async ({ limit }) => {
    const email = getRequestUserEmail();
    if (!email) fail("Not authenticated", { errorCode: "not_authenticated", statusCode: 401 });

    const rows = await getDb()
      .select({
        id: schema.events.id,
        title: schema.events.title,
        eventDate: schema.events.eventDate,
        totalSpentCents: schema.events.totalSpentCents,
        status: schema.events.status,
        registeredParticipants: schema.events.registeredParticipants,
        guestParticipants: schema.events.guestParticipants,
        ownerEmail: schema.events.ownerEmail,
      })
      .from(schema.events)
      .where(accessFilter(schema.events, schema.eventShares))
      .orderBy(desc(schema.events.createdAt))
      .limit(limit);

    return rows.map(({ ownerEmail, ...event }) => ({
      ...event,
      status: eventStatusSchema.parse(event.status),
      role: ownerEmail === email ? "organizer" as const : "participant" as const,
    }));
  },
});
