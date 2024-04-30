import { AppOptions } from '../../types';
import common from './common';
import ratings from './ratings';

export default async function app(opts: AppOptions) {
  if (!opts.id && !opts.appId) {
    throw new Error('Either id or appId is required');
  }

  const idField = opts.id ? 'id' : 'bundleId';
  const idValue = opts.id || opts.appId;

  // Performing lookup and optionally ratings concurrently using Promise.all
  const [lookupResult] = await Promise.all([
    common.lookup(
      [idValue],
      idField,
      opts.country,
      opts.lang,
      opts.requestOptions,
    ),
    opts.ratings ? ratings(opts) : Promise.resolve(null), // Execute ratings only if opts.ratings is true
  ]);

  if (lookupResult.length === 0) {
    throw new Error('App not found (404)');
  }

  const result = lookupResult[0];

  // Merge ratings result into the app result if opts.ratings is true
  if (opts.ratings && result) {
    if (!opts.id) {
      opts.id = result.id;
    }
    return { ...result, ...lookupResult[1] }; // Assuming ratingsResult is lookupResult[1]
  }

  return result;
}
