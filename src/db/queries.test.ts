// import { describe, it, expect, vi, afterAll, beforeEach } from "vitest";
// import type { Client } from "@libsql/client";

// // ── vi.hoisted() runs before everything, even vi.mock ────────────────────
// // This lets us share a reference to the raw libsql client between the
// // mock factory and the test cleanup/verification code.
// const hoisted = vi.hoisted(() => ({ testClient: null as Client | null }));

// // ── In-memory test database created inside the hoisted vi.mock factory ────
// vi.mock("./drizzle.js", async () => {
//   const { createClient } = await import("@libsql/client");
//   const { drizzle } = await import("drizzle-orm/libsql");
//   const { migrate } = await import("drizzle-orm/libsql/migrator");

//   const { content, contentRelations } = await import("./schema/content.js");
//   const { providerContent, providerContentRelations } =
//     await import("./schema/provider_content.js");
//   const { streams } = await import("./schema/streams.js");
//   const { subtitles } = await import("./schema/subtitles.js");
//   const { kv } = await import("./schema/kv.js");
//   const { ouo, ouoRelations } = await import("./schema/ouo.js");
//   const { mkvdrama, mkvdramaRelations } = await import("./schema/mkvdrama.js");
//   const { job } = await import("./schema/job.js");

//   const client = createClient({ url: "file::memory:" });
//   hoisted.testClient = client;

//   const db = drizzle(client, {
//     schema: {
//       content,
//       providerContent,
//       streams,
//       subtitles,
//       kv,
//       mkvdrama,
//       ouo,
//       job,
//       mkvdramaRelations,
//       ouoRelations,
//       contentRelations,
//       providerContentRelations,
//     },
//   });

//   await migrate(db, { migrationsFolder: "drizzle" });

//   return { db, initMigrations: vi.fn() };
// });

// // Shortcut for test cleanup blocks
// const tc = () => hoisted.testClient!;

// // ── Now import the modules under test ─────────────────────────────────────
// import {
//   upsertContent,
//   getContentByTmdb,
//   getProviderContentsById,
//   getContentJoinProviderById,
//   upsertProviderContent,
//   getProviderContentById,
//   getProviderContent,
//   getCountProviderContent,
//   upsertStream,
//   getStream,
//   getStreamsJoinProvider,
//   getCountStream,
//   upsertSubtitles,
//   getSubtitle,
//   getSubtitlesJoinProvider,
//   getCountSubtitles,
//   setKvs,
//   cleanKv,
// } from "./queries.js";

// import { upsertOuos, getOuo } from "./query/ouo.js";
// import { upsertMkvdrama, getMkvdrama } from "./query/mkvdrama.js";
// import {
//   insertJobs,
//   upsertJobs,
//   getFirstJob,
//   getJobById,
//   deleteJob,
//   countJob,
// } from "./query/job.js";
// import { JOB_STATUS, JOB_TYPE } from "./schema/job.js";

// // ── Helpers ───────────────────────────────────────────────────────────────
// const NOW = Date.now();

// function makeContentDetail(overrides: Record<string, unknown> = {}) {
//   return {
//     id: (overrides.id as string) ?? "c1",
//     title: (overrides.title as string) ?? "Test Drama",
//     year: (overrides.year as number) ?? 2025,
//     type: (overrides.type as "movie" | "series") ?? "series",
//     overview: (overrides.overview as string) ?? "A test overview",
//     imdbId: (overrides.imdbId as string) ?? "tt12345",
//     tmdbId: (overrides.tmdbId as number) ?? 123,
//     tvdbId: (overrides.tvdbId as number) ?? 456,
//     thumbnail:
//       (overrides.thumbnail as string) ?? "https://img.example.com/poster.jpg",
//     logo: (overrides.logo as string) ?? undefined,
//     altTitle: (overrides.altTitle as string) ?? undefined,
//   };
// }

// // ── Tests ─────────────────────────────────────────────────────────────────

// // Helper: delete all tables in FK-safe order (children before parents)
// async function clearAllTables() {
//   await tc().execute("DELETE FROM mkvdrama");
//   await tc().execute("DELETE FROM streams");
//   await tc().execute("DELETE FROM subtitles");
//   await tc().execute("DELETE FROM ouo");
//   await tc().execute("DELETE FROM provider_content");
//   await tc().execute("DELETE FROM content");
//   await tc().execute("DELETE FROM job");
//   await tc().execute("DELETE FROM kv");
// }

// describe("content queries", () => {
//   beforeEach(async () => {
//     await clearAllTables();
//   });

//   it("upsertContent inserts a row", async () => {
//     await upsertContent("c1", makeContentDetail(), 3600_000);

//     const rows = await tc().execute("SELECT * FROM content WHERE id = 'c1'");
//     expect(rows.rows).toHaveLength(1);
//     const row = rows.rows[0] as any;
//     expect(row.title).toBe("Test Drama");
//     expect(row.type).toBe("series");
//     expect(row.tmdb_id).toBe("123");
//   });

//   it("upsertContent updates existing row on conflict", async () => {
//     await upsertContent(
//       "c1",
//       makeContentDetail({ title: "Original" }),
//       3600_000,
//     );
//     await upsertContent(
//       "c1",
//       makeContentDetail({ title: "Updated" }),
//       3600_000,
//     );

//     const rows = await tc().execute("SELECT * FROM content WHERE id = 'c1'");
//     expect(rows.rows).toHaveLength(1);
//     const row = rows.rows[0] as any;
//     expect(row.title).toBe("Updated");
//   });

//   it("getContentByTmdb finds by TMDB id and type", async () => {
//     await upsertContent(
//       "c1",
//       makeContentDetail({ tmdbId: 999, type: "movie" }),
//       3600_000,
//     );

//     const found = await getContentByTmdb("999", "movie");
//     expect(found).toBeDefined();
//     expect(found!.id).toBe("c1");

//     const notFound = await getContentByTmdb("999", "series");
//     expect(notFound).toBeUndefined();
//   });

//   it("getProviderContentsById returns content joined with providerContent", async () => {
//     await upsertContent("c1", makeContentDetail(), 3600_000);
//     await upsertProviderContent({
//       id: "pc1",
//       contentId: "c1",
//       provider: "test",
//       externalId: "ext1",
//       title: "PC Title",
//       year: 2025,
//       type: "series",
//       ttl: 3600,
//     });

//     const result = await getProviderContentsById("pc1");
//     expect(result).toBeDefined();
//     expect(result!.providerContent).toHaveLength(1);
//     expect(result!.providerContent[0].externalId).toBe("ext1");
//   });

//   it("getContentJoinProviderById finds by imdbId", async () => {
//     await upsertContent(
//       "c1",
//       makeContentDetail({ imdbId: "tt11111" }),
//       3600_000,
//     );
//     await upsertProviderContent({
//       id: "pc1",
//       contentId: "c1",
//       provider: "test",
//       externalId: "ext1",
//       title: "PC Title",
//       year: 2025,
//       type: "series",
//       ttl: 3600,
//     });

//     const result = await getContentJoinProviderById("series", "tt11111");
//     expect(result).toBeDefined();
//     expect(result!.providerContent).toHaveLength(1);
//   });
// });

// describe("provider_content queries", () => {
//   beforeEach(async () => {
//     await clearAllTables();
//   });

//   it("upsertProviderContent inserts a row", async () => {
//     await upsertProviderContent({
//       id: "pc1",
//       contentId: "c1",
//       provider: "kisskh",
//       externalId: "ext123",
//       title: "My Show",
//       year: 2024,
//       type: "series" as const,
//       ttl: 7200,
//     });

//     const rows = await tc().execute(
//       "SELECT * FROM provider_content WHERE id = 'pc1'",
//     );
//     expect(rows.rows).toHaveLength(1);
//     const row = rows.rows[0] as any;
//     expect(row.provider).toBe("kisskh");
//     expect(row.external_id).toBe("ext123");
//   });

//   it("getProviderContentById returns the row", async () => {
//     await upsertProviderContent({
//       id: "pc2",
//       contentId: null,
//       provider: "idrama",
//       externalId: "ext456",
//       title: "Other Show",
//       year: 2023,
//       type: "movie" as const,
//       ttl: 3600,
//     });

//     const found = await getProviderContentById("pc2");
//     expect(found).toBeDefined();
//     expect(found!.title).toBe("Other Show");
//   });

//   it("getProviderContent returns the row (alias)", async () => {
//     await upsertProviderContent({
//       id: "pc3",
//       contentId: null,
//       provider: "kkphim",
//       externalId: "ext789",
//       title: "Third Show",
//       year: 2022,
//       type: "series" as const,
//       ttl: 3600,
//     });

//     const found = await getProviderContent("pc3");
//     expect(found).toBeDefined();
//     expect(found!.externalId).toBe("ext789");
//   });

//   it("getCountProviderContent returns count", async () => {
//     await upsertProviderContent({
//       id: "pcA",
//       contentId: null,
//       provider: "a",
//       externalId: "eA",
//       title: "A",
//       year: 2020,
//       type: "movie" as const,
//       ttl: 100,
//     });
//     await upsertProviderContent({
//       id: "pcB",
//       contentId: null,
//       provider: "b",
//       externalId: "eB",
//       title: "B",
//       year: 2021,
//       type: "series" as const,
//       ttl: 100,
//     });

//     const result = await getCountProviderContent();
//     expect(result).toHaveLength(1);
//     expect(Number(result?[0][0]!)).toBe(2);
//   });
// });

// describe("stream queries", () => {
//   const streamBase = {
//     id: "s1",
//     providerContentId: "pc1",
//     provider: "test",
//     season: "1",
//     episode: "2",
//     url: "https://example.com/stream.mp4",
//     ttl: 3600,
//   };

//   beforeEach(async () => {
//     await clearAllTables();
//     // Provider content must exist due to FK
//     await upsertProviderContent({
//       id: "pc1",
//       contentId: null,
//       provider: "test",
//       externalId: "ext1",
//       title: "Show",
//       year: 2025,
//       type: "series" as const,
//       ttl: 3600,
//     });
//   });

//   it("upsertStream inserts a row", async () => {
//     await upsertStream([{ ...streamBase }]);

//     const rows = await tc().execute("SELECT * FROM streams WHERE id = 's1'");
//     expect(rows.rows).toHaveLength(1);
//     const row = rows.rows[0] as any;
//     expect(row.season).toBe("1");
//     expect(row.episode).toBe("2");
//   });

//   it("getStream returns matching row", async () => {
//     await upsertStream([{ ...streamBase }]);

//     const found = await getStream("s1");
//     expect(found).toBeDefined();
//     expect(found!.url).toBe("https://example.com/stream.mp4");
//   });

//   it("getStreamsJoinProvider joins with provider_content", async () => {
//     await upsertStream([{ ...streamBase }]);

//     const rows = await getStreamsJoinProvider("pc1", 1, 2);
//     expect(rows).toHaveLength(1);
//     expect(rows[0].streams.url).toBe("https://example.com/stream.mp4");
//     expect(rows[0].provider_content.title).toBe("Show");
//   });

//   it("getCountStream returns count", async () => {
//     await upsertStream([
//       { ...streamBase, id: "s1", url: "https://a.com/1.mp4" },
//       { ...streamBase, id: "s2", url: "https://a.com/2.mp4" },
//     ]);

//     const result = await getCountStream();
//     expect(Number(result[0].count)).toBe(2);
//   });

//   it("upsertStream updates on conflict by id", async () => {
//     await upsertStream([{ ...streamBase, id: "s1" }]);
//     await upsertStream([{ ...streamBase, id: "s1", resolution: "4K" }]);

//     const rows = await tc().execute("SELECT * FROM streams WHERE id = 's1'");
//     expect(rows.rows).toHaveLength(1);
//   });
// });

// describe("subtitle queries", () => {
//   const subBase = {
//     id: "sub1",
//     providerContentId: "pc1",
//     url: "https://example.com/sub.vtt",
//     lang: "en",
//     season: "1",
//     episode: "2",
//     subtitle: "WEBVTT\n\n1\n00:00:01 --> 00:00:05\nHello",
//     ttl: 3600,
//   };

//   beforeEach(async () => {
//     await clearAllTables();
//     await upsertProviderContent({
//       id: "pc1",
//       contentId: null,
//       provider: "test",
//       externalId: "ext1",
//       title: "Show",
//       year: 2025,
//       type: "series" as const,
//       ttl: 3600,
//     });
//   });

//   it("upsertSubtitles inserts rows", async () => {
//     await upsertSubtitles([{ ...subBase }]);

//     const rows = await tc().execute(
//       "SELECT * FROM subtitles WHERE id = 'sub1'",
//     );
//     expect(rows.rows).toHaveLength(1);
//     const row = rows.rows[0] as any;
//     expect(row.lang).toBe("en");
//   });

//   it("getSubtitle returns matching row", async () => {
//     await upsertSubtitles([{ ...subBase }]);

//     const found = await getSubtitle("sub1");
//     expect(found).toBeDefined();
//     expect(found!.lang).toBe("en");
//   });

//   it("getSubtitlesJoinProvider joins with provider_content", async () => {
//     await upsertSubtitles([{ ...subBase }]);

//     const rows = await getSubtitlesJoinProvider("pc1", 1, 2);
//     expect(rows).toHaveLength(1);
//     expect(rows[0].subtitles.lang).toBe("en");
//     expect(rows[0].provider_content.title).toBe("Show");
//   });

//   it("getCountSubtitles returns count", async () => {
//     await upsertSubtitles([
//       { ...subBase, id: "sub1", url: "https://a.com/1.vtt" },
//       { ...subBase, id: "sub2", url: "https://a.com/2.vtt" },
//     ]);

//     const result = await getCountSubtitles();
//     expect(Number(result[0].count)).toBe(2);
//   });
// });

// describe("kv queries", () => {
//   beforeEach(async () => {
//     await tc().execute("DELETE FROM kv");
//   });

//   it("setKvs inserts rows", async () => {
//     await setKvs([
//       {
//         key: "k1",
//         value: JSON.stringify({ hello: "world" }),
//         size: 100,
//         createdAt: NOW,
//         expiresAt: NOW + 60000,
//       },
//       {
//         key: "k2",
//         value: JSON.stringify({ foo: "bar" }),
//         size: 50,
//         createdAt: NOW,
//         expiresAt: NOW + 60000,
//       },
//     ]);

//     const rows = await tc().execute("SELECT * FROM kv");
//     expect(rows.rows).toHaveLength(2);
//   });

//   it("setKvs updates existing keys", async () => {
//     await setKvs([
//       {
//         key: "k1",
//         value: '"v1"',
//         size: 10,
//         createdAt: NOW,
//         expiresAt: NOW + 60000,
//       },
//     ]);
//     await setKvs([
//       {
//         key: "k1",
//         value: '"v2"',
//         size: 20,
//         createdAt: NOW,
//         expiresAt: NOW + 120000,
//       },
//     ]);

//     const rows = await tc().execute("SELECT * FROM kv");
//     expect(rows.rows).toHaveLength(1);
//     const row = rows.rows[0] as any;
//     expect(row.value).toBe('"v2"');
//     expect(row.size).toBe(20);
//   });

//   it("cleanKv removes expired entries", async () => {
//     const pastExpiry = NOW - 60000; // already expired
//     await setKvs([
//       {
//         key: "k1",
//         value: '"v1"',
//         size: 10,
//         createdAt: NOW,
//         expiresAt: pastExpiry,
//       },
//       {
//         key: "k2",
//         value: '"v2"',
//         size: 10,
//         createdAt: NOW,
//         expiresAt: NOW + 60000,
//       },
//     ]);

//     await cleanKv();

//     const rows = await tc().execute("SELECT * FROM kv");
//     expect(rows.rows).toHaveLength(1);
//     expect((rows.rows[0] as any).key).toBe("k2");
//   });
// });

// describe("ouo queries", () => {
//   beforeEach(async () => {
//     await tc().execute("DELETE FROM ouo");
//   });

//   it("upsertOuos inserts rows", async () => {
//     await upsertOuos([
//       {
//         id: "o1",
//         originalUrl: "https://x.com/a",
//         redirectedUrl: "https://y.com/a",
//         createdAt: NOW,
//       },
//       {
//         id: "o2",
//         originalUrl: "https://x.com/b",
//         redirectedUrl: null,
//         createdAt: NOW,
//       },
//     ]);

//     const rows = await tc().execute("SELECT * FROM ouo");
//     expect(rows.rows).toHaveLength(2);
//   });

//   it("getOuo returns matching row", async () => {
//     await upsertOuos([
//       {
//         id: "o1",
//         originalUrl: "https://x.com/a",
//         redirectedUrl: "https://y.com/a",
//         createdAt: NOW,
//       },
//     ]);

//     const found = await getOuo("o1");
//     expect(found).toBeDefined();
//     expect(found!.redirectedUrl).toBe("https://y.com/a");
//   });
// });

// describe("mkvdrama queries", () => {
//   beforeEach(async () => {
//     await clearAllTables();

//     await upsertProviderContent({
//       id: "pc1",
//       contentId: null,
//       provider: "mkvdrama",
//       externalId: "ext1",
//       title: "MkvShow",
//       year: 2025,
//       type: "series" as const,
//       ttl: 3600,
//     });
//   });

//   it("upsertMkvdrama inserts rows", async () => {
//     await upsertMkvdrama([
//       {
//         id: "m1",
//         providerContentId: "pc1",
//         ouoId: null,
//         quality: "1080p",
//         createdAt: NOW,
//         ttl: 3600,
//       },
//     ]);

//     const rows = await tc().execute("SELECT * FROM mkvdrama");
//     expect(rows.rows).toHaveLength(1);
//     const row = rows.rows[0] as any;
//     expect(row.quality).toBe("1080p");
//   });

//   it("getMkvdrama returns rows for providerContentId", async () => {
//     await upsertMkvdrama([
//       {
//         id: "m1",
//         providerContentId: "pc1",
//         ouoId: null,
//         quality: "1080p",
//         createdAt: NOW,
//         ttl: 3600,
//       },
//       {
//         id: "m2",
//         providerContentId: "pc1",
//         ouoId: null,
//         quality: "720p",
//         createdAt: NOW,
//         ttl: 3600,
//       },
//     ]);

//     const rows = await getMkvdrama("pc1");
//     expect(rows).toHaveLength(2);
//   });
// });

// describe("job queries", () => {
//   beforeEach(async () => {
//     await tc().execute("DELETE FROM job");
//   });

//   const makeJob = (overrides: Record<string, unknown> = {}) => ({
//     id: (overrides.id as string) ?? "j1",
//     status: (overrides.status as JOB_STATUS) ?? JOB_STATUS.PENDING,
//     type: JOB_TYPE.MKVDRAMA_STREAM,
//     data: JSON.stringify({ url: "https://example.com" }),
//     createdAt: NOW,
//   });

//   it("insertJobs inserts rows", async () => {
//     await insertJobs([makeJob()]);

//     const rows = await tc().execute("SELECT * FROM job");
//     expect(rows.rows).toHaveLength(1);
//     const row = rows.rows[0] as any;
//     expect(row.status).toBe("pending");
//   });

//   it("upsertJobs inserts or updates", async () => {
//     await upsertJobs([makeJob({ status: JOB_STATUS.PENDING })]);
//     await upsertJobs([makeJob({ status: JOB_STATUS.FAILED })]);

//     const rows = await tc().execute("SELECT * FROM job WHERE id = 'j1'");
//     expect(rows.rows).toHaveLength(1);
//     expect((rows.rows[0] as any).status).toBe("failed");
//   });

//   it("getFirstJob returns the oldest pending job", async () => {
//     await insertJobs([
//       makeJob({ id: "j1", createdAt: NOW }),
//       makeJob({ id: "j2", createdAt: NOW - 5000 }), // older
//       makeJob({ id: "j3", createdAt: NOW, status: JOB_STATUS.FAILED }),
//     ]);

//     const job = await getFirstJob();
//     expect(job).toBeDefined();
//     expect(job!.id).toBe("j2"); // oldest pending
//   });

//   it("getJobById returns specific job", async () => {
//     await insertJobs([makeJob({ id: "target" })]);

//     const found = await getJobById("target");
//     expect(found).toBeDefined();
//     expect(found!.id).toBe("target");
//   });

//   it("deleteJob deletes a job", async () => {
//     await insertJobs([makeJob({ id: "j1" }), makeJob({ id: "j2" })]);

//     await deleteJob("j1");

//     const rows = await tc().execute("SELECT * FROM job");
//     expect(rows.rows).toHaveLength(1);
//     expect((rows.rows[0] as any).id).toBe("j2");
//   });

//   it("countJob counts pending jobs", async () => {
//     await insertJobs([
//       makeJob({ id: "j1", status: JOB_STATUS.PENDING }),
//       makeJob({ id: "j2", status: JOB_STATUS.PENDING }),
//       makeJob({ id: "j3", status: JOB_STATUS.FAILED }),
//     ]);

//     const result = await countJob();
//     expect(result).toHaveLength(1);
//     expect(Number(result[0].count)).toBe(2);
//   });
// });

// // ── Cleanup ────────────────────────────────────────────────────────────────
// afterAll(() => {
//   tc().close();
// });
