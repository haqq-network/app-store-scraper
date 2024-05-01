import { BaseOptions, doRequest } from './common';
import { SORT } from './constants';
import { app } from './app';

export interface ReviewOptions extends BaseOptions {
  id?: number;
  appId?: string;
  page?: number;
  sort?: string;
}

interface FeedResponse {
  feed: Feed;
}

interface Feed {
  author: Author;
  entry: Review[];
  updated: Label;
  rights: Label;
  title: Label;
  icon: Label;
  link: Link[];
  id: Label;
}

interface Author {
  name: Label;
  uri: Label;
}

interface Label {
  label: string;
}

interface Review {
  author: ReviewAuthor;
  updated: Label;
  'im:rating': Label;
  'im:version': Label;
  id: Label;
  title: Label;
  content: Content;
  link: Link;
  'im:voteSum': Label;
  'im:contentType': ContentType;
  'im:voteCount': Label;
}

interface ReviewAuthor {
  uri: Label;
  name: Label;
}

interface Content {
  label: string;
  attributes: ContentAttributes;
}

interface ContentAttributes {
  type: string;
}

interface Link {
  attributes: LinkAttributes;
  'im:duration'?: Label;
  'im:assetType'?: string;
}

interface LinkAttributes {
  rel: string;
  type?: string;
  href: string;
  title?: string;
}

interface ContentType {
  attributes: ContentTypeAttributes;
}

interface ContentTypeAttributes {
  term: string;
  label: string;
}

interface CleanedReview {
  id: string;
  userName: string;
  userUrl: string;
  version: string;
  score: number;
  title: string;
  text: string;
  url: string;
  updated: string;
}

function cleanList(results: FeedResponse): CleanedReview[] {
  const reviews = ensureArray(results.feed.entry);
  return reviews.map(
    (review): CleanedReview => ({
      id: review.id.label,
      userName: review.author.name.label,
      userUrl: review.author.uri.label,
      version: review['im:version'].label,
      score: parseInt(review['im:rating'].label, 10), // добавлен второй аргумент в parseInt для ясности
      title: review.title.label,
      text: review.content.label,
      url: review.link.attributes.href,
      updated: review.updated.label,
    }),
  );
}

function ensureArray<T>(input: T | T[]): T[] {
  return Array.isArray(input) ? input : [input];
}

export async function reviews(opts: ReviewOptions) {
  if (!opts.id && !opts.appId) {
    throw new Error('Either id or appId is required');
  }

  const validSortValues = Object.values(SORT);
  if (opts.sort && !validSortValues.includes(opts.sort)) {
    throw new Error('Invalid sort ' + opts.sort);
  }

  if (opts.page && (opts.page < 1 || opts.page > 10)) {
    throw new Error('Page must be between 1 and 10');
  }

  let id: number | undefined;
  if (opts.id) {
    id = opts.id;
  } else if (opts.appId) {
    const appInfo = await app(opts);
    id = appInfo.id;
  }

  opts.sort = opts.sort || SORT.RECENT;
  opts.page = opts.page || 1;
  opts.country = opts.country || 'us';

  const url = new URL(
    `${opts.country}/rss/customerreviews/page=${opts.page}/id=${id}/sortby=${opts.sort}/json`,
    'https://itunes.apple.com',
  );

  try {
    const feedResponse = await doRequest<FeedResponse>(
      url,
      {},
      opts.requestOptions,
    );

    if (!feedResponse || !feedResponse.feed || !feedResponse.feed.entry) {
      throw new Error('No reviews found');
    }

    return cleanList(feedResponse);
  } catch (error: unknown) {
    throw new Error(`Error fetching reviews: ${(error as Error).message}`);
  }
}
