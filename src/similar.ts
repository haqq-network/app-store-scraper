import { app } from './app';
import { doRequest, lookup, storeId } from './common';
import { BASE_ID_URL } from './constants';

export async function similar(opts) {
  return new Promise(function (resolve, reject) {
    if (opts.id) {
      resolve(opts.id);
    } else if (opts.appId) {
      app(opts)
        .then((app) => resolve(app.id))
        .catch(reject);
    } else {
      throw Error('Either id or appId is required');
    }
  })
    .then((id) =>
      doRequest(
        `${BASE_ID_URL}${id}`,
        {
          'X-Apple-Store-Front': `${storeId(opts.country)},32`,
        },
        opts.requestOptions,
      ),
    )
    .then(function (text) {
      const index = text.indexOf('customersAlsoBoughtApps');
      if (index === -1) {
        return [];
      }
      const regExp = /customersAlsoBoughtApps":(.*?\])/g;
      const match = regExp.exec(text);
      const ids = match ? JSON.parse(match[1]) : [];

      return lookup(
        ids,
        'id',
        opts.country,
        opts.lang,
        opts.requestOptions,
        opts.throttle,
      );
    });
}
