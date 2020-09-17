import {
  IndexQuery,
  InMemoryDocumentSessionOperations,
  QueryOperation as RavenQueryOperation,
} from 'ravendb';
import { QueryCommand as RavenQueryCommand } from 'ravendb/dist/Documents/Commands/QueryCommand';
import { FieldsToFetchToken } from 'ravendb/dist/Documents/Session/Tokens/FieldsToFetchToken';
import { QueryCommand } from '../../commands/QueryCommand';

export class QueryOperation extends RavenQueryOperation {
  constructor(
    private session: InMemoryDocumentSessionOperations,
    indexName: string,
    indexQuery: IndexQuery,
    fieldsToFetch: FieldsToFetchToken,
    disableEntitiesTracking: boolean,
    private metadataOnly: boolean,
    private indexEntriesOnly: boolean,
  ) {
    super(
      session,
      indexName,
      indexQuery,
      fieldsToFetch,
      disableEntitiesTracking,
      metadataOnly,
      indexEntriesOnly,
    );
  }

  public createRequest(): RavenQueryCommand {
    this.session.incrementRequestCount();

    this.logQuery();

    return new QueryCommand(this.session.conventions, this.indexQuery, {
      metadataOnly: this.metadataOnly,
      indexEntriesOnly: this.indexEntriesOnly,
    });
  }
}
