import { lookup } from './common';
import { ratings } from './ratings';

export function app(opts) {
  return new Promise(function (resolve) {
    if (!opts.id && !opts.appId) {
      throw Error('Either id or appId is required');
    }
    const idField = opts.id ? 'id' : 'bundleId';
    const idValue = opts.id || opts.appId;
    resolve(
      lookup(
        [idValue],
        idField,
        opts.country,
        opts.lang,
        opts.requestOptions,
        opts.throttle,
      ),
    );
  }).then((results) => {
    if ((results as any[]).length === 0) {
      throw Error('App not found (404)');
    }

    const result = (results as any[])[0];

    if (opts.ratings) {
      if (!opts.id) {
        opts.id = result.id;
      }
      return ratings(opts).then((ratingsResult) =>
        Object.assign({}, result, ratingsResult),
      );
    }

    return result;
  });
}
