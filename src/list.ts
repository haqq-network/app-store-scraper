import * as R from 'ramda';
import { doRequest, lookup, storeId } from './common';
import { CATEGORY, COLLECTION } from './constants';

function parseLink(app:any) {
  if (app.link) {
    const linkArray = Array.isArray(app.link) ? app.link : [app.link];
    const link = linkArray.find(((link:any) => link.attributes.rel === 'alternate'));
    
    return link && link.attributes.href;
  }
  return undefined;
}

function cleanApp(app:any) {
  let developerUrl, developerId;
  if (app['im:artist'].attributes) {
    developerUrl = app['im:artist'].attributes.href;

    if (app['im:artist'].attributes.href.includes('/id')) {
      developerId = app['im:artist'].attributes.href
        .split('/id')[1]
        .split('?mt')[0];
    }
  }

  const price = parseFloat(app['im:price'].attributes.amount);
  return {
    id: app.id.attributes['im:id'],
    appId: app.id.attributes['im:bundleId'],
    title: app['im:name'].label,
    icon: app['im:image'][app['im:image'].length - 1].label,
    url: parseLink(app),
    price,
    currency: app['im:price'].attributes.currency,
    free: price === 0,
    description: app.summary ? app.summary.label : undefined,
    developer: app['im:artist'].label,
    developerUrl,
    developerId,
    genre: app.category.attributes.label,
    genreId: app.category.attributes['im:id'],
    released: app['im:releaseDate'].label,
  };
}

function processResults(opts:any) {
  return async function(results:any) {
    const apps = results.feed.entry;

    if (opts.fullDetail) {
      const ids = apps.map((app:any) => app.id.attributes['im:id']);
      return await lookup(
        ids,
        'id',
        opts.country,
        opts.lang,
        opts.requestOptions,
        opts.throttle,
      );
    }

    return apps.map(cleanApp);
  };
}

function validate(opts:any) {
  if (opts.category && !R.includes(opts.category, R.values(CATEGORY))) {
    throw Error('Invalid category ' + opts.category);
  }

  opts.collection = opts.collection || COLLECTION.TOP_FREE_IOS;
  if (!R.includes(opts.collection, R.values(COLLECTION))) {
    throw Error(`Invalid collection ${opts.collection}`);
  }

  opts.num = opts.num || 50;
  if (opts.num > 200) {
    throw Error('Cannot retrieve more than 200 apps');
  }

  opts.country = opts.country || 'us';
}

export default async function list(opts:any) {
  opts = R.clone(opts || {});
  validate(opts);
  const category = opts.category ? `/genre=${opts.category}` : '';
  const STORE_ID = storeId(opts.country);
  const url = `http://ax.itunes.apple.com/WebObjects/MZStoreServices.woa/ws/RSS/${opts.collection}/${category}/limit=${opts.num}/json?s=${STORE_ID}`;

  try {
    const response = await doRequest(url, {}, opts.requestOptions);
    const results = await response.json();
    const processedResults = await processResults(opts)(results);
    
    return processedResults;
  } catch (error) {
    throw error;
  }
}
