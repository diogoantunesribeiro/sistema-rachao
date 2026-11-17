import { defineAction, defineActionErrors, fail } from "@agent-native/core/action";
import { buildDeepLink, getRequestOrgId, getRequestUserEmail } from "@agent-native/core/server";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";

const errors = defineActionErrors("not_authenticated", "create_failed");

const eventStatusSchema = z.enum(["open", "settling"]);

const eventSchema = z.object({
  id: z.string(),
  title: z.string(),
  eventDate: z.string(),
  totalSpentCents: z.number(),
  status: eventStatusSchema,
  registeredParticipants: z.number(),
  guestParticipants: z.number(),
});

export default defineAction({
  description: "Create a private expense-splitting event owned by the caller.",
  errors,
  schema: z.object({
    title: z.string().trim().min(1).max(120).describe("Event name"),
    eventDate: z.iso.date().describe("Event date in YYYY-MM-DD format"),
  }),
  outputSchema: eventSchema,
  run: async ({ title, eventDate }) => {
    const ownerEmail = getRequestUserEmail();
    if (!ownerEmail) fail("Not authenticated", { errorCode: "not_authenticated", statusCode: 401 });

    const [event] = await getDb()
      .insert(schema.events)
      .values({
        id: crypto.randomUUID(),
        title,
        eventDate,
        ownerEmail,
        orgId: getRequestOrgId(),
        visibility: "private",
      })
      .returning({
        id: schema.events.id,
        title: schema.events.title,
        eventDate: schema.events.eventDate,
        totalSpentCents: schema.events.totalSpentCents,
        status: schema.events.status,
        registeredParticipants: schema.events.registeredParticipants,
        guestParticipants: schema.events.guestParticipants,
      });

    if (!event) {
      fail("Event could not be created", {
        errorCode: "create_failed",
        statusCode: 500,
      });
    }

    return { ...event, status: eventStatusSchema.parse(event.status) };
  },
  link: ({ result: event }) => ({
    url: buildDeepLink({
      app: "Rachão",
      view: "event",
      params: { id: event.id },
      to: `/events/${event.id}`,
    }),
    label: "Open event",
  }),
});
