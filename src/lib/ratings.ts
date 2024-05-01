import cheerio from 'cheerio';
import { BaseOptions, doRequest, storeId } from './common';

export interface RatingOptions extends BaseOptions {
  id: number;
}

interface RatingResult {
  ratings: number;
  histogram: Record<number, number>;
}

function parseRatings(html: string): RatingResult {
  const $ = cheerio.load(html);
  const ratingsMatch = $('.rating-count').text().match(/\d+/);
  const ratings = ratingsMatch ? parseInt(ratingsMatch[0], 10) : 0;
  const ratingsByStar = $('.vote .total')
    .map((_, el) => parseInt($(el).text(), 10))
    .get();
  const histogram = ratingsByStar.reduce(
    (acc, ratingsForStar, index) => ({
      ...acc,
      [5 - index]: ratingsForStar,
    }),
    {},
  );

  return { ratings, histogram };
}

export async function ratings(opts: RatingOptions): Promise<RatingResult> {
  if (!opts.id) {
    throw new Error('id is required');
  }

  const country = opts.country || 'us';
  const storeFront = storeId(country);
  const idValue = opts.id;
  const url = new URL(
    `${country}/customer-reviews/id${idValue}`,
    'https://itunes.apple.com',
  );
  url.searchParams.append('displayable-kind', '11');

  const html = await doRequest<string>(
    url,
    {
      'X-Apple-Store-Front': `${storeFront},12`,
    },
    opts.requestOptions ?? {},
    'text',
  );

  if (typeof html !== 'string' || html.length === 0) {
    throw new Error('App not found (404)');
  }

  return parseRatings(html);
}
