import {
  DocumentSession as RavenDocumentSession,
  DocumentStore as RavenDocumentStore,
  IDocumentSession,
  SessionOptions,
} from "ravendb";
import { v4 as uuid } from "uuid";
import { DocumentSession } from "./session/DocumentSession";

export default class DocumentStore extends RavenDocumentStore {
  // Overridden to be able to return the custom document session, everything
  // else copied over from the client.
  public openSession(
    databaseOrSessionOptions: string | SessionOptions = {
      database: this.database,
    }
  ): IDocumentSession {
    this.assertInitialized();
    this._ensureNotDisposed();

    if (typeof databaseOrSessionOptions === "string") {
      return this.openSession({ database: databaseOrSessionOptions });
    }

    const sessionId = uuid();
    const session = this.createDocumentSession(
      sessionId,
      databaseOrSessionOptions
    );
    this._registerEvents(session);
    this.emit("sessionCreated", { session });
    return session;
  }

  protected createDocumentSession(
    sessionId: string,
    sessionOptions: SessionOptions
  ): RavenDocumentSession {
    return new DocumentSession(this, sessionId, sessionOptions);
  }
}
