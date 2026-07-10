import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { withReplicas } from "drizzle-orm/sqlite-core";
import { Logger } from "../utils/logger.js";
import { content, contentRelations } from "./schema/content.js";
import { job } from "./schema/job.js";
import { kv } from "./schema/kv.js";
import { mkvdrama, mkvdramaRelations } from "./schema/mkvdrama.js";
import { ouo, ouoRelations } from "./schema/ouo.js";
import {
  providerContent,
  providerContentRelations,
} from "./schema/provider_content.js";
import { stream } from "./schema/stream.js";
import { subtitle } from "./schema/subtitle.js";
import { sqlite } from "./sqlite.js";
import { supporter } from "./supporter/schema/supporter.js";

const logger = new Logger("DB");

const main = sqlite?.getDb();
const mainDb = main
  ? drizzle(main, {
      schema: {
        content,
        providerContent,
        streams: stream,
        subtitles: subtitle,
        kv,
        mkvdrama,
        ouo,
        job,
        mkvdramaRelations,
        ouoRelations,
        contentRelations,
        providerContentRelations,
      },
    })
  : null;

const replica = sqlite?.getReplicaDb();
const replicaDb = replica
  ? drizzle(replica, {
      schema: {
        content,
        providerContent,
        streams: stream,
        subtitles: subtitle,
        kv,
        mkvdrama,
        ouo,
        job,
        mkvdramaRelations,
        ouoRelations,
        contentRelations,
        providerContentRelations,
      },
    })
  : null;

const db =
  mainDb != null && replicaDb != null
    ? withReplicas(mainDb, [replicaDb])
    : mainDb != null
      ? mainDb
      : replicaDb != null
        ? replicaDb
        : null;

const supporterDbClient = sqlite?.getSupporterDb();
const supporterDb = supporterDbClient
  ? drizzle(supporterDbClient, {
      schema: {
        supporter,
      },
    })
  : null;

export { db, supporterDb };

export function initMigrations() {
  try {
    if (db) {
      migrate(db, { migrationsFolder: "drizzle/yastream" });
      logger.log("Migration yastream completed");
    } else {
      logger.log("Migration skipped: Database not initialized");
    }
    if (supporterDb) {
      migrate(supporterDb, { migrationsFolder: "drizzle/supporter" });
      logger.log("Migration supporter completed");
    } else {
      logger.log("Migration skipped: Database not initialized");
    }
  } catch (err) {
    logger.log(`Migration skipped: ${err}`);
  }
}
