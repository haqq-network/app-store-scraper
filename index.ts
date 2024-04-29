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
} from './src/constants';
import list from './src/list';
import developer from './src/developer';
import privacy from './src/privacy';
import suggest from './src/suggest';
import similar from './src/similar';
import reviews from './src/reviews';
import ratings from './src/ratings';
import app from './src/app';
import search from './src/search';

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

const doMemoize = (fn: any) => memoizee(fn, cacheOpts);

const memoizedMethods = Object.fromEntries(
  Object.entries(methods).map(([key, fn]) => [key, doMemoize(fn)]),
);

const kek = Object.assign({ memoizedMethods }, constants, methods);

export default kek;

// // module.exports = Object.assign({ memoizedMethods }, constants, methods);

// console.log('Hello world!');
