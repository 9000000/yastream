import { eq } from "drizzle-orm";
import { supporterDb } from "../../drizzle.js";
import { supporter } from "../schema/supporter.js";

export async function getSupporter(email: string) {
  if (!supporterDb) return;
  const row = supporterDb.query.supporter.findFirst({
    where: eq(supporter.email, email),
  });
  return row;
}
