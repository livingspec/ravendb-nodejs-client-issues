import { DocumentStore, IDocumentStore } from "ravendb";
import { default as CustomDocumentStore } from "../overrides/documents/DocumentStore";
import { Session } from "inspector";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const profilesDir = join("dist", "profiles");
if (!existsSync(profilesDir)) {
  mkdirSync(profilesDir, { recursive: true });
}

Promise.resolve()
  .then(() => profileStockQueryCommand())
  .then(() => profileQueryCommandWithoutStreamJson());

function profileStockQueryCommand() {
  return profileCall("stock", () =>
    executeQuery(
      () => new DocumentStore(process.env.DB_HOST, process.env.DB_NAME)
    )
  );
}

function profileQueryCommandWithoutStreamJson() {
  return profileCall("no-stream-json", () =>
    executeQuery(
      () => new CustomDocumentStore(process.env.DB_HOST, process.env.DB_NAME)
    )
  );
}

async function executeQuery(storeFactory: () => IDocumentStore) {
  const store = storeFactory();
  store.initialize();

  const session = store.openSession({
    noTracking: true,
    database: process.env.DB_NAME,
  });
  await session.query({ collection: "Performance" }).all();

  await store.dispose();
}

function profileCall(name: string, cb: () => Promise<void>) {
  return new Promise((resolve) => {
    const inspectorSession = new Session();
    inspectorSession.connect();

    inspectorSession.post("Profiler.enable", () => {
      inspectorSession.post("Profiler.start", () => {
        cb()
          .then(() => {
            inspectorSession.post("Profiler.stop", (err, { profile }) => {
              // Write profile to disk, upload, etc.
              if (!err) {
                writeFileSync(
                  join(profilesDir, `${name}.cpuprofile`),
                  JSON.stringify(profile)
                );
              }
            });
          })
          .then(resolve);
      });
    });
  });
}
