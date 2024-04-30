import { DeveloperOptions } from '../../types';
import { lookup } from './common';

export default async function developer(opts: DeveloperOptions) {
  if (!opts.devId) {
    throw new Error('devId is required');
  }

  const results = await lookup(
    [opts.devId],
    'id',
    opts.country,
    opts.lang,
    opts.requestOptions,
  );

  if (results.length === 0) {
    throw new Error('Developer not found (404)');
  }

  return results;
}
