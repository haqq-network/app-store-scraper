'use strict';

import { map } from 'ramda';
import memoizee from 'memoizee';
import constants from './lib/constants';

const methods = {
  app: require('./lib/app'),
  list: require('./lib/list'),
  search: require('./lib/search'),
  developer: require('./lib/developer'),
  privacy: require('./lib/privacy'),
  suggest: require('./lib/suggest'),
  similar: require('./lib/similar'),
  reviews: require('./lib/reviews'),
  ratings: require('./lib/ratings')
};

function memoized (opts) {
  const cacheOpts = Object.assign(
    {
      primitive: true,
      normalizer: JSON.stringify,
      maxAge: 1000 * 60 * 5, // cache for 5 minutes
      max: 1000 // save up to 1k results to avoid memory issues
    },
    opts
  );
  const doMemoize = (fn) => memoizee(fn, cacheOpts);

  return Object.assign({}, constants, map(doMemoize, methods));
}

export default Object.assign({ memoized }, constants, methods);
