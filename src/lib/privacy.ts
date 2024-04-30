import { doRequest } from './common';
import { PrivacyOptions } from '../../types';

export default async function privacy(opts: PrivacyOptions) {
  opts.country = opts.country || 'US';

  if (!opts.id) {
    throw new Error('Either id or appId is required');
  }

  // Fetching HTML to extract token
  const tokenUrl = `https://apps.apple.com/${opts.country}/app/id${opts.id}`;
  const html = await doRequest(tokenUrl, {}, opts.requestOptions);

  const regExp = /token%22%3A%22([^%]+)%22%7D/g;
  const match = regExp.exec(html);
  const token = match ? match[1] : null;

  // Fetching JSON data using extracted token
  const url = `https://amp-api.apps.apple.com/v1/catalog/${opts.country}/apps/${opts.id}?platform=web&fields=privacyDetails`;
  const headers = {
    Origin: 'https://apps.apple.com',
    Authorization: `Bearer ${token}`,
  };
  const json = await doRequest(url, headers, opts.requestOptions);

  if (json.length === 0) {
    throw new Error('App not found (404)');
  }

  return JSON.parse(json).data[0].attributes.privacyDetails;
}
