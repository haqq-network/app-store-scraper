import * as R from 'ramda';
import { doRequest } from './common';
import { SORT } from './constants';
import { app } from './app';

function ensureArray(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  return [value];
}

function cleanList(results) {
  const reviews = ensureArray(results.feed.entry);

  return reviews.map((review) => ({
    id: review.id.label,
    userName: review.author.name.label,
    userUrl: review.author.uri.label,
    version: review['im:version'].label,
    score: parseInt(review['im:rating'].label),
    title: review.title.label,
    text: review.content.label,
    url: review.link.attributes.href,
    updated: review.updated.label,
  }));
}

export const reviews = (opts) =>
  new Promise((resolve) => {
    validate(opts);

    if (opts.id) {
      resolve(opts.id);
    } else if (opts.appId) {
      resolve(app(opts).then((app) => app.id));
    }
  })
    .then((id) => {
      opts = opts || {};
      opts.sort = opts.sort || SORT.RECENT;
      opts.page = opts.page || 1;
      opts.country = opts.country || 'us';

      const url = `https://itunes.apple.com/${opts.country}/rss/customerreviews/page=${opts.page}/id=${id}/sortby=${opts.sort}/json`;
      return doRequest(url, {}, opts.requestOptions);
    })
    .then(JSON.parse)
    .then(cleanList);

function validate(opts) {
  if (!opts.id && !opts.appId) {
    throw Error('Either id or appId is required');
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
