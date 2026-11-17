import { createGetDb } from "@agent-native/core/db";
import { registerShareableResource } from "@agent-native/core/sharing";
import * as schema from "../drizzle/schema";

export const getDb = createGetDb(schema);
export { schema };

registerShareableResource({
  type: "event",
  resourceTable: schema.events,
  sharesTable: schema.eventShares,
  displayName: "Event",
  titleColumn: "title",
  getResourcePath: (event) => `/events/${event.id}`,
  agentRead: { actions: ["get-event"] },
  allowPublic: false,
  getDb,
});
