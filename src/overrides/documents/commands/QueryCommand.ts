import { DocumentConventions, QueryResult } from 'ravendb';
import { QueryCommand as RavenQueryCommand } from 'ravendb/dist/Documents/Commands/QueryCommand';
import { Stream } from 'readable-stream';
import { StringDecoder } from 'string_decoder';

/**
 * @see https://app.living-specification.com/project/document?id=c916a586-aa25-4c45-a429-2474aeae7b3f&page=c632543d-922f-4b8c-8aaf-5c6464919e71
 */
export class QueryCommand extends RavenQueryCommand {
  public async setResponseAsync(
    bodyStream: Stream,
    fromCache: boolean,
  ): Promise<string> {
    if (!bodyStream) {
      (this.result as QueryResult | null) = null;
      // @ts-ignore
      return;
    }

    let body: string | null = null;
    this.result = await QueryCommand.parseQueryResultResponseAsync(
      bodyStream,
      this._conventions,
      fromCache,
      b => (body = b),
    );

    // @ts-ignore
    return body;
  }

  public static async parseQueryResultResponseAsync(
    bodyStream: Stream,
    conventions: DocumentConventions,
    fromCache: boolean,
    bodyCallback?: (body: string) => void,
  ): Promise<QueryResult> {
    const rawResult = await new Promise<object>((resolve, reject) => {
      const decoder = new StringDecoder();

      let body = '';
      bodyStream
        .on('error', err => reject(err))
        .on('data', data => {
          body += decoder.write(Buffer.from(data));
        })
        .on('end', () => {
          body += decoder.end();

          bodyCallback?.(body);
          resolve(QueryCommand.camelizeKeys(JSON.parse(body)));
        });
    });

    const queryResult = conventions.objectMapper.fromObjectLiteral<QueryResult>(
      rawResult,
      {
        typeName: QueryResult.name,
        nestedTypes: {
          indexTimestamp: 'date',
          lastQueryTime: 'date',
        },
      },
      new Map([[QueryResult.name, QueryResult]]),
    );

    if (fromCache) {
      queryResult.durationInMs = -1;

      if (queryResult.timingsInMs) {
        queryResult.timingsInMs.durationInMs = -1;
      }
    }

    return queryResult;
  }

  private static camelizeKeys(object: {
    [key: string]: unknown;
  }): { [key: string]: unknown } {
    return Object.keys(object).reduce(
      (result, key) => ({
        ...result,
        [key.charAt(0).toLowerCase() + key.slice(1)]: object[key],
      }),
      {},
    );
  }
}
