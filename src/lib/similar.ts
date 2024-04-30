import app from './app';
import { doRequest, lookup, storeId } from './common';
import { BASE_ID_URL } from './constants';
import { SimilarOptions } from '../../types';

export default async function similar(opts: SimilarOptions) {
  if (!opts.id && !opts.appId) {
    throw new Error('Either id or appId is required');
  }

  let id: number;

  if (opts.id) {
    id = opts.id;
  } else {
    const appDetails = await app(opts);
    id = appDetails.id;
  }

  const response = await doRequest(
    `${BASE_ID_URL}${id}`,
    {
      'X-Apple-Store-Front': `${storeId(opts.country)},32`,
    },
    opts.requestOptions,
  );

  const index = response.indexOf('customersAlsoBoughtApps');
  if (index === -1) {
    return [];
  }

  const regExp = /customersAlsoBoughtApps":(.*?\])/g;
  const match = regExp.exec(response);
  const ids = match ? JSON.parse(match[1]) : [];

  const similarApps = await lookup(
    ids,
    'id',
    opts.country,
    opts.lang,
    opts.requestOptions,
  );

  return similarApps;
}
