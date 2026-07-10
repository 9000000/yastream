import { createClient, type Client } from "@libsql/client";
import { ENV } from "../utils/env.js";

class DatabaseManager {
  private client: Client | null = null;
  private supporter: Client | null = null;
  private replicaClient: Client | null = null;

  constructor(url: string) {
    // create folder if not exists
    // const dbDir = path.dirname(databaseUrl);
    // if (dbDir && !fs.existsSync(dbDir)) {
    //   fs.mkdirSync(dbDir, { recursive: true });
    // }
    // Prepend file: for local file paths; libsql URLs already have the scheme
    // const url =
    //   databaseUrl.startsWith("file:") || databaseUrl.startsWith("libsql:")
    //     ? databaseUrl
    //     : `file:${databaseUrl}`;
    if (ENV.DATABASE_WRITE_TOKEN) {
      this.client = createClient({
        url: ENV.DATABASE_REMOTE_URL || url,
        tls: ENV.DATABASE_REMOTE_URL.includes("?tls=0") ? false : true,
        authToken: ENV.DATABASE_WRITE_TOKEN,
      });
    }
    if (ENV.DATABASE_READ_TOKEN) {
      this.replicaClient = createClient({
        url,
        syncUrl: ENV.DATABASE_REMOTE_URL,
        tls: url.includes("?tls=0") ? false : true,
        authToken: ENV.DATABASE_READ_TOKEN,
      });
    }

    if (ENV.DATABASE_SUPPORTER_URL) {
      this.supporter = createClient({
        url: ENV.DATABASE_SUPPORTER_URL,
        tls: ENV.DATABASE_SUPPORTER_URL.includes("?tls=0") ? false : true,
        authToken: ENV.DATABASE_SUPPORTER_WRITE_TOKEN,
      });
    }
  }

  public getDb(): Client | null {
    return this.client;
  }

  public getReplicaDb(): Client | null {
    return this.replicaClient;
  }

  public getSupporterDb(): Client | null {
    return this.supporter;
  }

  public close() {
    this.client?.close();
    this.replicaClient?.close();
  }
}

const sqlite = ENV.DATABASE_ENABLED
  ? new DatabaseManager(ENV.DATABASE_URL)
  : null;

export { sqlite };
