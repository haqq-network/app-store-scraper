import { lookup } from './common';

export async function developer(opts) {
  return new Promise(function (resolve) {
    if (!opts.devId) {
      throw Error('devId is required');
    }
    resolve(
      lookup(
        [opts.devId],
        'id',
        opts.country,
        opts.lang,
        opts.requestOptions,
        opts.throttle,
      ),
    );
  }).then((results: unknown) => {
    // first result is artist metadata.
    // If missing it's not a developer. If present we slice to skip it
    if ((results as any[]).length === 0) {
      throw Error('Developer not found (404)');
    }

    return results as any[];
  });
}
