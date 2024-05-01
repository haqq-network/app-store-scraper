import { app } from './app';
import { BaseOptions, doRequest, storeId } from './common';
import { BASE_ID_URL } from './constants';
import { CleanedApp, lookup } from './lookup';

export interface SimilarOptions extends BaseOptions {
  id?: number;
  appId?: string;
}

export async function similar(opts: SimilarOptions): Promise<CleanedApp[]> {
  if (!opts.id && !opts.appId) {
    throw new Error('Either "id" or "appId" is required.');
  }

  opts.country = opts.country || 'us';

  const id =
    opts.id ??
    (await app(opts).then((details) => {
      return details.id;
    }));

  const responseText = await doRequest<string>(
    `${BASE_ID_URL}${id}`,
    {
      'X-Apple-Store-Front': `${storeId(opts.country)},32`,
    },
    opts.requestOptions,
    'text',
  );

  if (!responseText) {
    throw new Error('No response text.');
  }

  const match = /customersAlsoBoughtApps":(.*?\])/g.exec(responseText);

  if (!match) {
    throw new Error('No similar apps found.');
  }

  try {
    const ids: string[] = JSON.parse(match[1]);

    if (ids.length === 0) {
      return [];
    }

    return await lookup(
      ids,
      'id',
      opts.country,
      opts.lang,
      opts.requestOptions,
    );
  } catch (error: unknown) {
    throw new Error(
      `Error parsing similar apps data: ${(error as Error).message}`,
    );
  }
}
