/**
 * See what the user is currently looking at on screen.
 *
 * Reads and returns the current navigation state from application state.
 *
 * Usage:
 *   pnpm action view-screen
 */

import { defineAction } from "@agent-native/core/action";
import { readAppState } from "@agent-native/core/application-state";
import { assertAccess, accessFilter } from "@agent-native/core/sharing";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db.js";

export default defineAction({
  description:
    "See what the user is currently looking at on screen. Returns the current navigation state for the app canvas plus agent rail. Always call this first before taking any action.",
  schema: z.object({}),
  http: false,
  readOnly: true,
  run: async () => {
    const navigation = await readAppState("navigation");
    const screen: Record<string, unknown> = {};
    if (navigation) screen.navigation = navigation;

    if (navigation && typeof navigation === "object") {
      const state = navigation as Record<string, unknown>;
      if (state.view === "dashboard") {
        screen.events = await getDb()
          .select({
            id: schema.events.id,
            title: schema.events.title,
            eventDate: schema.events.eventDate,
            totalSpentCents: schema.events.totalSpentCents,
            status: schema.events.status,
            registeredParticipants: schema.events.registeredParticipants,
            guestParticipants: schema.events.guestParticipants,
          })
          .from(schema.events)
          .where(accessFilter(schema.events, schema.eventShares))
          .orderBy(desc(schema.events.createdAt))
          .limit(20);
      } else if (state.view === "event" && typeof state.eventId === "string") {
        await assertAccess("event", state.eventId, "viewer");
        const [event] = await getDb()
          .select({
            id: schema.events.id,
            title: schema.events.title,
            eventDate: schema.events.eventDate,
            totalSpentCents: schema.events.totalSpentCents,
            status: schema.events.status,
            registeredParticipants: schema.events.registeredParticipants,
            guestParticipants: schema.events.guestParticipants,
          })
          .from(schema.events)
          .where(eq(schema.events.id, state.eventId))
          .limit(1);
        if (event) screen.event = event;
      }
    }

    if (Object.keys(screen).length === 0) {
      return "No application state found. Is the app running?";
    }
    return screen;
  },
});
