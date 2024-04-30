import * as cheerio from 'cheerio';
import { doRequest, storeId } from './common';
import { RatingOptions } from '../../types';

export default async function ratings(opts: RatingOptions) {
  if (!opts.id) {
    throw new Error('id is required');
  }

  const country = opts.country || 'us';
  const storeFront = storeId(opts.country);
  const idValue = opts.id;
  const url = `https://itunes.apple.com/${country}/customer-reviews/id${idValue}?displayable-kind=11`;
  const html = await doRequest(
    url,
    {
      'X-Apple-Store-Front': `${storeFront},12`,
    },
    opts.requestOptions,
  );

  if (typeof html !== 'string' || html.length === 0) {
    throw new Error('App not found (404)');
  }

  return parseRatings(html);
}

function parseRatings(html: string) {
  const $ = cheerio.load(html);
  const ratingsMatch = $('.rating-count').text().match(/\d+/);
  const ratings = Array.isArray(ratingsMatch) ? parseInt(ratingsMatch[0]) : 0;
  const ratingsByStar = $('.vote .total')
    .map((_, el) => parseInt($(el).text()))
    .get();
  const histogram = ratingsByStar.reduce((acc, ratingsForStar, index) => {
    return { ...acc, [5 - index]: ratingsForStar };
  }, {});

  return { ratings, histogram };
}
