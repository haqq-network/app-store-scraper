import {
  BASE_ID_URL,
  BASE_URL,
  CATEGORY,
  COLLECTION,
  DEFAULT_STORE,
  DEVICE,
  LOOKUP_URL,
  MARKET_CODES,
  SORT,
} from './lib/constants';
import list from './lib/list';
import developer from './lib/developer';
import privacy from './lib/privacy';
import suggest from './lib/suggest';
import similar from './lib/similar';
import reviews from './lib/reviews';
import ratings from './lib/ratings';
import app from './lib/app';
import search from './lib/search';

// const cacheOpts = {
//   primitive: true,
//   normalizer: JSON.stringify,
//   maxAge: 1000 * 60 * 5, // cache for 5 minutes
//   max: 1000, // save up to 1k results to avoid memory issues
// };

const methods = {
  app,
  list,
  search,
  developer,
  privacy,
  suggest,
  similar,
  reviews,
  ratings,
};

const constants = {
  BASE_ID_URL,
  BASE_URL,
  CATEGORY,
  COLLECTION,
  DEFAULT_STORE,
  DEVICE,
  LOOKUP_URL,
  MARKET_CODES,
  SORT,
};

export default {
  ...constants,
  ...methods,
};
