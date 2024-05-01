import { BaseOptions, doRequest, storeId } from './common';
import { CATEGORY, COLLECTION } from './constants';
import { CleanedApp, lookup } from './lookup';

export interface ListResponseApp {
  'im:name': {
    label: string;
  };
  'im:image': {
    label: string;
    attributes: {
      height: string;
    };
  }[];
  summary: {
    label: string;
  };
  'im:price': {
    label: string;
    attributes: {
      amount: string;
      currency: string;
    };
  };
  'im:contentType': {
    attributes: {
      term: string;
      label: string;
    };
  };
  rights: {
    label: string;
  };
  title: {
    label: string;
  };
  link: AppLink[];
  id: {
    label: string;
    attributes: {
      'im:id': string;
      'im:bundleId': string;
    };
  };
  'im:artist': {
    label: string;
    attributes: {
      href: string;
    };
  };
  category: {
    attributes: {
      'im:id': string;
      term: string;
      scheme: string;
      label: string;
    };
  };
  'im:releaseDate': {
    label: string;
    attributes: {
      label: string;
    };
  };
}

export interface AppLink {
  attributes: {
    rel: string;
    type: string;
    href: string;
  };
  'im:duration'?: {
    label: string;
  };
  'im:assetType'?: string;
}

export interface ListApp {
  id: number;
  appId: string;
  title: string;
  icon: string;
  url: string | undefined;
  price: number;
  currency: string;
  free: boolean;
  description: string;
  developer: string;
  developerUrl: string;
  developerId: number;
  genres: string[];
  genreIds: string[];
  released: string;
}

export interface ListOptions extends BaseOptions {
  collection?: string;
  category: number;
  num: number;
  fullDetail?: boolean;
}

function parseLink(app: ListResponseApp): string | undefined {
  if (app.link) {
    const linkArray = app.link;
    const link = linkArray.find((link) => link.attributes.rel === 'alternate');
    return link?.attributes.href;
  }

  return undefined;
}

function cleanListApp(app: ListResponseApp): ListApp {
  const artist = app['im:artist'];
  const developerUrl = artist.attributes.href;
  const developerId = developerUrl.split('/id')[1].split('?mt')[0];
  const price = parseFloat(app['im:price'].attributes.amount);

  return {
    id: Number.parseInt(app.id.attributes['im:id']),
    appId: app.id.attributes['im:bundleId'],
    title: app['im:name'].label,
    icon: app['im:image'][app['im:image'].length - 1].label,
    url: parseLink(app),
    price,
    currency: app['im:price'].attributes.currency,
    free: price === 0,
    description: app.summary?.label,
    developer: artist.label,
    developerUrl,
    developerId: Number.parseInt(developerId),
    genres: [app.category.attributes.label],
    genreIds: [app.category.attributes['im:id']],
    released: app['im:releaseDate'].label,
  };
}

function processResults(opts: ListOptions) {
  return async function (
    apps: ListResponseApp | ListResponseApp[],
  ): Promise<Array<ListApp | CleanedApp>> {
    const appArray = Array.isArray(apps) ? apps : [apps];
    if (opts.fullDetail) {
      const ids = appArray.map((app) => {
        return app.id.attributes['im:id'];
      });

      return await lookup(
        ids,
        'id',
        opts.country ?? 'us',
        opts.lang,
        opts.requestOptions,
      );
    }

    return appArray.map(cleanListApp);
  };
}

export async function list(opts: ListOptions) {
  if (opts.category && !Object.values(CATEGORY).includes(opts.category)) {
    throw new Error('Invalid category ' + opts.category);
  }

  opts.collection = opts.collection || COLLECTION.TOP_FREE_IOS;
  if (!Object.values(COLLECTION).includes(opts.collection)) {
    throw new Error(`Invalid collection ${opts.collection}`);
  }

  opts.num = opts.num || 50;
  if (opts.num > 200) {
    throw new Error('Cannot retrieve more than 200 apps');
  }

  opts.country = opts.country || 'us';

  const categoryParam = opts.category ? `genre=${opts.category}` : '';
  const STORE_ID = storeId(opts.country);
  const url = new URL(
    `WebObjects/MZStoreServices.woa/ws/RSS/${opts.collection}/${categoryParam}/limit=${opts.num}/json?s=${STORE_ID}`,
    'http://ax.itunes.apple.com',
  );

  const response = await doRequest<{
    feed: { entry: ListResponseApp | ListResponseApp[] };
  }>(url, {}, opts.requestOptions);

  if (!response || !response.feed || !response.feed.entry) {
    throw new Error('No results found');
  }

  const processedResults = await processResults(opts)(response.feed.entry);

  return processedResults;
}
