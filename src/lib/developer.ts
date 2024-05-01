import { BaseOptions } from './common';
import { CleanedApp, lookup } from './lookup';

export interface DeveloperOptions extends BaseOptions {
  devId: number;
}

export async function developer(opts: DeveloperOptions): Promise<CleanedApp[]> {
  if (!opts.devId) {
    throw new Error('devId is required');
  }

  const results = await lookup(
    [opts.devId.toString()],
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
