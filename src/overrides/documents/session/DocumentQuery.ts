import {
  DocumentQuery as RavenDocumentQuery,
  QueryOperation as RavenQueryOperation,
} from 'ravendb';
import { QueryOperation } from './operations/QueryOperation';

export class DocumentQuery<T extends object> extends RavenDocumentQuery<T> {
  protected _initializeQueryOperation(): RavenQueryOperation {
    return new QueryOperation(
      this._theSession,
      this.indexName,
      this.getIndexQuery(),
      this.fieldsToFetchToken,
      this._disableEntitiesTracking,
      false,
      false,
    );
  }
}
