import got, { Response } from 'got';
import throttled from 'throttled-request';
import debug from 'debug';
import { DEFAULT_STORE, LOOKUP_URL, MARKET_CODES } from './constants';

export function cleanApp(app) {
  return {
    id: app.trackId,
    appId: app.bundleId,
    title: app.trackName,
    url: app.trackViewUrl,
    description: app.description,
    icon: app.artworkUrl512 || app.artworkUrl100 || app.artworkUrl60,
    genres: app.genres,
    genreIds: app.genreIds,
    primaryGenre: app.primaryGenreName,
    primaryGenreId: app.primaryGenreId,
    contentRating: app.contentAdvisoryRating,
    languages: app.languageCodesISO2A,
    size: app.fileSizeBytes,
    requiredOsVersion: app.minimumOsVersion,
    released: app.releaseDate,
    updated: app.currentVersionReleaseDate || app.releaseDate,
    releaseNotes: app.releaseNotes,
    version: app.version,
    price: app.price,
    currency: app.currency,
    free: app.price === 0,
    developerId: app.artistId,
    developer: app.artistName,
    developerUrl: app.artistViewUrl,
    developerWebsite: app.sellerUrl,
    score: app.averageUserRating,
    reviews: app.userRatingCount,
    currentVersionScore: app.averageUserRatingForCurrentVersion,
    currentVersionReviews: app.userRatingCountForCurrentVersion,
    screenshots: app.screenshotUrls,
    ipadScreenshots: app.ipadScreenshotUrls,
    appletvScreenshots: app.appletvScreenshotUrls,
    supportedDevices: app.supportedDevices,
  };
}

export const doRequest = (
  url: string,
  headers: Record<string, any>,
  requestOptions: Record<string, any>,
  limit?: number,
) =>
  new Promise<string>((resolve, reject) => {
    // debug('Making request: %s %j %o', url, headers, requestOptions);

    requestOptions = Object.assign({ method: 'GET' }, requestOptions);

    let req: typeof got = got;
    if (limit) {
      throttled.configure({
        requests: limit,
        milliseconds: 1000,
      });
      req = throttled;
    }

    req(Object.assign({ url, headers }, requestOptions))
      .then((response: Response<string>) => {
        if (response.statusCode >= 400) {
          // debug('Request error', response.body);
          reject({ response });
        } else {
          debug('Finished request');
          resolve(response.body);
        }
      })
      .catch((error: Error) => {
        // debug('Request error', error);
        reject(error);
      });
  });

export function lookup(ids, idField, country, lang, requestOptions, limit) {
  idField = idField || 'id';
  country = country || 'us';
  const langParam = lang ? `&lang=${lang}` : '';
  const joinedIds = ids.join(',');
  const url = `${LOOKUP_URL}?${idField}=${joinedIds}&country=${country}&entity=software${langParam}`;
  return doRequest(url, {}, requestOptions, limit)
    .then(JSON.parse)
    .then((res) =>
      res.results.filter(function (app) {
        return (
          typeof app.wrapperType === 'undefined' ||
          app.wrapperType === 'software'
        );
      }),
    )
    .then((res) => res.map(cleanApp));
}

export function storeId(countryCode: string) {
  return (
    (countryCode && MARKET_CODES[countryCode.toUpperCase()]) || DEFAULT_STORE
  );
}

// module.exports = { cleanApp, lookup, request: doRequest, storeId };
