import * as R from 'ramda';
import { doRequest } from './common';
import { SORT } from './constants';
import app from './app';
import { ReviewOptions } from '../../types';

interface Author {
  name: { label: string };
  uri: { label: string };
}

interface Link {
  attributes: { href: string };
}

interface Review {
  id: { label: string };
  author: Author;
  'im:version': { label: string };
  'im:rating': { label: string };
  title: { label: string };
  content: { label: string };
  link: Link;
  updated: { label: string };
}

interface Entry {
  entry: Review[];
}

function ensureArray<T>(input: T | T[]): T[] {
  if (Array.isArray(input)) {
    return input;
  }
  return [input];
}

function cleanList(results: { feed: Entry }) {
  const entries = ensureArray(results.feed.entry);

  return entries.map((entry) => ({
    id: entry.id.label,
    userName: entry.author.name.label,
    userUrl: entry.author.uri.label,
    version: entry['im:version'].label,
    score: parseInt(entry['im:rating'].label),
    title: entry.title.label,
    text: entry.content.label,
    url: entry.link.attributes.href,
    updated: entry.updated.label,
  }));
}

export default async function reviews(opts: ReviewOptions) {
  validate(opts);

  let id: number | undefined;
  if (opts.id) {
    id = opts.id;
  } else if (opts.appId) {
    const appInfo = await app(opts);
    id = appInfo.id;
  }

  opts = opts || {};
  opts.sort = opts.sort || SORT.RECENT;
  opts.page = opts.page || 1;
  opts.country = opts.country || 'us';

  const url = `https://itunes.apple.com/${opts.country}/rss/customerreviews/page=${opts.page}/id=${id}/sortby=${opts.sort}/json`;

  try {
    const response = await doRequest(url, {}, opts.requestOptions);
    const parsedResponse = JSON.parse(response);
    return cleanList(parsedResponse);
  } catch (error) {
    throw new Error(`Error fetching reviews: ${error.message}`);
  }
}

function validate(opts: ReviewOptions) {
  if (!opts.id && !opts.appId) {
    throw new Error('Either id or appId is required');
  }

  if (opts.sort && !R.includes(opts.sort, R.values(SORT))) {
    throw new Error('Invalid sort ' + opts.sort);
  }

  if (opts.page && opts.page < 1) {
    throw new Error('Page cannot be lower than 1');
  }

  if (opts.page && opts.page > 10) {
    throw new Error('Page cannot be greater than 10');
  }
}
