import {
  AdvancedDocumentQueryOptions,
  DocumentSession as RavenDocumentSession,
  DocumentType,
  IDocumentQuery,
} from 'ravendb';
import { TypeUtil } from 'ravendb/dist/Utility/TypeUtil';
import { DocumentQuery } from './DocumentQuery';

export class DocumentSession extends RavenDocumentSession {
  public documentQuery<T extends object>(
    documentTypeOrOpts: DocumentType<T> | AdvancedDocumentQueryOptions<T>,
  ): IDocumentQuery<T> {
    let opts: AdvancedDocumentQueryOptions<T>;
    if (TypeUtil.isDocumentType(documentTypeOrOpts)) {
      opts = { documentType: documentTypeOrOpts as DocumentType<T> };
    } else {
      opts = documentTypeOrOpts as AdvancedDocumentQueryOptions<T>;
    }

    if (opts.documentType) {
      this.conventions.tryRegisterJsType(opts.documentType);
    }

    const { indexName, collection } = this._processQueryParameters(
      opts,
      this.conventions,
    );

    return new DocumentQuery(
      opts.documentType as DocumentType<T>,
      this,
      indexName,
      collection,
      !!opts.isMapReduce,
    );
  }
}
