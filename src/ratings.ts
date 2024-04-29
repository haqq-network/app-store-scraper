import * as cheerio from 'cheerio';
import { doRequest, storeId } from './common';

export async function ratings(opts: {
  id: any;
  country: string;
  requestOptions: Record<string, any>;
}) {
  return new Promise(function (resolve) {
    if (!opts.id) {
      throw Error('id is required');
    }

    const country = opts.country || 'us';
    const storeFront = storeId(opts.country);
    const idValue = opts.id;
    const url = `https://itunes.apple.com/${country}/customer-reviews/id${idValue}?displayable-kind=11`;

    resolve(
      doRequest(
        url,
        {
          'X-Apple-Store-Front': `${storeFront},12`,
        },
        opts.requestOptions,
      ),
    );
  }).then((html: unknown) => {
    const parsedHtml = html as string;

    if (parsedHtml.length === 0) {
      throw Error('App not found (404)');
    }

    return parseRatings(parsedHtml);
  });
}

function parseRatings(html: string) {
  const $ = cheerio.load(html);
  const ratingsMatch = $('.rating-count').text().match(/\d+/);
  const ratings = Array.isArray(ratingsMatch) ? parseInt(ratingsMatch[0]) : 0;
  const ratingsByStar = $('.vote .total')
    .map((i, el) => parseInt($(el).text()))
    .get();
  const histogram = ratingsByStar.reduce((acc, ratingsForStar, index) => {
    return Object.assign(acc, { [5 - index]: ratingsForStar });
  }, {});

  return { ratings, histogram };
}
