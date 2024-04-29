import memoizee from 'memoizee';
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
} from './src/constants.ts';
import { app } from './src/app.ts';
import { list } from './src/list.ts';
import { search } from './src/search.ts';
import { developer } from './src/developer.ts';
import { privacy } from './src/privacy.ts';
import { suggest } from './src/suggest.ts';
import { similar } from './src/similar.ts';
import { reviews } from './src/reviews.ts';
import { ratings } from './src/ratings.ts';

const cacheOpts = {
  primitive: true,
  normalizer: JSON.stringify,
  maxAge: 1000 * 60 * 5, // cache for 5 minutes
  max: 1000, // save up to 1k results to avoid memory issues
};

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

const doMemoize = (fn) => memoizee(fn, cacheOpts);

const memoizedMethods = Object.fromEntries(
  Object.entries(methods).map(([key, fn]) => [key, doMemoize(fn)]),
);

export const store = {
  memoized: memoizedMethods,
  ...constants,
  ...methods,
};
