import { defineAction, defineActionErrors, fail } from "@agent-native/core/action";
import { getRequestUserEmail } from "@agent-native/core/server/request-context";
import { assertAccess } from "@agent-native/core/sharing";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";

const errors = defineActionErrors("not_authenticated", "not_found");

const eventStatusSchema = z.enum(["open", "settling"]);

const eventSchema = z.object({
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
  description: "Read one event the caller owns or has been granted access to.",
  errors,
  schema: z.object({
    id: z.string().min(1).describe("Event id"),
  }),
  outputSchema: eventSchema,
  readOnly: true,
  run: async ({ id }) => {
    await assertAccess("event", id, "viewer");
    const email = getRequestUserEmail();
    if (!email) fail("Not authenticated", { errorCode: "not_authenticated", statusCode: 401 });

    const [event] = await getDb()
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
      .where(eq(schema.events.id, id))
      .limit(1);

    if (!event) fail("Event not found", { errorCode: "not_found", statusCode: 404 });

    return {
      id: event.id,
      title: event.title,
      eventDate: event.eventDate,
      totalSpentCents: event.totalSpentCents,
      status: eventStatusSchema.parse(event.status),
      registeredParticipants: event.registeredParticipants,
      guestParticipants: event.guestParticipants,
      role: event.ownerEmail === email ? "organizer" as const : "participant" as const,
    };
  },
});
