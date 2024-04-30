import * as R from 'ramda';
import { BASE_URL } from './constants';
import { doRequest, lookup, storeId } from './common';

function paginate(num: number, page: number) {
  num = num || 50;
  page = page - 1 || 0;
  const pageStart = num * page;
  const pageEnd = pageStart + num;

  return R.slice(pageStart, pageEnd);
}

export default async function search(opts: any) {
  return new Promise(function (resolve, reject) {
    if (!opts.term) {
      throw Error('term is required');
    }
    const url = BASE_URL + encodeURIComponent(opts.term);
    const STORE_ID = storeId(opts.country);
    const lang = opts.lang || 'en-us';

    doRequest(
      url,
      {
        'X-Apple-Store-Front': `${STORE_ID},24 t:native`,
        'Accept-Language': lang,
      },
      opts.requestOptions,
    )
      .then(JSON.parse)
      .then(
        (response) =>
          (response.bubbles[0] && response.bubbles[0].results) || [],
      )
      .then(paginate(opts.num, opts.page))
      .then(R.pluck('id'))
      .then((ids) => {
        if (!opts.idsOnly) {
          return lookup(
            ids,
            'id',
            opts.country,
            opts.lang,
            opts.requestOptions,
            opts.throttle,
          );
        }
        return ids;
      })
      .then(resolve)
      .catch(reject);
  });
}
