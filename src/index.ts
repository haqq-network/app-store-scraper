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
import { app } from './lib/app';
import { developer } from './lib/developer';
import { list } from './lib/list';
import { privacy } from './lib/privacy';
import { ratings } from './lib/ratings';
import { reviews } from './lib/reviews';
import { search } from './lib/search';
import { similar } from './lib/similar';
import { suggest } from './lib/suggest';

const methods = {
  app,
  ratings,
  developer,
  list,
  privacy,
  reviews,
  search,
  similar,
  suggest,
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
