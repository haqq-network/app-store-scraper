import { BaseOptions, doRequest } from './common';

export interface PrivacyOptions extends BaseOptions {
  id: number;
}

interface AppDetailsData {
  id: string;
  type: string;
  href: string;
  attributes: AppAttributes;
  relationships: AppRelationships;
  meta: MetaData;
}

interface AppDetailsResponse {
  data: AppDetailsData[];
}

interface AppAttributes {
  privacyDetails: PrivacyDetails;
}

interface PrivacyDetails {
  managePrivacyChoicesUrl: string | null;
  privacyTypes: PrivacyType[];
}

interface PrivacyType {
  privacyType: string;
  identifier: string;
  description: string;
  dataCategories: DataCategory[];
  purposes: Purpose[];
}

interface DataCategory {
  dataCategory: string;
  identifier: string;
  dataTypes: string[];
}

interface Purpose {
  purpose: string;
  identifier: string;
  dataCategories: DataCategory[];
}

interface AppRelationships {
  genres: RelatedResource;
  developer: RelatedResource;
}

interface RelatedResource {
  href: string;
  data: RelatedData[];
}

interface RelatedData {
  id: string;
  type: string;
  href: string;
}

interface MetaData {
  contentVersion: ContentVersion;
}

interface ContentVersion {
  [key: string]: number;
}

export async function privacy(opts: PrivacyOptions) {
  opts.country = opts.country || 'US';

  if (!opts.id) {
    throw new Error('Either id or appId is required');
  }

  // Fetching HTML to extract token
  const tokenUrl = new URL(
    `${opts.country}/app/id${opts.id}`,
    'https://apps.apple.com',
  );
  const html = await doRequest<string>(
    tokenUrl,
    {},
    opts.requestOptions,
    'text',
  );

  if (typeof html !== 'string' || html.length === 0) {
    throw new Error('App not found (404)');
  }

  const tokenMatch = /token%22%3A%22([^%]+)%22%7D/g.exec(html);
  if (!tokenMatch) {
    throw new Error('Failed to extract token');
  }

  const token = tokenMatch[1];

  // Fetching JSON data using extracted token
  const url = new URL(
    `v1/catalog/${opts.country}/apps/${opts.id}`,
    'https://amp-api.apps.apple.com',
  );
  url.searchParams.append('platform', 'web');
  url.searchParams.append('fields', 'privacyDetails');

  const headers = {
    Origin: 'https://apps.apple.com',
    Authorization: `Bearer ${token}`,
  };
  const jsonResponse = await doRequest<AppDetailsResponse>(
    url,
    headers,
    opts.requestOptions,
  );
  // console.log(JSON.stringify(jsonResponse, null, 2));

  if (!jsonResponse || !jsonResponse.data || jsonResponse.data.length === 0) {
    throw new Error('App not found (404)');
  }

  if (!jsonResponse.data[0].attributes.privacyDetails) {
    throw new Error('Privacy details not available');
  }

  return jsonResponse.data[0].attributes.privacyDetails;
}
